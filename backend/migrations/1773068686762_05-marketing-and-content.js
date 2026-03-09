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
   // 1. Акции (Stock)
   pgm.createTable('Stock', {
      stock_id: 'id',
      title: { type: 'varchar(400)' },
      description: { type: 'text' },
      stock_images: { type: 'jsonb' },
      created_at: { type: 'timestamptz', default: pgm.func('current_timestamp') },
      updated_at: { type: 'timestamp', default: pgm.func('now()') },
   });

   // 2. Дополнения (Addons)
   pgm.createTable('Addons', {
      addon_id: 'id',
      title: { type: 'varchar(255)', notNull: true },
      price: { type: 'decimal(10,2)', notNull: true },
      image: { type: 'jsonb', default: '[]' },
      is_available: { type: 'boolean', default: true },
      created_at: { type: 'timestamptz', default: pgm.func('current_timestamp') },
   });

   // 3. Рекомендации
   pgm.createTable('Product_Recommendations', {
      flower_id: { type: 'integer', references: '"Flowers"', onDelete: 'CASCADE', notNull: true },
      addon_id: { type: 'integer', references: '"Addons"', onDelete: 'CASCADE', notNull: true },
   });
   pgm.addConstraint('Product_Recommendations', 'prod_recom_pk', { primaryKey: ['flower_id', 'addon_id'] });

   // 4. Отзывы
   pgm.createTable('Reviews', {
      review_id: 'id',
      user_id: { type: 'integer', references: '"Users"', onDelete: 'CASCADE', notNull: true },
      flower_id: { type: 'integer', references: '"Flowers"', onDelete: 'CASCADE' },
      order_item_id: { type: 'integer', references: '"Order_Items"', onDelete: 'CASCADE', notNull: true },
      name: { type: 'varchar(300)' },
      email: { type: 'varchar(150)' },
      city: { type: 'varchar(200)' },
      comment: { type: 'text' },
      rating: { type: 'integer', notNull: true, check: 'rating >= 1 AND rating <= 5' },
      photo: { type: 'text', default: null },
      created_at: { type: 'timestamptz', default: pgm.func('current_timestamp') },
   });

   // 5. Вопросы
   pgm.createTable('Ask_Question', {
      ask_question_id: 'id',
      name: { type: 'varchar(150)', notNull: true },
      email: { type: 'varchar(200)' },
      phone: { type: 'varchar(30)' },
      question: { type: 'text', notNull: true },
      is_processed: { type: 'boolean', default: false },
      created_at: { type: 'timestamptz', default: pgm.func('current_timestamp') },
   });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
   pgm.dropTable('Ask_Question');
   pgm.dropTable('Reviews');
   pgm.dropTable('Product_Recommendations');
   pgm.dropTable('Addons');
   pgm.dropTable('Stock');
};
