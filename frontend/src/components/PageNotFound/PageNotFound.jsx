import React from 'react';
import { Link } from 'react-router-dom';
import styles from './PageNotFound.module.css';
// Импортируй подготовленную картинку 404
import image404 from '../../assets/images/404.webp';

const PageNotFound = () => {
   return (
      <main className={styles.wrapper}>
         <div className={`container ${styles.container}`}>

            {/* Большая картинка 404 с цветами */}
            <div className={styles.imageBlock}>
               <img src={image404} alt="Ошибка 404: Страница не найдена" className={styles.img404} />
            </div>

            {/* Текстовый блок */}
            <div className={styles.textBlock}>
               <h1 className={styles.title}>Упс... Что-то пошло не так.</h1>
               <p className={styles.description}>
                  Похоже, эта страница затерялась среди наших букетов.
                  Вернитесь на главную, а мы пока всё починим.
               </p>
            </div>

            {/* Кнопка "На главную" */}
            <div className={styles.actionBlock}>
               <Link to="/" className={styles.homeBtn}>
                  На главную
               </Link>
            </div>

         </div>
      </main>
   );
};

export default PageNotFound;