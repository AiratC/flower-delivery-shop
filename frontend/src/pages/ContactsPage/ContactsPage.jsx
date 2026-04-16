import React from 'react'
import styles from './ContactsPage.module.css';
import FeedbackForm from '../../components/FeedbackForm/FeedbackForm';

const ContactsPage = () => {


   return (
      <div className={`container`}>
         <nav className={styles.breadCrumb}>Главная &gt; Контакты</nav>
         <h1 className={styles.mainTitle}>КОНТАКТНАЯ ИНФОРМАЦИЯ</h1>

         <div className={styles.topGrid}>

            {/* Карточка с инфо */}
            <div className={styles.infoCard}>
               <div className={styles.infoSection}>
                  <span className={styles.label}>Моб. номер:</span>
                  <p className={styles.value}>+ 7 808 353 53 35</p>
                  <p className={styles.value}>+ 7 978 345 7989</p>
               </div>

               <div className={styles.infoSection}>
                  <span className={styles.label}>Эл. почта</span>
                  <p className={styles.value}>flawka_vl@gmail.com</p>
               </div>

               <div className={styles.infoSection}>
                  <span className={styles.label}>Адрес:</span>
                  <p className={styles.value}>г. Владивосток, ул. Пушкинская, 17 А</p>
               </div>

               <div className={styles.infoSection}>
                  <span className={styles.label}>Режим работы:</span>
                  <p className={styles.value}>Пн-Сб с 8:00 до 22:00</p>
                  <p className={styles.value}>Вс - выходной</p>
               </div>
            </div>

            {/* Карта */}
            <div className={styles.mapContainer}>
               <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3583.715953823029!2d131.8958394766093!3d43.11543618704502!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5fb3920a9431128f%3A0xa0e506aae983eae6!2z0J_Rg9GI0LrQuNC90YHQutCw0Y8g0YPQuy4sIDE3INCwLCDQktC70LDQtNC40LLQvtGB0YLQvtC6LCDQn9GA0LjQvNC-0YDRgdC60LjQuSDQutGA0LDQuSwg0KDQvtGB0YHQuNGPLCA2OTAwOTE!5e1!3m2!1sru!2sca!4v1776362423609!5m2!1sru!2sca"
                  width="100%"
                  height="100%"
                  style={{ border: 0, borderRadius: '12px' }}
                  loading="lazy">
               </iframe>
            </div>

         </div>

         {/* Форма обратной связи */}
         <FeedbackForm />
      </div>
   )
}

export default ContactsPage
