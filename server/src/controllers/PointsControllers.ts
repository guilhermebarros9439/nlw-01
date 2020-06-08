import knex from '../database/connection';
import { Request, Response } from 'express';

class PointsControllers {
    async create(request: Request, response: Response) {
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = request.body;
    
        const trx = await knex.transaction();

        const point = {
            image: request.file.filename,
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        };
    
        const insertedIds = await trx('points').insert(point);
    
        const point_id = insertedIds[0];
    
        const pointsItems = items
            .split(',')
            .map((item: string) => Number(item.trim()))
            .map((item_id: number) => {
                return {
                    item_id,
                    point_id,
                };
            })
        ;
    
        await trx('points_items').insert(pointsItems);
    
        await trx.commit();

        return response.json({
            id: point_id,
            ...point
        })
    }

    async show(request: Request, response: Response) {
        const { id } = request.params;

        const point = await knex('points')
            .where('id', id)
            .select('*')
            .first()
        ;

        if (!point) {
            return response.status(400).json({ message: 'Point not found' });
        }

        /**
         * select (items.title)
         * from items
         * inner join points_items on items.id = points_items.item_id
         * where points_items.point_id = id
         */

        const serializedPoint = {
            ...point,
            image_url: `http://localhost:3333/uploads/${ point.image }`
        }

        const items = await knex('items')
            .join('points_items', 'items.id', '=', 'points_items.item_id')
            .where('points_items.point_id', id)
            .select('items.title')
        ;

        return response.json({ point: serializedPoint, items });
    }

    async index(request: Request, response: Response) {
        const { city, uf, items } = request.query;

        const parsedItems = String(items)
            .split(',')
            .map(item => Number(item.trim()))
        ;

        const points = items ? await knex('points') // if
            .join('points_items', 'points.id', '=', 'points_items.point_id')
            .whereIn('points_items.item_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*')
        : // else
        await knex('points')
            .where('city', String(city))
            .where('uf', String(uf))
            .select('*')
        ;

        const serializedPoints = points.map(point => ({
            ...point,
            image_url: `http://localhost:3333/uploads/${ point.image }`
        }));

        return response.json(serializedPoints);
    }
}

export default PointsControllers