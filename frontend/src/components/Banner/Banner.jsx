import React, { useEffect, useState } from 'react'
import styles from './Banner.module.css'
import bannerImg1 from './../../assets/images/bannerImg-1.webp';
import bannerImg2 from './../../assets/images/bannerImg-2.webp';
import bannerImg3 from './../../assets/images/bannerImg-3.webp';

const slides = [
   {
      id: 1,
      subtitle: "Доставка цветов в городе",
      title: "Владивосток",
      image: bannerImg1
   },
   {
      id: 2,
      subtitle: "Свежие букеты",
      title: "Лучшие цены",
      image: bannerImg2
   },
   {
      id: 3,
      subtitle: "Подарки и декор",
      title: "Цветочная лавка",
      image: bannerImg3
   }
];

const Banner = () => {
   const [current, setCurrent] = useState(0);

   // Автопереключение каждые 5 секунд
   useEffect(() => {
      const timer = setInterval(() => {
         setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      }, 3000);

      return () => clearInterval(timer);
   }, []);

   const goToSlide = (index) => {
      setCurrent(index);
   };

   return (
      <section className={styles.bannerContainer}>
         {/* Слайды */}
         <div
            className={styles.slider}
            style={{ transform: `translateX(-${current * 100}%)` }}
         >
            {slides.map((slide) => (
               <div key={slide.id} className={styles.slide}>
                  <img src={slide.image} alt={slide.title} className={styles.image} />
                  <div className={styles.content}>
                     <p className={styles.subtitle}>{slide.subtitle}</p>
                     <h1 className={styles.title}>{slide.title}</h1>
                     <button className={styles.button}>Каталог</button>
                  </div>
               </div>
            ))}
         </div>

         {/* Пагинация (точки) */}
         <div className={styles.dots}>
            {slides.map((_, index) => (
               <button
                  key={index}
                  className={`${styles.dot} ${current === index ? styles.activeDot : ''}`}
                  onClick={() => goToSlide(index)}
               />
            ))}
         </div>
      </section>
   );
}

export default Banner
