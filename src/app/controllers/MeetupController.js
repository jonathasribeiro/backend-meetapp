import * as Yup from 'yup';
import {
    startOfHour,
    startOfDay,
    endOfDay,
    parseISO,
    isBefore,
} from 'date-fns';
import { Op } from 'sequelize';
import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class MeetupController {
    async index(req, res) {
        const { page = 1 } = req.query;
        const { limit = 10 } = req.query;

        const parsedDate = parseISO(req.query.date);

        const meetups = await Meetup.findAndCountAll({
            where: {
                date: {
                    [Op.between]: [
                        startOfDay(parsedDate),
                        endOfDay(parsedDate),
                    ],
                },
            },
            order: ['date'],
            attributes: ['id', 'title', 'description', 'location', 'date'],
            limit,
            offset: (page - 1) * limit,
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

        return res.json(meetups);
    }

    async store(req, res) {
        const schema = Yup.object().shape({
            title: Yup.string().required(),
            description: Yup.string().required(),
            location: Yup.string().required(),
            date: Yup.date().required(),
            banner_id: Yup.number().required(),
        });

        /**
         * Data validation
         */
        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        const { title, description, location, date, banner_id } = req.body;

        const hourStart = startOfHour(parseISO(date));

        /**
         * Check for past dates
         */
        if (isBefore(hourStart, new Date())) {
            return res
                .status(400)
                .json({ error: 'Past dates are not permitted' });
        }

        const meetup = await Meetup.create({
            title,
            description,
            location,
            date,
            banner_id,
            user_id: req.userId,
        });

        return res.json(meetup);
    }
}

export default new MeetupController();
