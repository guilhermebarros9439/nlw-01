import express from 'express';
import multer from 'multer';

import multerConfig from './config/multer';
import { celebrate, Joi } from 'celebrate';

import PointsControllers from './controllers/PointsControllers';
import ItemsControllers from './controllers/ItemsControllers';

const routes = express.Router();
const upload = multer(multerConfig);

const itemsControllers = new ItemsControllers();
const pointsControllers = new PointsControllers();

routes.get('/items', itemsControllers.index);

routes.get('/points', pointsControllers.index);
routes.get('/points/:id', pointsControllers.show);

routes.post(
    '/points',
    upload.single('image'),
    celebrate({
        body: Joi.object().keys({
            name: Joi.string().required(),
            email: Joi.string().required().email(),
            whatsapp: Joi.number().required(),
            latitude: Joi.number().required(),
            longitude: Joi.number().required(),
            city: Joi.string().required(),
            uf: Joi.string().required().max(2),
            items: Joi.string().required()
        })
    }, {
        abortEarly: false
    }),
    pointsControllers.create
);

export default routes;