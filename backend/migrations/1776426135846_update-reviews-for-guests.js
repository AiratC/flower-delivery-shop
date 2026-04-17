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
   // 1. Снимаем ограничение NOT NULL с user_id
   pgm.alterColumn('Reviews', 'user_id', {
      allowNull: true,
   });

   // 2. Добавляем колонку guest_token
   pgm.addColumn('Reviews', {
      guest_token: { type: 'varchar(255)', notNull: false },
   });

   // 3. Обновляем внешний ключ для user_id (чтобы не удалять отзывы при удалении юзера)
   // Сначала удаляем старый
   pgm.dropConstraint('Reviews', 'reviews_user_id_fkey', { ifExists: true });

   // Добавляем новый с ON DELETE SET NULL
   pgm.addConstraint('Reviews', 'reviews_user_id_fkey', {
      foreignKeys: {
         columns: 'user_id',
         references: '"Users"(user_id)',
         onDelete: 'SET NULL',
      },
   });

   // 4. Добавляем индекс для guest_token
   pgm.addIndex('Reviews', 'guest_token');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
   // Откат изменений
   pgm.dropIndex('Reviews', 'guest_token');
   pgm.dropColumn('Reviews', 'guest_token');

   pgm.alterColumn('Reviews', 'user_id', {
      allowNull: false, // Возвращаем как было
   });

   // Возврат старого констрейнта (опционально, зависит от твоих требований к откату)
   pgm.dropConstraint('Reviews', 'reviews_user_id_fkey', { ifExists: true });
   pgm.addConstraint('Reviews', 'reviews_user_id_fkey', {
      foreignKeys: {
         columns: 'user_id',
         references: '"Users"(user_id)',
         onDelete: 'CASCADE',
      },
   });
};
