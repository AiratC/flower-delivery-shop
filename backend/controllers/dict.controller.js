import { query } from "../config/db.js";

// Карта таблиц для безопасности
const tableMap = {
   palettes: { table: 'Color_Palettes', id: 'palette_id' },
   packaging: { table: 'Packaging_Types', id: 'packaging_id' },
   species: { table: 'Flower_Species', id: 'species_id' }
};

export const getAll = async (req, res) => {
   const { type } = req.params;
   const config = tableMap[type];

   if (!config) {
      return res.status(400).json({
         message: 'Неверный тип справочника',
         error: true,
         success: false
      })
   };

   try {
      const result = await query(
         `SELECT ${config.id} as id, name FROM ${config.table} ORDER BY name ASC`
      );

      return res.status(200).json(result.rows)
   } catch (error) {
      return res.status(500).json({
         message: 'Ошибка сервера',
         error: true,
         success: false
      })
   }
};

export const create = async (req, res) => {
   const { type } = req.params;
   const { name } = req.body;
   const config = tableMap[type];

   if (!config) {
      return res.status(400).json({
         message: 'Неверный тип справочника',
         error: true,
         success: false
      })
   };

   try {
      const result = await query(
         `INSERT INTO ${config.table} (name) VALUES ($1) RETURNING ${config.id} as id, name`,
         [name]
      );

      return res.status(201).json(result.rows[0]);
   } catch (error) {
      return res.status(500).json({
         message: 'Ошибка сервера',
         error: true,
         success: false
      })
   }
};

export const remove = async (req, res) => {
   const { type, id } = req.params;
   const config = tableMap[type];

   if (!config) {
      return res.status(400).json({
         message: 'Неверный тип справочника',
         error: true,
         success: false
      })
   };

   try {
      await query(`DELETE FROM ${config.table} WHERE ${config.id} = $1`, [id]);
      return res.json({ success: true });
   } catch (error) {
      res.status(500).json({
         message: "Нельзя удалить: этот элемент используется в букетах"
      });
   }
};

