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
   // Добавляем колонку для связи с анонимной сессией
   pgm.addColumn('Orders', {
      guest_token: { type: 'varchar(255)', notNull: false },
   });

   // Индекс по токену — это теперь наш главный инструмент
   pgm.addIndex('Orders', 'guest_token', {
      name: 'idx_orders_guest_token',
   });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
   pgm.dropIndex('Orders', 'guest_token', { name: 'idx_orders_guest_token' });
   pgm.dropColumn('Orders', 'guest_token');
};
