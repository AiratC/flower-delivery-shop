/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
   pgm.createTable('Color_Palettes', {
      palette_id: 'id',
      name: { type: 'varchar(50)', notNull: true, unique: true }
   });
   pgm.createTable('Packaging_Types', {
      packaging_id: 'id',
      name: { type: 'varchar(50)', notNull: true, unique: true }
   });
   pgm.createTable('Flower_Species', {
      species_id: 'id',
      name: { type: 'varchar(50)', notNull: true, unique: true }
   });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
   pgm.dropTable('Flower_Species');
   pgm.dropTable('Packaging_Types');
   pgm.dropTable('Color_Palettes');
};
