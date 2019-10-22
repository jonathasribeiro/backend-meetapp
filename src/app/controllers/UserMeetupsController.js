import * as Yup from 'yup';
import { isBefore } from 'date-fns';

import File from '../models/File';
import Meetup from '../models/Meetup';
import User from '../models/User';

class UserMeetupsController {
    async index(req, res) {
        const myMeetups = await Meetup.findAll({
            where: { user_id: req.userId },
            order: ['date'],
            attributes: ['id', 'title', 'description', 'location', 'date'],
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email'],
                    include: [
                        {
                            model: File,
                            as: 'avatar',
                            attributes: ['id', 'url', 'path'],
                        },
                    ],
                },
                {
                    model: File,
                    as: 'banner',
                    attributes: ['id', 'url', 'path'],
                },
            ],
        });

        return res.json(myMeetups);
    }

    async show(req, res) {
        const meetup = await Meetup.findOne({
            where: { id: req.params.id, user_id: req.userId },
            attributes: ['id', 'title', 'description', 'location', 'date'],
            include: [
                {
                    model: File,
                    as: 'banner',
                    attributes: ['id', 'url', 'path'],
                },
            ],
        });

        if (!meetup) {
            return res.status(401).json({
                error: "You can't see meetups that do not belong to you.",
            });
        }

        return res.json(meetup);
    }

    async update(req, res) {
        const schema = Yup.object().shape({
            title: Yup.string(),
            description: Yup.string(),
            location: Yup.string(),
            date: Yup.date(),
            banner_id: Yup.number(),
        });

        /**
         * Data validation
         */
        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        /**
         * Check if meetup belong to logged user
         */
        const meetup = await Meetup.findOne({
            where: { id: req.params.id, user_id: req.userId },
        });

        if (!meetup) {
            return res.status(401).json({
                error: "You can't edit meetups that do not belong to you.",
            });
        }

        const hourStart = Number(meetup.date);
        /**
         * Check for past dates
         */
        if (isBefore(hourStart, new Date().getTime())) {
            return res
                .status(400)
                .json({ error: "You can't update meetups with past dates" });
        }

        const {
            id,
            title,
            description,
            location,
            banner_id,
        } = await meetup.update(req.body);

        return res.json({
            id,
            title,
            description,
            location,
            banner_id,
        });
    }

    async delete(req, res) {
        const meetup = await Meetup.findOne({
            where: { id: req.params.id, user_id: req.userId },
        });

        if (!meetup) {
            return res.status(400).json({ error: 'Meetup not found' });
        }

        const hourStart = Number(meetup.date);

        if (isBefore(hourStart, new Date().getTime())) {
            return res
                .status(401)
                .json({ error: "You can't cancel meetups with past dates." });
        }

        await meetup.destroy();

        return res.json(meetup);
    }
}

export default new UserMeetupsController();
