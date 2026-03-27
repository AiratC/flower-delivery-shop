import React, { useCallback, useState } from 'react';
import styles from './Footer.module.css';

const Footer = () => {
   const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      question: ''
   });

   const handleChange = (event) => {
      setFormData(prev => ({ ...prev, [event.target.name]: event.target.value }))
   }

   const handleFormSubmit = useCallback(async (event) => {
      event.preventDefault();
   }, []);

   return (
      <footer className={styles.footer}>
         <div className={styles.container}>
            {/* Верхняя навигация */}
            <nav className={styles.nav}>
               <ul className={styles.navList}>
                  <li><a href="#">Каталог</a></li>
                  <li><a href="#">Скидки</a></li>
                  <li><a href="#">Отзывы</a></li>
                  <li><a href="#">Контакты</a></li>
                  <li><a href="#">Оферта</a></li>
                  <li><a href="#">Информация для клиента</a></li>
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
                        <input onChange={handleChange} name='name' value={formData.name} type="text" placeholder="Ваше имя" className={styles.input} />
                        <input onChange={handleChange} name='phone' value={formData.phone} type="text" placeholder="Моб. номер" className={styles.input} />
                     </div>
                     <textarea onChange={handleChange} name='question' value={formData.question} placeholder="Ваше сообщение" className={styles.textarea} rows="3"></textarea>
                     <button type="submit" className={styles.submitBtn}>Отправить</button>
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