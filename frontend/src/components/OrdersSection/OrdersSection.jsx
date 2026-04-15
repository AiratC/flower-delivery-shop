import React, { useEffect, useState } from 'react'
import fetchAxios from '../../api/axios';
import { Loader } from 'lucide-react';
import styles from './OrdersSection.module.css'
import { toast } from 'react-toastify';

const OrdersSection = () => {
   const [orders, setOrders] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchOrders = async () => {
         try {
            const response = await fetchAxios.get(`/orders/my-orders`);
            if (response.data.success) {
               setOrders(response.data.orders);
            }
         } catch (error) {
            console.error('Ошибка при загрузке заказов', error);
            toast.error(error?.response?.data?.message || 'Server error')
         } finally {
            setLoading(false);
         }
      };
      fetchOrders();
   }, []);

   if (loading) return <div className={styles.center}><Loader className='spinner' /></div>
   if (!orders.length) return <div className={styles.center}>У вас ещё не было заказов</div>

   // !!! Остановился тут

   return (
      <div className={`${styles.ordersList} ${styles.container}`}>
         {
            orders.map((order) => (
               <div key={order.order_id} className={styles.orderCard}>

                  {/* Информация о заказе */}
                  <div className={styles.meta}>
                     <div className={styles.group}>
                        <span className={styles.label}>Дата заказа</span>
                        <span className={styles.value}>
                           {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                        </span>
                     </div>
                     <div className={styles.group}>
                        <span className={styles.label}>Номер заказа</span>
                        <span className={styles.value}>№{order.order_id}</span>
                     </div>
                  </div>

                  {/* Список товаров*/}
                  <div className={styles.content}>
                     <span className={styles.label}>Наименование:</span>
                     <div className={styles.itemsList}>
                        {
                           order.items.map((item, idx) => (
                              <div key={idx} className={styles.itemRow}>
                                 <span className={styles.itemName}>
                                    {item.name} {item.size ? `(${item.size})` : ''}
                                 </span>
                                 <span className={styles.itemPrice}>
                                    x{item.quantity} {Number(item.price).toLocaleString()}₽
                                 </span>
                              </div>
                           ))
                        }
                     </div>
                  </div>

                  {/* Итог */}
                  <div className={styles.total}>
                     <span className={styles.label}>Сумма</span>
                     <span className={styles.totalValue}>
                        {Number(order.totalPrice).toLocaleString()}₽
                     </span>
                  </div>

                  {/* Статус */}
                  <div className={styles.status}>
                     <span className={styles.label}>Статус</span>
                     <span
                        className={`${styles.statusBadge} ${styles[getStatusClass(order.status)]}`}
                     >
                        {order.status}
                     </span>
                  </div>
               </div>
            ))
         }
      </div>
   )
};

// Хелпер для определения цвета статуса
const getStatusClass = (status) => {
   switch(status) {
      case 'Доставлен': return 'delivered';
      case 'Оплачен': return 'paid';
      case 'В обработке': return 'processing';
      case 'Получен': return 'received';
      case 'Доставляется': return 'deliver'
      default: return 'new';
   }
}

export default OrdersSection
