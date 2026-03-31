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
   pgm.createIndex('Cart',
      [
         'item_id',
         'item_type',
         { name: 'user_id', expression: 'COALESCE(user_id, 0)' },
         { name: 'guest_token', expression: "COALESCE(guest_token, '')" },
         { name: 'selected_size', expression: "COALESCE(selected_size, '')" }
      ],
      {
         name: 'idx_cart_upsert_logic',
         unique: true
      }
   );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
   pgm.dropIndex('Cart', [], { name: 'idx_cart_upsert_logic' });
};

