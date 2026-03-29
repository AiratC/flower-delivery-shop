import React, { useCallback, useMemo } from 'react'
import styles from './ProductCard.module.css'
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ data }) => {
   // Предполагаем, что картинки приходят как JSON-строка или массив из БД
   
   const fullImageUrl = useMemo(() => {
      const imageUrl = data.images && data.images.length > 0 ? data.images[0] : '/placeholder.webp';
      return `${import.meta.env.VITE_BACKEND_URL}${imageUrl}`
   }, [data.images]);

   const navigate = useNavigate();

   const handleClickCard = useCallback(() => {
      navigate(`/flower-card/${data.flower_id}`);
   }, [navigate, data.flower_id])

   const handleClickAddToCart = useCallback(async (event) => {
      event.stopPropagation();
      console.log('add to cart', data.flower_id)
   }, [data.flower_id]);

   const displayTitle = data.title.length > 28 ? `${data.title.slice(0, 28)}...` : data.title;

   return (
      <div 
      onClick={handleClickCard} 
      className={styles.card}
      role='link'
      tabIndex={0}
      >
         <div className={styles.imageWrapper}>
            {/* Бейджи на основе статуса товара */}
            {data.is_new && <span className={`${styles.badge} ${styles.new}`}>Новинка</span>}
            {data.is_sale && <span className={`${styles.badge} ${styles.sale}`}>Акция</span>}

            <img
               src={fullImageUrl}
               alt={data.title}
               className={styles.image}
               loading='lazy'
            />
         </div>

         <div className={styles.info}>
            <h3 className={styles.title}>{displayTitle}</h3>

            <div className={styles.priceRow}>
               <span className={styles.priceLabel}>Стоимость:</span>
               <span className={styles.priceValue}>
                  от {data.price || data.min_price} руб.
               </span>
               {data.discount_price && (
                  <span className={styles.oldPrice}>{data.min_price} руб.</span>
               )}
            </div>

            <button onClick={(event) => handleClickAddToCart(event)} className={styles.button}>
               В корзину
            </button>
         </div>
      </div>
   );
}

export default React.memo(ProductCard);
