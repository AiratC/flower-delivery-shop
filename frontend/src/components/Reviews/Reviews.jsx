import React, { useEffect, useState } from 'react';
import styles from './Reviews.module.css';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const reviewsData = [
   {
      id: 1,
      name: 'Анатолий Петров',
      date: '20.08.19 22:32',
      city: 'г. Москва',
      rating: 4,
      text: 'Огромное спасибо флористам! Остались очень довольны оказанными услугами, мастера своего дела! Букетик даже неожиданно красивее чем на картинке'
   },
   {
      id: 2,
      name: 'Анатолий Петров',
      date: '20.08.19 22:32',
      city: 'г. Москва',
      rating: 4,
      text: 'Огромное спасибо флористам! Остались очень довольны оказанными услугами, мастера своего дела! Букетик даже неожиданно красивее чем на картинке'
   },
   {
      id: 3,
      name: 'Анатолий Петров',
      date: '20.08.19 22:32',
      city: 'г. Москва',
      rating: 5,
      text: 'Огромное спасибо флористам! Остались очень довольны оказанными услугами, мастера своего дела! Букетик даже неожиданно красивее чем на картинке'
   },
   {
      id: 4,
      name: 'Анатолий Петров',
      date: '20.08.19 22:32',
      city: 'г. Москва',
      rating: 4,
      text: 'Огромное спасибо флористам! Остались очень довольны оказанными услугами, мастера своего дела! Букетик даже неожиданно красивее чем на картинке'
   },
   {
      id: 5,
      name: 'Анатолий Петров',
      date: '20.08.19 22:32',
      city: 'г. Москва',
      rating: 4,
      text: 'Огромное спасибо флористам! Остались очень довольны оказанными услугами, мастера своего дела! Букетик даже неожиданно красивее чем на картинке'
   },
   {
      id: 6,
      name: 'Анатолий Петров',
      date: '20.08.19 22:32',
      city: 'г. Москва',
      rating: 5,
      text: 'Огромное спасибо флористам! Остались очень довольны оказанными услугами, мастера своего дела! Букетик даже неожиданно красивее чем на картинке'
   },
   // Можно добавить еще объекты для примера
];

const Reviews = () => {
   const [currentIndex, setCurrentIndex] = useState(0);
   const [itemsPerPage, setItemsPerPage] = useState(3);

   // Определяем сколько карточек показывать в зависимости от ширины экрана
   useEffect(() => {
      const handleResize = () => {
         if(window.innerWidth < 640) setItemsPerPage(1);
         else if (window.innerWidth < 1024) setItemsPerPage(2);
         else setItemsPerPage(3);
      };

      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize)
   }, []);

   const maxIndex = Math.max(0, reviewsData.length - itemsPerPage);

   const next = () => setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
   const prev = () => setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));

   return (
      <section className={`container ${styles.reviewsSection}`}>
         <div className={styles.header}>
            <h2 className={styles.title}>ОТЗЫВЫ</h2>
            <a href="/reviews" className={styles.showAll}>Смотреть все</a>
            
         </div>

         <div className={styles.viewport}>
            <div 
               className={styles.track} 
               style={{ 
                  transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
               }}
            >
               {reviewsData.map((review) => (
                  <div 
                     key={review.id} 
                     className={styles.slide}
                     style={{ flex: `0 0 ${100 / itemsPerPage}%` }}
                  >
                     <div className={styles.reviewItem}>
                        <div className={styles.reviewHeader}>
                           <div className={styles.userInfo}>
                              <h4 className={styles.userName}>{review.name}</h4>
                              <span className={styles.meta}>{review.date} {review.city}</span>
                           </div>
                           <div className={styles.rating}>
                              {[...Array(5)].map((_, i) => (
                                 <Star key={i} size={14} className={i < review.rating ? styles.starFilled : styles.starEmpty} />
                              ))}
                           </div>
                        </div>
                        <p className={styles.text}>{review.text}</p>
                     </div>
                  </div>
               ))}
            </div>
            <div className={styles.controls}>
               <div className={styles.navButtons}>
                  <button onClick={prev} className={styles.navBtn}><ChevronLeft size={20} /></button>
                  <button onClick={next} className={styles.navBtn}><ChevronRight size={20} /></button>
               </div>
            </div>
         </div>
      </section>
   );
};

export default Reviews;