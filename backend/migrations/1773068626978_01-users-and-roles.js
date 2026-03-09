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
   // 1. Типы и Роли
   pgm.createType('user_role_type', ['Админ', 'Пользователь']);
   pgm.createTable('Roles', {
      role_id: 'id',
      name: { type: 'user_role_type', notNull: true, unique: true },
   });
   pgm.sql(`INSERT INTO "Roles" (name) VALUES ('Админ'), ('Пользователь')`);

   // 2. Пользователи
   pgm.createTable('Users', {
      user_id: 'id',
      role_id: { type: 'integer', references: '"Roles"', notNull: true, default: 2, onDelete: 'SET DEFAULT' },
      name: { type: 'varchar(255)' },
      email: { type: 'varchar(250)', notNull: true, unique: true },
      password_hash: { type: 'varchar(255)', notNull: true },
      city: { type: 'varchar(300)' },
      delivery_address: { type: 'varchar(350)' },
      phone: { type: 'varchar(30)', unique: true },
      avatar: { type: 'text' },
      is_agreed_terms: { type: 'boolean', notNull: true, default: false },
      total_spent: { type: 'decimal(10,2)', default: 0 },
      reset_password_token: { type: 'varchar(255)' },
      reset_password_expires: { type: 'timestamp' },
      created_at: { type: 'timestamptz', default: pgm.func('current_timestamp') },
      updated_at: { type: 'timestamptz', default: pgm.func('current_timestamp') },
   });

   // 3. Накопительные скидки
   pgm.createTable('Discount_Tiers', {
      tier_id: 'id',
      min_spent: { type: 'decimal(10,2)', notNull: true },
      discount_percent: { type: 'integer', notNull: true },
   });
   pgm.sql(`INSERT INTO "Discount_Tiers" (min_spent, discount_percent) VALUES (0, 0), (10000, 3), (50000, 5), (90000, 7)`);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
   pgm.dropTable('Discount_Tiers');
   pgm.dropTable('Users');
   pgm.dropTable('Roles');
   pgm.dropType('user_role_type');
};
