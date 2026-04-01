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
   // Удаляем ограничение внешнего ключа, которое мешает записывать user_id = 0
   pgm.dropConstraint('Cart', 'Cart_user_id_fkey');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
   // В случае отката миграции — возвращаем внешний ключ на место
   pgm.addConstraint('Cart', 'Cart_user_id_fkey', {
      foreignKeys: {
         columns: 'user_id',
         references: 'Users(user_id)',
         onDelete: 'CASCADE', // или то, что у тебя было изначально
      },
   });
};
