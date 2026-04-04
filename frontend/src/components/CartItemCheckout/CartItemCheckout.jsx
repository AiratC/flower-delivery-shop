import React from 'react';
import { useDispatch } from 'react-redux';
import { X, Minus, Plus } from 'lucide-react';
import styles from './CartItemCheckout.module.css';
import { removeItem, updateQty } from '../../redux/slices/cartSlice';
// Импортируй свои экшены корзины
// import { removeItem, updateQuantity } from '../store/cartSlice';

const CartItemCheckout = ({ item }) => {
   const dispatch = useDispatch();

   const handleIncrement = (e) => {
      e.stopPropagation();

      dispatch(updateQty({ cartItemId: item.cart_item_id, quantity: item.quantity + 1 }));
   };

   const handleDecrement = (e) => {
      e.stopPropagation();

      if (item.quantity > 1) {
         dispatch(updateQty({ cartItemId: item.cart_item_id, quantity: item.quantity - 1 }));
      }
   };

   const handleRemove = (e) => {
      e.stopPropagation();

      dispatch(removeItem(item.cart_item_id));
   };

   return (
      <div className={styles.cartItemCard}>
         {/* Кнопка удаления */}
         <button className={styles.removeBtn} onClick={handleRemove}>
            <X size={18} color="#cccccc" />
         </button>

         <div className={styles.itemMain}>
            {/* Изображение товара */}
            <div className={styles.imageWrapper}>
               <img src={`${import.meta.env.VITE_BACKEND_URL}${item.image}`} alt={item.name} className={styles.itemImage} />
            </div>

            {/* Инфо о товаре */}
            <div className={styles.itemDetails}>
               <h4 className={styles.itemName}>{item.name}</h4>
               <p className={styles.itemMeta}>
                  {item.selected_size ? `${item.selected_size} ` : ''}
                  ({item.price.toLocaleString()} руб.)
               </p>
            </div>
         </div>

         <div className={styles.itemFooter}>
            {/* Управление количеством */}
            <div className={styles.quantityControls}>
               <button
                  className={styles.controlBtn}
                  onClick={handleDecrement}
                  disabled={item.quantity <= 1}
               >
                  <Minus size={14} />
               </button>
               <span className={styles.quantityText}>
                  <strong>{item.quantity}</strong> шт.
               </span>
               <button className={styles.controlBtn} onClick={handleIncrement}>
                  <Plus size={14} />
               </button>
            </div>

            {/* Промежуточная сумма за позицию */}
            <div className={styles.itemSum}>
               <span className={styles.sumLabel}>Сумма</span>
               <span className={styles.sumValue}>
                  {(item.price * item.quantity).toLocaleString()} руб.
               </span>
            </div>
         </div>
      </div>
   );
};

export default CartItemCheckout;