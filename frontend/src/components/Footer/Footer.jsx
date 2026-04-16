import React, { useCallback, useState } from 'react';
import styles from './Footer.module.css';
import fetchAxios from '../../api/axios';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
   const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      question: ''
   });
   const [isSubmitting, setIsSubmitting] = useState(false);

   const handleChange = (event) => {
      setFormData(prev => ({ ...prev, [event.target.name]: event.target.value }))
   }

   const handleFormSubmit = useCallback(async (event) => {
      event.preventDefault();

      // Простая проверка перед отправкой
      if (!formData.name.trim() || !formData.phone.trim() || !formData.question.trim()) {
         return toast.warning("Пожалуйста, заполните обязательные поля");
      }

      try {
         setIsSubmitting(true);
         const response = await fetchAxios.post(`/messages/send-message`, formData);
         if (response.data.success) {
            toast.success(response.data.message);
            // Очищаем форму после успеха
            setFormData({
               name: '',
               email: '',
               phone: '',
               question: ''
            });
         }
      } catch (error) {
         // Добавляем опциональную цепочку на случай, если сервера нет или ответа нет
         const errorMessage = error.response?.data?.message || "Ошибка при отправке";
         toast.error(errorMessage);
      } finally {
         setIsSubmitting(false)
      }
   }, [formData]);

   return (
      <footer className={styles.footer}>
         <div className={styles.container}>
            {/* Верхняя навигация */}
            <nav className={styles.nav}>
               <ul className={styles.navList}>
                  <li><Link to={`/faq`}>FAQ</Link></li>
                  <li><Link to={`/stocks`}>Скидки</Link></li>
                  <li><Link to={``}>Отзывы</Link></li>
                  <li><Link to={`/contacts`}>Контакты</Link></li>
                  <li><Link to={``}>Оферта</Link></li>
                  <li><Link to={``}>Информация для клиента</Link></li>
               </ul>
            </nav>

            <hr className={styles.divider} />

            {/* Основной блок */}
            <div className={styles.content}>
               {/* Контакты */}
               <div className={styles.column}>
                  <h3 className={styles.title}>Контактная информация</h3>
                  <div className={styles.contactItem}>
                     <span className={styles.icon}>📍</span>
                     г. Владивосток, ул. Пушкинская, 17
                  </div>
                  <div className={styles.contactItem}>
                     <span className={styles.icon}>📞</span>
                     + 7 888 888 88 88
                  </div>
                  <div className={styles.contactItem}>
                     <span className={styles.icon}>📞</span>
                     + 7 888 888 88 88
                  </div>
                  <div className={styles.workHours}>
                     <span className={styles.icon}>🕒</span>
                     Режим работы: Пн-Сб с 8:00 до 22:00
                  </div>
               </div>

               {/* Ссылки */}
               <div className={styles.column}>
                  <h3 className={styles.title}>Для посетителей</h3>
                  <ul className={styles.linkList}>
                     <li><a href="#">Оформление заказа</a></li>
                     <li><a href="#">Вопросы и ответы</a></li>
                     <li><a href="#">Изменение или отмена заказа</a></li>
                     <li><a href="#">Способы доставки и оплаты</a></li>
                  </ul>
               </div>

               {/* Форма */}
               <div className={`${styles.column} ${styles.formColumn}`}>
                  <h3 className={styles.title}>Возникли вопросы? Свяжитесь с нами</h3>
                  <form onSubmit={handleFormSubmit} className={styles.form}>
               <div className={styles.inputGroup}>
                  <input 
                     onChange={handleChange} 
                     name='name' 
                     value={formData.name} 
                     type="text" 
                     placeholder="Ваше имя" 
                     className={styles.input} 
                     disabled={isSubmitting} // Блокируем ввод при отправке
                  />
                  <input 
                     onChange={handleChange} 
                     name='phone' 
                     value={formData.phone} 
                     type="text" 
                     placeholder="Моб. номер" 
                     className={styles.input} 
                     disabled={isSubmitting}
                  />
               </div>
               <textarea 
                  onChange={handleChange} 
                  name='question' 
                  value={formData.question} 
                  placeholder="Ваше сообщение" 
                  className={styles.textarea} 
                  rows="3"
                  disabled={isSubmitting}
               ></textarea>
               
               <button 
                  type="submit" 
                  className={styles.submitBtn} 
                  disabled={isSubmitting} // Блокируем кнопку
               >
                  {isSubmitting ? (
                     <div className={styles.loaderContent}>
                        <Loader2 className={`spinner`} size={18} />
                     </div>
                  ) : (
                     "Отправить"
                  )}
               </button>
            </form>
               </div>
            </div>

            <div className={styles.copyright}>
               © 2019 Цветочная лавка.
            </div>
         </div>
      </footer>
   );
};

export default Footer;