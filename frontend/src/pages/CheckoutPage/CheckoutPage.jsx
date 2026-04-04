import React, { useState } from 'react';
import styles from './CheckoutPage.module.css';
import { useSelector } from 'react-redux';

const CheckoutPage = () => {
   const { items, totalPrice } = useSelector(state => state.cart);

   // Инициализируем состояние всеми полями из таблицы Orders
   const [formData, setFormData] = useState({
      delivery_method: 'Доставка по Владивостоку',
      delivery_date: '',
      delivery_time_slot: '',
      call_recipient: false,
      keep_secret: false,
      recipient_type: 'Self',
      recipient_name: '',
      recipient_phone: '',
      recipient_city: 'Владивосток',
      delivery_address: '',
      order_note: '',
      customer_name: '',
      customer_phone: '',
      customer_city: 'Владивосток',
      payment_method: 'Онлайн оплата — Сбербанк'
   });

   // Универсальный обработчик для всех типов инпутов
   const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      console.log({ name, value, type, checked })
      setFormData(prevData => (
         { ...prevData, [name]: type === 'checkbox' ? checked : value }
      ));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      // Формируем итоговый объект для отправки в базу (Orders + Order_Items);
      const finalOrder = {
         ...formData,
         totalPrice: totalPrice,
         items: items.map((item) => ({
            item_id: item.item_id,
            item_type: item.item_type,
            selected_size: item.selected_size,
            quantity: item.quantity,
            price_at_purchase: item.price
         }))
      };

      console.log(`Готовый объект для backend: `, finalOrder)
   };

   if (items.length === 0) return <div className={`container`}>Корзина пуста</div>
   return (
      <div className={`container ${styles.checkoutContainer}`}>
         <h1 className={styles.mainTitle}>Оформление заказа</h1>

         <form onSubmit={handleSubmit} className={`${styles.contentGrid}`}>

            <div className={styles.formsColumn}>

               {/* 1. Спопсоб доставки */}
               <section className={styles.sectionCard}>
                  <h3 className={styles.sectionHeader}>Способ доставки</h3>
                  <div className={styles.radioGroupVertical}>
                     <label htmlFor="delivery_method" className={styles.radioLabel}>
                        <input
                           type="radio"
                           name='delivery_method'
                           id='delivery_method'
                           value={`Доставка по Владивостоку`}
                           checked={formData.delivery_method === 'Доставка по Владивостоку'}
                           onChange={handleChange}
                        />
                        <div className={styles.radioText}>
                           <strong>Доставка по Владивостоку</strong>
                        </div>
                     </label>
                     <label htmlFor="self" className={styles.radioLabel}>
                        <input
                           type="radio"
                           name='delivery_method'
                           id='self'
                           value={`Самовывоз`}
                           checked={formData.delivery_method === 'Самовывоз'}
                           onChange={handleChange}
                        />
                        <div className={styles.radioText}>
                           <strong>Самовывоз</strong>
                           <span>г. Владивосток, ул. Пушкинская, 17 А</span>
                        </div>
                     </label>
                  </div>
               </section>
            </div>
         </form>
      </div>
   )
}

export default CheckoutPage
