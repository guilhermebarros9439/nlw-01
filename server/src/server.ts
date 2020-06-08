import express from 'express';
import routes from './routes';

import path from 'path';
import cors from 'cors';

import { errors } from 'celebrate';

const uploads = path.resolve(__dirname, '..', 'uploads');

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);

app.use('/uploads', express.static(uploads));

app.use(errors());

app.listen(3333);