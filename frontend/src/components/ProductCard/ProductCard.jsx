import React, { useCallback, useMemo, useState } from 'react'
import styles from './ProductCard.module.css'
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/slices/cartSlice';

const ProductCard = ({ data, isLoading }) => {
   console.log(data)
   const navigate = useNavigate();
   // Состояние для отслеживания загрузки самой картинки
   const [isImageLoaded, setIsImageLoaded] = useState(false);

   const dispatch = useDispatch();

   const handleQuickAdd = useCallback(async (e) => {
         e.stopPropagation();
   
         // дефолтный вариант
         const defaultSize = {
            flower_id: data.flower_id,
            is_default: true,
            price_new: 1040,
            price_old: null,
            size_name: "Малый",
            variant_id: 37
         }
   
         dispatch(addToCart({
            itemId: data.flower_id,
            itemType: 'flower',
            selectedSize: defaultSize,
            quantity: 1
         }));
      }, [dispatch, data.flower_id, data.variants])

   const fullImageUrl = useMemo(() => {
      const imageUrl = data?.images && data?.images.length > 0 ? data?.images[0] : '/placeholder.webp';
      return `${import.meta.env.VITE_BACKEND_URL}${imageUrl}`
   }, [data?.images]);

   // eslint-disable-next-line react-hooks/preserve-manual-memoization
   const handleClickCard = useCallback(() => {
      if (!isLoading && data?.flower_id) {
         navigate(`/flower-card/${data.flower_id}`);
      }
   }, [navigate, data?.flower_id, isLoading]);

   // Функция обработки успешной загрузки изображения
   const handleImageLoad = () => {
      setIsImageLoaded(true);
   };

   // Функция обработки ошибки загрузки изображения
   const handleImageError = () => {
      setIsImageLoaded(true);
   };

   // Внешний флаг isLoading (если данные ещё не пришли)
   const showSkeleton = isLoading || !isImageLoaded;


   // eslint-disable-next-line react-hooks/preserve-manual-memoization
   const displayTitle = useMemo(() => {
      if(!data?.title) return '';
      return data.title.length > 28 ? `${data.title.slice(0, 28)}...` : data.title;
   }, [data?.title]) 

   return (
      <div
         onClick={handleClickCard}
         className={`${styles.card} ${showSkeleton ? styles.isLoading : ''}`}
         role='link'
         tabIndex={0}
         onKeyDown={(e) => e.key === 'Enter' && handleClickCard()}
      >
         {/* Скелетон для всего блока, если isLoading передан снаружи */}
         {showSkeleton && <div className={`${styles.skeletonOverlay}`} />}

         <div className={styles.imageWrapper}>
            {/* Бейджи на основе статуса товара */}
            {
               !showSkeleton && (
                  <div className={styles.badgesWrapper}>
                     {data.is_new && <span className={`${styles.badge} ${styles.new}`}>Новинка</span>}
                     {data.is_sale && <span className={`${styles.badge} ${styles.sale}`}>Акция</span>}
                  </div>
               )
            }

            {/* Скелетон для картинки */}
            {!isImageLoaded && <div className={styles.imageSkeleton} />}


            <img
               src={fullImageUrl}
               alt={data?.title}
               className={`${styles.image} ${isImageLoaded ? styles.imageVisible : styles.imageHidden}`}
               loading='lazy'
               onLoad={handleImageLoad}
               onError={handleImageError}
            />
         </div>

         <div className={styles.info}>
            {/* Скелетон для заголовка */}
            {
               showSkeleton ? (
                  <div className={styles.titleSkeleton} />
               ) : (
                  <h3 className={styles.title}>{displayTitle}</h3>
               )
            }

            {/* Скелетон для цены */}
            {
               showSkeleton ? (
                  <div className={styles.priceSkeleton} />
               ) : (
                  <div className={styles.priceRow}>
                     <span className={styles.priceLabel}>Стоимость:</span>
                     <span className={styles.priceValue}>
                        от {data.price || data.min_price} руб.
                     </span>
                     {data.discount_price && (
                        <span className={styles.oldPrice}>{data.min_price} руб.</span>
                     )}
                  </div>
               )
            }

            {/* Скелетон для кнопки */}
            {
               showSkeleton ? (
                  <div className={styles.buttonSkeleton} />
               ) : (
                  <button onClick={handleQuickAdd} className={styles.button}>
                     В корзину
                  </button>
               )
            }
         </div>
      </div>
   );
}

export default React.memo(ProductCard);
