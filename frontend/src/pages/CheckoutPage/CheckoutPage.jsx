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
      const { name, value, type, checked } = e.target.value;
      setFormData(prevData => (
         { ...prevData, [name] : type === 'checkbox' ? checked : value }
      ));
   };

   
   return (
      <div>
         CheckoutPage
      </div>
   )
}

export default CheckoutPage
