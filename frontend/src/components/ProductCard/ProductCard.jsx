import React from 'react'
import styles from './ProductCard.module.css'

const ProductCard = ({ data }) => {
   // Предполагаем, что картинки приходят как JSON-строка или массив из БД
   const imageUrl = data.images ? data.images[0] : '';
   const fullImageUrl = `${import.meta.env.VITE_BACKEND_URL}${imageUrl}`;

   return (
      <div className={styles.card}>
         <div className={styles.imageWrapper}>
            {/* Бейджи на основе статуса товара */}
            {data.is_new && <span className={`${styles.badge} styles.new`}>Новинка</span>}
            {data.discount_price && <span className={`${styles.badge} styles.sale`}>Акция</span>}

            <img
               src={fullImageUrl}
               alt={data.title}
               className={styles.image}
            />
         </div>

         <div className={styles.info}>
            <h3 className={styles.title}>{data.title}</h3>

            <div className={styles.priceRow}>
               <span className={styles.priceLabel}>Стоимость:</span>
               <span className={styles.priceValue}>
                  от {data.price || data.min_price} руб.
               </span>
               {data.discount_price && (
                  <span className={styles.oldPrice}>{data.min_price} руб.</span>
               )}
            </div>

            <button className={styles.button}>
               В корзину
            </button>
         </div>
      </div>
   );
}

export default ProductCard
