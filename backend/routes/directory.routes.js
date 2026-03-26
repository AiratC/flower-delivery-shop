import express from 'express';
import { query } from '../config/db.js';

const directoryRouter = express.Router();

directoryRouter.get('/species', async (req, res) => {
   const result = await query('SELECT * FROM "Flower_Species" ORDER BY name');
   res.json(result.rows);
});

directoryRouter.get('/packaging', async (req, res) => {
   const result = await query('SELECT * FROM "Packaging_Types" ORDER BY name');
   res.json(result.rows);
});

directoryRouter.get('/palettes', async (req, res) => {
   const result = await query('SELECT * FROM "Color_Palettes" ORDER BY name');
   res.json(result.rows);
});

export default directoryRouter;