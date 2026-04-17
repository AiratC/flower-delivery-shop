import React, { useEffect, useState } from 'react';
import styles from './MessagesAdmin.module.css';
import { toast } from 'react-toastify';
import { Trash2, CheckCircle, Clock } from 'lucide-react';
import fetchAxios from '../../api/axios';

const MessagesAdmin = () => {
   const [messages, setMessages] = useState([]);
   const [loading, setLoading] = useState(true);

   const fetchMessages = async (isAutoRefresh = false) => {
      try {
         const res = await fetchAxios.get('/messages/questions');
         setMessages(res.data);
         if (!isAutoRefresh) setLoading(false);
      } catch {
         console.error("Ошибка обновления");
      }
   };

   // Авто-обновление каждые 30 секунд
   useEffect(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchMessages();
      const interval = setInterval(() => {
         fetchMessages(true);
      }, 30000); // 30 секунд

      return () => clearInterval(interval);
   }, []);

   const toggleStatus = async (id, currentStatus) => {
      try {
         await fetchAxios.patch(`/messages/questions/${id}`, { is_processed: !currentStatus });
         setMessages(messages.map(m =>
            m.ask_question_id === id ? { ...m, is_processed: !currentStatus } : m
         ));
         toast.info("Статус обновлен");
      } catch {
         toast.error("Ошибка");
      }
   };

   const handleDelete = async (id) => {
      if (!window.confirm("Удалить сообщение?")) return;
      try {
         await fetchAxios.delete(`/messages/questions/${id}`);
         setMessages(messages.filter(m => m.ask_question_id !== id));
         toast.success("Удалено");
      } catch {
         toast.error("Не удалось удалить");
      }
   };

   if (loading) return <div>Загрузка сообщений...</div>;

   return (
      <div className={styles.adminContainer}>
         <h2>Сообщения от клиентов</h2>
         <div className={styles.grid}>
            {messages.map((msg) => (
               <div
                  key={msg.ask_question_id}
                  className={`${styles.card} ${msg.is_processed ? styles.processed : styles.new}`}
               >
                  <div className={styles.header}>
                     <div className={styles.userInfo}>
                        <h4>{msg.name}</h4>
                        <span className={styles.date}>
                           {new Date(msg.created_at).toLocaleString('ru-RU')}
                        </span>
                     </div>
                     {msg.is_processed ? <CheckCircle color="#28a745" size={20} /> : <Clock color="#ffc107" size={20} />}
                  </div>

                  <div className={styles.contacts}>
                     <div>📧 {msg.email || 'Не указан'}</div>
                     <div>📞 {msg.phone || 'Не указан'}</div>
                  </div>

                  <div className={styles.questionText}>
                     {msg.question}
                  </div>

                  <div className={styles.actions}>
                     <button
                        onClick={() => toggleStatus(msg.ask_question_id, msg.is_processed)}
                        className={styles.statusBtn}
                        style={{
                           backgroundColor: msg.is_processed ? '#f0f0f0' : '#28a745',
                           color: msg.is_processed ? '#333' : '#fff'
                        }}
                     >
                        {msg.is_processed ? 'В ожидание' : 'Обработано'}
                     </button>
                     <button
                        onClick={() => handleDelete(msg.ask_question_id)}
                        className={styles.deleteBtn}
                     >
                        <Trash2 size={18} />
                     </button>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
};

export default MessagesAdmin;
