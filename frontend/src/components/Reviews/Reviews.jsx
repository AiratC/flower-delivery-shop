import React, { useEffect, useState } from 'react';
import styles from './Reviews.module.css';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import fetchAxios from '../../api/axios'; // Используем ваш настроенный axios

const Reviews = () => {
   const [reviews, setReviews] = useState([]);
   const [currentIndex, setCurrentIndex] = useState(0);
   const [itemsPerPage, setItemsPerPage] = useState(3);
   const [loading, setLoading] = useState(true);

   // Загрузка данных с сервера
   useEffect(() => {
      const loadReviews = async () => {
         try {
            const res = await fetchAxios.get('/reviews/get-end-reviews?limit=10'); // или ваш эндпоинт
            setReviews(res.data.data || res.data); // в зависимости от структуры ответа
         } catch (err) {
            console.error("Не удалось загрузить отзывы", err);
         } finally {
            setLoading(false);
         }
      };
      loadReviews();
   }, []);

   // Логика адаптивности слайдера
   useEffect(() => {
      const handleResize = () => {
         if (window.innerWidth < 640) setItemsPerPage(1);
         else if (window.innerWidth < 1024) setItemsPerPage(2);
         else setItemsPerPage(3);
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
   }, []);

   // Если данных еще нет или идет загрузка, ничего не рендерим (или лоадер)
   if (loading || reviews.length === 0) {
      return null;
   }

   const maxIndex = Math.max(0, reviews.length - itemsPerPage);

   const next = () => setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
   const prev = () => setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));

   return (
      <section className={`container ${styles.reviewsSection}`}>
         <div className={styles.header}>
            <h2 className={styles.title}>ОТЗЫВЫ</h2>
            <Link to="/reviews" className={`navLink`}>Смотреть все</Link>
         </div>

         <div className={styles.viewport}>
            <div
               className={styles.track}
               style={{
                  transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
               }}
            >
               {reviews.map((review) => (
                  <div
                     key={review.review_id}
                     className={styles.slide}
                     style={{ flex: `0 0 ${100 / itemsPerPage}%` }}
                  >
                     <div className={styles.reviewItem}>
                        <div className={styles.reviewHeader}>
                           <div className={styles.userInfo}>
                              <h4 className={styles.userName}>{review.name}</h4>
                              <span className={styles.meta}>
                                 {new Date(review.created_at).toLocaleDateString()} {review.city}
                              </span>
                           </div>
                           <div className={styles.rating}>
                              {[...Array(5)].map((_, i) => (
                                 <Star
                                    key={i}
                                    size={14}
                                    className={i < review.rating ? styles.starFilled : styles.starEmpty}
                                    fill={i < review.rating ? "#76bc21" : "none"} // Добавил заливку
                                 />
                              ))}
                           </div>
                        </div>
                        <p className={styles.text}>{review.comment}</p>
                     </div>
                  </div>
               ))}
            </div>

            {/* Кнопки управления показываем только если отзывов больше, чем влезает на экран */}
            {reviews.length > itemsPerPage && (
               <div className={styles.controls}>
                  <div className={styles.navButtons}>
                     <button onClick={prev} className={styles.navBtn}><ChevronLeft size={20} /></button>
                     <button onClick={next} className={styles.navBtn}><ChevronRight size={20} /></button>
                  </div>
               </div>
            )}
         </div>
      </section>
   );
};

export default Reviews;