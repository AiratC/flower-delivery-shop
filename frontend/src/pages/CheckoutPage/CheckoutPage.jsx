import React, { useEffect, useMemo, useState } from 'react';
import styles from './CheckoutPage.module.css';
import { useDispatch, useSelector } from 'react-redux';
import CartItemCheckout from '../../components/CartItemCheckout/CartItemCheckout';
import { clearCart, selectTotalPrice } from '../../redux/slices/cartSlice';
import { createOrderThunk } from '../../redux/slices/checkoutSlice';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import EmptyCart from '../../components/EmptyCart/EmptyCart';

const CheckoutPage = () => {
   const { items } = useSelector(state => state.cart);
   const { loading } = useSelector(state => state.checkout);
   // Получаем все данные пользователя чтоб узнать total_spent для расчета скидки
   const { user } = useSelector(state => state.auth);
   const totalPrice = useSelector(selectTotalPrice);

   const dispatch = useDispatch();
   const navigate = useNavigate();

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
      payment_method: 'Онлайн оплата — Сбербанк',
   });

   // Динамический расчет скидки
   const totalSum = user?.total_spent || 0;

   const discountData = useMemo(() => {
      if (totalSum >= 90000) return 7;
      if (totalSum >= 50000) return 5;
      if (totalSum >= 10000) return 3;
      return 0;
   }, [totalSum]);

   // Финальная цена после применения скидки
   const finalPrice = useMemo(() => {
      if (discountData > 0) {
         return totalPrice - (totalPrice * (discountData / 100));
      }
      return totalPrice;
   }, [totalPrice, discountData]);

   // Универсальный обработчик для всех типов инпутов
   const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      const val = type === 'checkbox' ? checked : value

      setFormData(prevData => {
         const newData = { ...prevData, [name]: val };

         if (newData.recipient_type === 'Self') {
            newData.recipient_name = newData.customer_name;
            newData.recipient_phone = newData.customer_phone
         };

         return newData;
      });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      // Формируем итоговый объект для отправки в базу (Orders + Order_Items);
      const finalOrder = {
         ...formData,
         total_price: finalPrice,
         discount_applied: discountData, // Полезно передать процент скидки для истории
         items: items.map((item) => ({
            item_id: item.item_id,
            item_type: item.item_type,
            selected_size: item.selected_size,
            quantity: item.quantity,
            price_at_purchase: item.price
         })),
         delivery_address: formData.delivery_method === 'Самовывоз' ?
            'Самовывоз: ул. Пушкинская, 17А' : formData.delivery_address
      };

      try {
         const response = await dispatch(createOrderThunk(finalOrder)).unwrap();
         if (response.success) {
            toast.success(response.message || 'Заказ оформлен!');
            dispatch(clearCart());
            navigate(`/order-success/${response.orderId}`);
         }
      } catch (error) {
         toast.error(error.message || 'Ошибка при оформлении заказа');
      }
   };

   useEffect(() => {
      window.scrollTo({ behavior: 'smooth', top: 0 })
   }, []);

   if (items.length === 0) return <EmptyCart />

   return (
      <div className={`container ${styles.checkoutContainer}`}>
         <h1 className={styles.mainTitle}>Оформление заказа</h1>

         <form onSubmit={handleSubmit} className={`${styles.contentGrid}`}>

            <div className={styles.formsColumn}>

               {/* 1. Спопсоб доставки */}
               <section className={styles.sectionCard}>
                  <h3 className={styles.sectionHeader}>Способ доставки</h3>
                  <div className={styles.radioGroupVertical}>
                     <label className={styles.radioLabel}>
                        <input
                           type="radio"
                           name='delivery_method'
                           value={`Доставка по Владивостоку`}
                           checked={formData.delivery_method === 'Доставка по Владивостоку'}
                           onChange={handleChange}
                        />
                        <div className={styles.radioText}>
                           <strong>Доставка по Владивостоку</strong>
                        </div>
                     </label>
                     <label className={styles.radioLabel}>
                        <input
                           type="radio"
                           name='delivery_method'
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

               {/* 2. Дата и время */}
               <section className={styles.sectionCard}>
                  <h3 className={styles.sectionHeader}>Дата и время</h3>
                  <div className={styles.inputRow}>
                     <div className={styles.fieldBlock}>
                        <label>Дата</label>
                        <input
                           type="date"
                           name="delivery_date"
                           required
                           value={formData.delivery_date}
                           onChange={handleChange}
                        />
                     </div>
                     <div className={styles.fieldBlock}>
                        <label>Время</label>
                        <input
                           type="time"
                           name="delivery_time_slot"
                           value={formData.delivery_time_slot}
                           onChange={handleChange}
                        />
                     </div>
                  </div>
                  <div className={styles.optionsList}>
                     <label className={styles.checkboxLabel}>
                        <input
                           type="checkbox"
                           name="call_recipient"
                           checked={formData.call_recipient}
                           onChange={handleChange}
                        />
                        <span>Позвонить получателю для уточнения времени и адреса</span>
                     </label>
                     <label className={styles.checkboxLabel}>
                        <input
                           type="checkbox"
                           name="keep_secret"
                           checked={formData.keep_secret}
                           onChange={handleChange}
                        />
                        <span>По телефону <strong>не говорить</strong> что это цветы</span>
                     </label>
                  </div>
               </section>

               {/* 3. Получатель */}
               <section className={styles.sectionCard}>
                  <h3 className={styles.sectionHeader}>Получатель</h3>
                  <div className={styles.radioGroupInline}>
                     <label>
                        <input
                           type="radio"
                           name="recipient_type"
                           value="Self"
                           checked={formData.recipient_type === 'Self'}
                           onChange={handleChange}
                        /> Я получатель
                     </label>
                     <label>
                        <input
                           type="radio"
                           name="recipient_type"
                           value="Other"
                           checked={formData.recipient_type === 'Other'}
                           onChange={handleChange}
                        /> Получатель другой человек
                     </label>
                  </div>
                  <div className={styles.fieldsGrid}>
                     <input
                        name="recipient_name"
                        placeholder="Имя и фамилия"
                        required
                        value={formData.recipient_name}
                        onChange={handleChange}
                     />
                     <input
                        name="recipient_phone"
                        placeholder="Моб. номер"
                        required
                        value={formData.recipient_phone}
                        onChange={handleChange}
                     />
                     <input
                        name="recipient_city"
                        placeholder="Город"
                        value={formData.recipient_city}
                        onChange={handleChange}
                     />
                     <input
                        name="delivery_address"
                        placeholder="Адрес"
                        required
                        value={formData.delivery_address}
                        onChange={handleChange}
                     />
                  </div>
                  <textarea
                     name="order_note"
                     placeholder="Примечание"
                     className={styles.textarea}
                     value={formData.order_note}
                     onChange={handleChange}
                  />
               </section>

               {/* 4. Ваши контакты */}
               <section className={styles.sectionCard}>
                  <h3 className={styles.sectionHeader}>Ваши контакты</h3>
                  <div className={styles.fieldsGrid3}>
                     <div className={styles.fieldBlock}>
                        <label>Имя и фамилия</label>
                        <input
                           name="customer_name"
                           placeholder="Анатолий Петров"
                           required
                           value={formData.customer_name}
                           onChange={handleChange}
                        />
                     </div>
                     <div className={styles.fieldBlock}>
                        <label>Моб. номер</label>
                        <input
                           name="customer_phone"
                           placeholder="+7 (___) ___ - __ - __"
                           required
                           value={formData.customer_phone}
                           onChange={handleChange}
                        />
                     </div>
                     <div className={styles.fieldBlock}>
                        <label>Город</label>
                        <input
                           name="customer_city"
                           value={formData.customer_city}
                           onChange={handleChange}
                        />
                     </div>
                  </div>
               </section>

               {/* 5. Способ оплаты */}
               <section className={styles.sectionCard}>
                  <h3 className={styles.sectionHeader}>Способ оплаты</h3>
                  <div className={styles.paymentOptions}>
                     {['Наличными при самовывозе', 'Наличными курьеру', 'Онлайн оплата — Сбербанк'].map((method) => (
                        <label key={method} className={styles.paymentRadio}>
                           <input
                              type="radio"
                              name="payment_method"
                              value={method}
                              checked={formData.payment_method === method}
                              onChange={handleChange}
                           />
                           <span>{method}</span>
                        </label>
                     ))}
                  </div>
               </section>
            </div>

            {/* ПРАВАЯ КОЛОНКА */}
            <aside className={styles.cartColumn}>
               <div className={styles.cartStickyCard}>
                  <h2 className={styles.cartTitle}>КОРЗИНА</h2>
                  <div className={styles.itemsList}>
                     {items.map((item) => (
                        <CartItemCheckout key={item.cart_item_id} item={item} />
                     ))}
                  </div>
                  <div className={styles.totalBlock}>
                     <p>Итоговая стоимость {discountData > 0 && `со скидкой ${discountData}%`}:</p>
                     {
                        discountData > 0 ? (
                           <div className={styles.priceWrapper}>
                              {/* Старая цена зачеркнутая */}
                              <span className={styles.oldPrice}>
                                 {totalPrice.toLocaleString()} руб.
                              </span>
                              {/* Новая цена жирным */}
                              <div
                                 className={
                                    `
                                 ${styles.totalAmount}
                                 ${discountData > 0 && styles.colorRed}
                                 `
                                 }
                              >
                                 {finalPrice.toLocaleString()} руб.
                              </div>
                           </div>
                        ) : (
                           /* Если скидки нет, просто обычная цена */
                           <div className={styles.totalAmount}>
                              {totalPrice.toLocaleString()} руб.
                           </div>
                        )
                     }
                  </div>
                  <button
                     type="submit"
                     className={styles.submitBtn}
                     disabled={loading}
                  >
                     {loading ? 'Оформление...' : 'Оформить заказ'}
                  </button>
               </div>
            </aside>

         </form >
      </div >
   )
}

export default CheckoutPage
