import React, { useEffect, useState, useCallback } from 'react';
import fetchAxios from '../../api/axios';
import styles from './AdminOrders.module.css';
import { toast } from 'react-toastify';
import { Loader, PackageOpen } from 'lucide-react'; // Добавили PackageOpen

const AdminOrders = () => {
   const [orders, setOrders] = useState([]);
   const [loading, setLoading] = useState(true);

   const statuses = ['Новый', 'В обработке', 'Оплачен', 'Доставляется', 'Доставлен', 'Получен', 'Отменён'];
   const finalStatuses = ['Доставлен', 'Получен', 'Отменён'];

   const fetchOrders = useCallback(async (isSilent = false) => {
      try {
         if (!isSilent) setLoading(true);
         const res = await fetchAxios.get('/orders/get-all-orders');

         setOrders(prev => {
            if (prev.length > 0 && res.data.length > prev.length) {
               toast.info("Поступил новый заказ!");
            }
            return res.data;
         });
      } catch (e) {
         console.error("Ошибка загрузки", e);
      } finally {
         setLoading(false);
      }
   }, []);

   useEffect(() => {
      fetchOrders();
      const interval = setInterval(() => fetchOrders(true), 30000);
      const handleFocus = () => fetchOrders(true);
      window.addEventListener('focus', handleFocus);
      return () => {
         clearInterval(interval);
         window.removeEventListener('focus', handleFocus);
      };
   }, [fetchOrders]);

   const changeStatus = async (id, newStatus) => {
      try {
         await fetchAxios.patch(`/orders/${id}/status`, { newStatus });
         toast.success("Статус обновлен");
         fetchOrders(true);
      } catch (e) {
         toast.error(e.response?.data?.message || "Ошибка");
      }
   };

   if (loading && orders.length === 0) {
      return (
         <div className={styles.loader}>
            <Loader className='spinner' size={70} />
            <p>Загрузка данных...</p>
         </div>
      );
   }

   return (
      <div className={styles.adminPage}>
         <div className={styles.headerRow}>
            <h1 className={styles.title}>Управление заказами</h1>
            <button onClick={() => fetchOrders()} className={styles.refreshBtn}>
               Обновить вручную
            </button>
         </div>

         {orders.length === 0 ? (
            <div className={styles.emptyState}>
               <PackageOpen size={80} strokeWidth={1} />
               <h2>Заказов пока нет</h2>
               <p>Как только клиент оформит заказ, он сразу появится в этом списке.</p>
               <button onClick={() => fetchOrders()} className={styles.emptyRefreshBtn}>
                  Проверить снова
               </button>
            </div>
         ) : (
            <div className={styles.tableWrapper}>
               <table className={styles.table}>
                  <thead>
                     <tr>
                        <th>№</th>
                        <th>Дата</th>
                        <th>Заказчик</th>
                        <th>Получатель</th>
                        <th>Сумма</th>
                        <th>Статус</th>
                     </tr>
                  </thead>
                  <tbody>
                     {orders.map(order => (
                        <tr key={order.order_id} className={order.status === 'Новый' ? styles.statusNew : ''}>
                           <td className={styles.orderId}>#{order.order_id}</td>
                           <td>{new Date(order.created_at).toLocaleDateString('ru-RU')}</td>
                           <td>
                              <div className={styles.clientInfo}>
                                 <strong>{order.customer_name}</strong>
                                 <span>{order.customer_phone}</span>
                              </div>
                           </td>
                           <td>{order.recipient_name}</td>
                           <td className={styles.price}>{order.total_price} ₽</td>
                           <td>
                              <select
                                 className={styles.statusSelect}
                                 value={order.status}
                                 disabled={finalStatuses.includes(order.status)}
                                 onChange={(e) => changeStatus(order.order_id, e.target.value)}
                              >
                                 {statuses.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                 ))}
                              </select>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}
      </div>
   );
};

export default AdminOrders;