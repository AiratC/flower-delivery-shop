import React, { useCallback, useMemo, useState } from 'react'
import styles from './ProductCard.module.css'
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeItem, updateQty } from '../../redux/slices/cartSlice';
import { Loader } from 'lucide-react';
import { toast } from 'react-toastify';

const ProductCard = ({ data, isLoading }) => {
   // Состояние для отслеживания загрузки самой картинки
   const [isImageLoaded, setIsImageLoaded] = useState(false);
   // Локальный индикатор для кнопок
   const [isUpdating, setIsUpdating] = useState(false);
   const dispatch = useDispatch();
   const navigate = useNavigate();

   // Получаем айтемы из стора
   const cartItems = useSelector(state => state.cart.items);

   // Ищем, есть ли этот конкретный товар в корзине
   // Для ProductCard мы берём размер по умолчанию (Малый или из данных)
   const cartItem = useMemo(() => {
      return cartItems.find(item => {
         return item.item_id === data?.flower_id &&
         item.item_type === 'flower' &&
         item.selected_size === (data.size_name || 'Малый')
      })
   }, [cartItems, data]);

   // Оптимизированная функция действий
   const handleCartAction = useCallback(async (action) => {
      if(isUpdating) return;

      // Если переданы данные для немедленного обновления (количество)
      //  можно было диспатчить их сразу здесь, но мы сделаем это в функциях ниже

      setIsUpdating(true);
      try {
         const response = await dispatch(action).unwrap();
         if(response.success) {
            toast.success(response.message);
         };
      } catch (error) {
         toast.error(error?.response?.data?.message || 'Ошибка');
      } finally {
         setIsUpdating(false);
      }
   }, [isUpdating, dispatch])

   // Увеличиваем кол-во товара в корзине
   const handleIncrease = (e) => {
      e.stopPropagation();
      const nextQty = cartItem.quantity + 1;
      handleCartAction(updateQty({ cartItemId: cartItem.cart_item_id, quantity: nextQty }));
   };

   // Уменьшаем кол-во товара в корзине
   const handleDecrease = (e) => {
      e.stopPropagation();
      if(cartItem.quantity > 1) {
         handleCartAction(updateQty({ cartItemId: cartItem.cart_item_id, quantity: cartItem.quantity - 1 }));
      } else {
         handleCartAction(removeItem(cartItem.cart_item_id));
      }
   }


   const handleQuickAdd = useCallback(async (e) => {
      e.stopPropagation();

      // Проверяем наличие id, чтобы избежать ошибок на пустых данных
      if (!data?.flower_id) return;

      handleCartAction(addToCart({
         itemId: data.flower_id,
         itemType: 'flower',
         // ПЕРЕДАЕМ СТРОКУ, А НЕ ОБЪЕКТ
         // На твоем скриншоте это поле называлось "size_name"
         selectedSize: data.size_name || "Малый",
         quantity: 1
      }));
   }, [data.flower_id, data.size_name, handleCartAction]); // В зависимостях достаточно самого data

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

   const displayTitle = useMemo(() => {
      if (!data?.title) return '';
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
               ) : cartItem ? (
                  // Если товар в корзине показываем счетчик
                  <div className={`
                  ${styles.counterWrapper} ${isUpdating ? 'updating' : ''}`} 
                  onClick={(e) => e.stopPropagation()}>
                     <button disabled={isUpdating} className={`${styles.countBtn}`} onClick={handleDecrease}>-</button>
                     <span>{isUpdating ? <Loader className='spinner'/> : cartItem.quantity}</span>
                     <button disabled={isUpdating} className={`${styles.countBtn}`} onClick={handleIncrease}>+</button>
                  </div>
               ) : (
                  <button disabled={isUpdating} onClick={handleQuickAdd} className={`${styles.button}`}>
                     { isUpdating ? <Loader className='spinner'/> : 'В корзину' }
                  </button>
               )
            }
         </div>
      </div>
   );
}

export default ProductCard;
