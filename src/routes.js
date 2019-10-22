import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';
import UserMeetupsController from './app/controllers/UserMeetupsController';
import SubscriptionController from './app/controllers/SubscriptionController';
import NotificationController from './app/controllers/NotificationController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

// Route to list meetups
routes.get('/meetups', MeetupController.index);
routes.post('/meetups', MeetupController.store);
// Route to list meetups from logged user
routes.get('/mymeetups', UserMeetupsController.index);
// Route to list specific meetup form logged user
routes.get('/mymeetups/:id', UserMeetupsController.show);
// Route to update meetups
routes.put('/mymeetups/:id', UserMeetupsController.update);
// Route to delete meetups
routes.delete('/mymeetups/:id', UserMeetupsController.delete);

routes.get('/mysubscriptions', SubscriptionController.index);
routes.post('/subscriptions', SubscriptionController.store);
routes.delete('/subscriptions/:id', SubscriptionController.delete);

routes.get('/notifications', NotificationController.index);
routes.put('/notifications/:id', NotificationController.update);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
