import React, { useEffect, useState, useCallback, useRef } from 'react'
import fetchAxios from '../../api/axios';
import { Loader, ShoppingBag } from 'lucide-react';
import styles from './OrdersSection.module.css'
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';


const OrdersSection = () => {
   const [orders, setOrders] = useState([]);
   const [isFirstLoading, setIsFirstLoading] = useState(true);
   
   // Используем useRef для хранения текущих заказов. 
   // Это позволит проверять изменения статуса без перезапуска useCallback.
   const ordersRef = useRef([]);

   const fetchOrders = useCallback(async (isSilent = false) => {
      try {
         if (!isSilent) setIsFirstLoading(true);

         const response = await fetchAxios.get(`/orders/my-orders`);
         
         if (response.data.success) {
            const newOrders = response.data.orders;

            // Сравниваем с предыдущим состоянием из Ref
            if (isSilent && ordersRef.current.length > 0 && newOrders.length === ordersRef.current.length) {
               const hasChanges = newOrders.some((order, idx) => 
                  order.status !== ordersRef.current[idx]?.status
               );
               if (hasChanges) {
                  toast.info("Статус вашего заказа обновился!");
               }
            }
            
            setOrders(newOrders);
            ordersRef.current = newOrders; // Обновляем реф
         }
      } catch (error) {
         console.error('Ошибка при загрузке заказов', error);
         if (!isSilent) toast.error(error?.response?.data?.message || 'Ошибка сервера');
      } finally {
         setIsFirstLoading(false);
      }
   }, []); // Теперь зависимостей нет, функция стабильна

   useEffect(() => {
      fetchOrders();

      const interval = setInterval(() => {
         fetchOrders(true);
      }, 30000);

      const handleFocus = () => fetchOrders(true);
      window.addEventListener('focus', handleFocus);

      return () => {
         clearInterval(interval);
         window.removeEventListener('focus', handleFocus);
      };
   }, [fetchOrders]);

   // Рендерим Loader только при самом первом входе
   if (isFirstLoading) {
      return (
         <div className={styles.center}>
            <Loader className='spinner' size={40} />
         </div>
      );
   }

   // Если после загрузки заказов нет — показываем пустую корзину
   if (orders.length === 0) {
      return (
         <div className={styles.emptyContainer}>
            <ShoppingBag size={60} strokeWidth={1} color="#cbd5e0" />
            <h3>У вас еще нет заказов</h3>
            <p>Самое время порадовать себя или близких прекрасным букетом!</p>
            <Link to="/" className={styles.shopBtn}>Перейти в каталог</Link>
         </div>
      );
   }

   return (
      <div className={`${styles.ordersList} ${styles.container}`}>
         {orders.map((order) => (
            <div key={order.order_id} className={styles.orderCard}>
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

               <div className={styles.content}>
                  <span className={styles.label}>Наименование:</span>
                  <div className={styles.itemsList}>
                     {order.items.map((item, idx) => (
                        <div key={idx} className={styles.itemRow}>
                           <span className={styles.itemName}>
                              {item.name} {item.size ? `(${item.size})` : ''}
                           </span>
                           <span className={styles.itemPrice}>
                              x{item.quantity} {Number(item.price).toLocaleString()}₽
                           </span>
                        </div>
                     ))}
                  </div>
               </div>

               <div className={styles.total}>
                  <span className={styles.label}>Сумма</span>
                  <span className={styles.totalValue}>
                     {Number(order.totalPrice).toLocaleString()}₽
                  </span>
               </div>

               <div className={styles.status}>
                  <span className={styles.label}>Статус</span>
                  <span className={`${styles.statusBadge} ${styles[getStatusClass(order.status)]}`}>
                     {order.status}
                  </span>
               </div>
            </div>
         ))}
      </div>
   )
};

const getStatusClass = (status) => {
   switch (status) {
      case 'Доставлен': return 'delivered';
      case 'Оплачен': return 'paid';
      case 'В обработке': return 'processing';
      case 'Получен': return 'received';
      case 'Доставляется': return 'deliver';
      case 'Отменён': return 'canceled';
      default: return 'new';
   }
}

export default OrdersSection;
