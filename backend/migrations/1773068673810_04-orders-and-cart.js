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
   // 1. Заказы
   pgm.createTable('Orders', {
      order_id: 'id',
      user_id: { type: 'integer', references: '"Users"', onDelete: 'SET NULL' },
      delivery_method: { type: 'varchar(50)', notNull: true },
      delivery_date: { type: 'date', notNull: true },
      delivery_time_slot: { type: 'varchar(100)' },
      call_recipient: { type: 'boolean', default: false },
      keep_secret: { type: 'boolean', default: false },
      recipient_type: { type: 'varchar(50)', default: 'Self' },
      recipient_name: { type: 'varchar(255)', notNull: true },
      recipient_phone: { type: 'varchar(30)', notNull: true },
      recipient_city: { type: 'varchar(100)', notNull: true },
      delivery_address: { type: 'text', notNull: true },
      order_note: { type: 'text' },
      customer_name: { type: 'varchar(255)', notNull: true },
      customer_phone: { type: 'varchar(30)', notNull: true },
      customer_email: { type: 'varchar(150)' },
      customer_city: { type: 'varchar(100)' },
      total_price: { type: 'decimal(10,2)', notNull: true },
      payment_method: { type: 'varchar(100)', notNull: true },
      status: { type: 'varchar(50)', default: 'Новый' },
      created_at: { type: 'timestamptz', default: pgm.func('current_timestamp') },
   });

   // 2. Элементы заказа
   pgm.createTable('Order_Items', {
      order_item_id: 'id',
      order_id: { type: 'integer', references: '"Orders"', onDelete: 'CASCADE', notNull: true },
      item_type: { type: 'varchar(50)', notNull: true },
      item_id: { type: 'integer', notNull: true },
      selected_size: { type: 'varchar(50)' },
      quantity: { type: 'integer', notNull: true, check: 'quantity > 0' },
      price_at_purchase: { type: 'decimal(10,2)', notNull: true },
   });

   // 3. Корзина
   pgm.createTable('Cart', {
      cart_item_id: 'id',
      user_id: { type: 'integer', references: '"Users"', onDelete: 'CASCADE' },
      guest_token: { type: 'varchar(255)' },
      item_id: { type: 'integer', notNull: true },
      item_type: { type: 'varchar(50)', notNull: true },
      selected_size: { type: 'varchar(50)' },
      quantity: { type: 'integer', default: 1, check: 'quantity > 0' },
      created_at: { type: 'timestamptz', default: pgm.func('current_timestamp') },
   });
   pgm.addConstraint('Cart', 'unique_user_cart_item', { unique: ['user_id', 'item_id', 'item_type', 'selected_size'] });
   pgm.addConstraint('Cart', 'unique_guest_cart_item', { unique: ['guest_token', 'item_id', 'item_type', 'selected_size'] });

   // 4. Избранное
   pgm.createTable('Favorites', {
      favorite_id: 'id',
      user_id: { type: 'integer', references: '"Users"', onDelete: 'CASCADE' },
      guest_token: { type: 'varchar(255)' },
      item_id: { type: 'integer', notNull: true },
      item_type: { type: 'varchar(50)', notNull: true },
   });
   pgm.addConstraint('Favorites', 'unique_user_favorite', { unique: ['user_id', 'item_id', 'item_type'] });
   pgm.addConstraint('Favorites', 'unique_guest_favorite', { unique: ['guest_token', 'item_id', 'item_type'] });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
   pgm.dropTable('Favorites');
   pgm.dropTable('Cart');
   pgm.dropTable('Order_Items');
   pgm.dropTable('Orders');
};
