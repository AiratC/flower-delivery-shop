import React, { useState, useRef, useCallback } from 'react';
import styles from './Features.module.css';

// Импорт картинок (прим. для Vite/Webpack)
import iconCar from '../../assets/features/iconCar.webp';
import iconCard from '../../assets/features/iconCard.webp';
import iconClock from '../../assets/features/iconClock.webp';
import iconPercent from '../../assets/features/iconPercent.webp';

const featuresData = [
   {
      id: 1,
      icon: iconCar,
      text: <>Бесплатная <span className={styles.highlight}>доставка</span> по городу</>
   },
   {
      id: 2,
      icon: iconCard,
      text: <>Открытка <span className={styles.highlight}>в подарок</span> и фото вручения</>
   },
   {
      id: 3,
      icon: iconClock,
      text: <><span className={styles.highlight}>Круглосуточная</span> доставка</>
   },
   {
      id: 4,
      icon: iconPercent,
      text: <>Накопительная система <span className={styles.highlight}>скидок</span></>
   }
];

const Features = () => {
   const [activeIndex, setActiveIndex] = useState(0);
   const trackRef = useRef(null);

   // Обработчик скролла для обновления активной точки
   const handleScroll = useCallback(() => {
      if (!trackRef.current) return;

      const scrollLeft = trackRef.current.scrollLeft;
      const width = trackRef.current.offsetWidth;

      // Вычисляем индекс текущего слайда
      const index = Math.round(scrollLeft / width);
      setActiveIndex(index);
   }, []);

   // Функция для клика по точке (прокрутка слайда)
   const scrollToSlide = (index) => {
      if (!trackRef.current) return;

      const width = trackRef.current.offsetWidth;
      trackRef.current.scrollTo({
         left: width * index,
         behavior: 'smooth'
      });
   };


   return (
      <section className={styles.section}>
         <div className={`container`}>
            {/* Лента с элементами */}
            <div
               className={styles.track}
               ref={trackRef}
               onScroll={handleScroll}
            >
               {featuresData.map((item) => (
                  <div key={item.id} className={styles.item}>
                     <div className={styles.iconWrapper}>
                        <img src={item.icon} alt="Иконка" className={styles.iconImg} />
                     </div>
                     <p className={styles.text}>{item.text}</p>
                  </div>
               ))}
            </div>

            {/* Точки пагинации (активны только на мобильных) */}
            <div className={styles.dots}>
               {featuresData.map((_, index) => (
                  <button
                     key={index}
                     className={`${styles.dot} ${activeIndex === index ? styles.activeDot : ''}`}
                     onClick={() => scrollToSlide(index)}
                  />
               ))}
            </div>
         </div>
      </section>
   );
}

export default Features
