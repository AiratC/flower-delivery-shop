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
   // 1. Цветы
   pgm.createTable('Flowers', {
      flower_id: 'id',
      title: { type: 'varchar(255)', notNull: true },
      description: { type: 'text' },
      composition: { type: 'jsonb', default: '[]' },
      delivery_info: { type: 'text' },
      images: { type: 'jsonb', default: '[]' },
      is_new: { type: 'boolean', default: false },
      is_sale: { type: 'boolean', default: false },
      is_active: { type: 'boolean', default: true },
      palette_id: { type: 'integer', references: '"Color_Palettes"' },
      packaging_id: { type: 'integer', references: '"Packaging_Types"' },
      created_at: { type: 'timestamptz', default: pgm.func('current_timestamp') },
   });

   // 2. Связь многие-ко-многим с видами цветов
   pgm.createTable('Flower_To_Species', {
      flower_id: { type: 'integer', references: '"Flowers"', onDelete: 'CASCADE', notNull: true },
      species_id: { type: 'integer', references: '"Flower_Species"', onDelete: 'CASCADE', notNull: true },
   });
   pgm.addConstraint('Flower_To_Species', 'flower_to_species_pk', { primaryKey: ['flower_id', 'species_id'] });

   // 3. Варианты размеров
   pgm.createTable('Flower_Variants', {
      variant_id: 'id',
      flower_id: { type: 'integer', references: '"Flowers"', onDelete: 'CASCADE', notNull: true },
      size_name: { type: 'varchar(50)', notNull: true },
      price_old: { type: 'decimal(10,2)' },
      price_new: { type: 'decimal(10,2)', notNull: true },
      is_default: { type: 'boolean', default: false },
   });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
   pgm.dropTable('Flower_Variants');
   pgm.dropTable('Flower_To_Species');
   pgm.dropTable('Flowers');
};
