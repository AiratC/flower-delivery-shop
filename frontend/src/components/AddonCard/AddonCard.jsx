import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart, removeItem, updateQty } from '../../redux/slices/cartSlice';
import styles from './AddonCard.module.css';
import { Loader } from 'lucide-react';
import { toast } from 'react-toastify';

const AddonCard = ({ addon }) => {
   const dispatch = useDispatch();
   const [isUpdating, setIsUpdating] = useState(false);
   const cartItem = useSelector(state => 
      state.cart.items.find(item => 
         item.item_id === addon.addon_id && item.item_type === 'addon'
      ));

   const titleAddon = addon.title.length > 15 ? addon.title.slice(0, 15) + '...' : addon.title;

   const handleCartAction = async (action) => {
      setIsUpdating(true);
      try {
         const response = await dispatch(action).unwrap();
         if(response.success) {
            toast.success(response.message);
         };
      } catch (error) {
         toast.error(error.response?.data?.message || 'Что-то пошло не так');
      } finally {
         setIsUpdating(false);
      }
   };

   // Функция для добавления доп товара которую потом перемещю в копонент AddonCard
   const addToAddon = () => {
      handleCartAction(addToCart({
         itemId: addon.addon_id,
         itemType: 'addon',
         selectedSize: null,
         quantity: 1
      }))
   };

   const onUpdateQty = (newQty) => {
      if (newQty < 1) {
         handleCartAction(removeItem(cartItem.cart_item_id));
      } else {
         handleCartAction(updateQty({
            cartItemId: cartItem.cart_item_id,
            quantity: newQty
         }))
      }
   };

   if (!addon) return null;

   return (
      <div className={styles.addonCard}>
         <div className={styles.imageWrapper}>
            <img
               src={`${import.meta.env.VITE_BACKEND_URL}${addon.image}`}
               alt={addon.title}
            />
         </div>
         <div className={styles.info}>
            <h4 className={styles.title}>{titleAddon}</h4>
            <div>{addon.price} ₽</div>

            {
               cartItem && (
                  <div className={styles.controlsRow}>
                     <div className={styles.counter}>
                        <button disabled={isUpdating} onClick={() => onUpdateQty((cartItem?.quantity || 1) - 1)}>-</button>
                        <div>
                           {
                              isUpdating ? (
                                 <Loader size={20} className={`spinner`} />
                              ) : (
                                 <>
                                    <span>{(cartItem?.quantity || 1)}</span>
                                    <span className={styles.unit}>шт.</span>
                                 </>
                              )
                           }
                        </div>
                        <button disabled={isUpdating} onClick={() => onUpdateQty((cartItem?.quantity || 1) + 1)}>+</button>
                     </div>

                  </div>
               )
            }

            {
               cartItem ? (
                  <button className={styles.addedBtn} disabled>
                     Добавлено
                  </button>
               ) : (
                  <button className={styles.addBtn} onClick={addToAddon} disabled={isUpdating}>
                     {isUpdating ? <Loader size={20} className={`spinner`} /> : '+ Добавить'}
                  </button>
               )
            }
         </div>
      </div>
   )
}

export default React.memo(AddonCard)
