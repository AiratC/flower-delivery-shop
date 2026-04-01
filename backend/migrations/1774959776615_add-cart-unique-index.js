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
   // 1. Удаляем старый капризный индекс
   pgm.sql(`DROP INDEX IF EXISTS idx_cart_upsert_logic;`);

   // 2. Устанавливаем дефолты и убираем NULL
   // Для user_id используем 0 как признак гостя
   pgm.sql(`UPDATE "Cart" SET user_id = 0 WHERE user_id IS NULL;`);
   pgm.alterColumn('Cart', 'user_id', { notNull: true, default: 0 });

   // Для строковых полей используем пустую строку
   pgm.sql(`UPDATE "Cart" SET guest_token = '' WHERE guest_token IS NULL;`);
   pgm.alterColumn('Cart', 'guest_token', { notNull: true, default: '' });

   pgm.sql(`UPDATE "Cart" SET selected_size = '' WHERE selected_size IS NULL;`);
   pgm.alterColumn('Cart', 'selected_size', { notNull: true, default: '' });

   // 3. Создаем максимально простой уникальный индекс по реальным колонкам
   pgm.addIndex('Cart', ['item_id', 'item_type', 'user_id', 'guest_token', 'selected_size'], {
      name: 'idx_cart_simple_unique',
      unique: true
   });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
   // 1. Удаляем новый индекс
   pgm.dropIndex('Cart', [], { name: 'idx_cart_simple_unique' });

   // 2. Возвращаем колонкам возможность быть NULL (как было до миграции)
   pgm.alterColumn('Cart', 'user_id', { notNull: false, default: null });
   pgm.alterColumn('Cart', 'guest_token', { notNull: false, default: null });
   pgm.alterColumn('Cart', 'selected_size', { notNull: false, default: null });

   // 3. (Опционально) Если хочешь восстановить старый капризный индекс
   pgm.sql(`
      CREATE UNIQUE INDEX idx_cart_upsert_logic ON "Cart" (
         item_id, 
         item_type, 
         (COALESCE(user_id, 0)), 
         (COALESCE(guest_token, '')), 
         (COALESCE(selected_size, ''))
      );
   `);
};

