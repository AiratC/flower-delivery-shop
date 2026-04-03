import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './FlowerCard.module.css';
import { useParams } from 'react-router-dom';
import fetchAxios from '../../api/axios';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeItem, updateQty } from '../../redux/slices/cartSlice';
import { Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import AddonSection from '../../components/AddonSection/AddonSection';

const FlowerCard = () => {
   const { flowerId } = useParams();
   const [flower, setFlower] = useState(null);
   const [selectedVariant, setSelectedVariant] = useState(null);
   const [indexImg, setIndexImg] = useState(0);
   // Локальный индикатор
   const [isUpdating, setIsUpdating] = useState(false);

   const [addons, setAddons] = useState([]);

   const cartItems = useSelector(state => state.cart.items);
   const dispatch = useDispatch();

   // Флаг загрузки
   const isLoadingFlowerCard = !flower;

   // Ищем товар в корзине при условии выбранного размера
   const cartItem = useMemo(() => {
      return cartItems.find(item =>
         item.item_id === Number(flowerId) &&
         item.selected_size === selectedVariant?.size_name
      )
   }, [cartItems, flowerId, selectedVariant]);

   // Общая функция для обработки экшенов с лоадером
   const handleCartAction = useCallback(async (action) => {
      if (isUpdating) return;

      setIsUpdating(true);
      try {
         const response = await dispatch(action).unwrap();
         if (response.success) {
            toast.success(response.message);
         }
      } catch (error) {
         console.log(error);
         toast.error(error.response.message)
      } finally {
         setIsUpdating(false);
      }
   }, [isUpdating, dispatch])

   // Если товар уже в корзине, функции управления кол-вом
   const handleInCartQty = (newQty) => {
      if (isUpdating) return;

      if (newQty < 1) {
         handleCartAction(removeItem(cartItem.cart_item_id));
      } else {
         handleCartAction(updateQty({ cartItemId: cartItem.cart_item_id, quantity: newQty }))
      }
   }

   const onAddMain = useCallback(async () => {
      if (!flower || !selectedVariant) return;

      handleCartAction(addToCart({
         itemId: flower.flower_id,
         itemType: 'flower',
         selectedSize: selectedVariant.size_name,
         quantity: 1
      }))
   }, [flower, handleCartAction, selectedVariant]);

   const getOneFlower = async (flowerId) => {
      try {
         const response = await fetchAxios.get(`/flowers/get-one-flower/${Number(flowerId)}`);
         setFlower(response.data)
         const defaultVar = response.data.variants.find(v => v.is_default) || response.data.variants[0];
         setSelectedVariant(defaultVar);
      } catch (error) {
         console.log(error)
      }
   }

   const getAddons = async () => {
      try {
         const response = await fetchAxios.get('/addons/get-all-addons');
         setAddons(response.data);
      } catch (error) {
         console.log('Ошибка загрузки аддонов', error)
      }
   }

   // Загрузка данных (в реальности через useEffect или RTK Query)
   useEffect(() => {
      getOneFlower(flowerId);
      getAddons();
   }, [flowerId]);

   useEffect(() => {
      window.scrollTo({ behavior: 'smooth', top: 0 })
   }, []);

   return (
      <>
         <div className={styles.flowerCardPage}>
            <div className={`container ${styles.containerFlowerCard}`}>

               {/* Левая часть: Изображения */}
               <div className={styles.imageSection}>
                  {
                     isLoadingFlowerCard ? (
                        <div className={`${styles.imageSkeleton} ${styles.skeleton}`} />
                     ) : (
                        <>
                           {flower?.is_new && <span className={styles.badgeNew}>Новинка</span>}
                           <img src={import.meta.env.VITE_BACKEND_URL + flower?.images[indexImg]} alt={flower?.title} className={styles.mainImage} />
                           <div className={styles.thumbnails}>
                              {flower?.images.map((img, idx) => (
                                 <img onClick={() => setIndexImg(idx)} key={idx} src={import.meta.env.VITE_BACKEND_URL + img} alt="thumb" />
                              ))}
                           </div>
                        </>
                     )
                  }
               </div>

               {/* Правая часть: Инфо */}
               <div className={styles.infoSection}>
                  {
                     isLoadingFlowerCard ? (
                        <>
                           <div className={`${styles.titleSkeleton} ${styles.skeleton}`} />
                           <div className={styles.sizeSelector}>
                              <div className={`${styles.textSkeleton} ${styles.skeleton}`} style={{ width: '100px' }} />
                              <div className={styles.variantsGrid}>
                                 <div className={`${styles.variantSkeleton} ${styles.skeleton}`} />
                                 <div className={`${styles.variantSkeleton} ${styles.skeleton}`} />
                                 <div className={`${styles.variantSkeleton} ${styles.skeleton}`} />
                              </div>
                           </div>
                           <div className={`${styles.textSkeleton} ${styles.skeleton}`} />
                           <div className={`${styles.textSkeleton} ${styles.skeleton}`} />
                           <div className={`${styles.textSkeleton} ${styles.skeleton}`} />
                        </>
                     ) : (
                        <>
                           <h1 className={styles.title}>{flower?.title}</h1>
                           <div className={styles.sizeSelector}>
                              <p>Размер:</p>
                              <div className={styles.variantsGrid}>
                                 {flower?.variants.map((v) => (
                                    <button
                                       key={v.variant_id}
                                       className={`${styles.variantBtn} ${selectedVariant?.variant_id === v.variant_id ? styles.active : ''}`}
                                       onClick={() => setSelectedVariant(v)}
                                    >
                                       <span className={styles.sizeName}>{v.size_name}</span>
                                       <span className={styles.sizePrice}>{v.price_new} руб.</span>
                                    </button>
                                 ))}
                              </div>
                           </div>

                           <div className={styles.tabs}>
                              <button className={styles.activeTab}>Состав</button>
                              <button>Доставка и оплата</button>
                           </div>

                           <ul className={styles.compositionList}>
                              {flower?.composition.map((item, i) => (
                                 <li key={i}>{item}</li>
                              ))}
                           </ul>
                        </>
                     )
                  }


                  <div className={styles.footerAction}>
                     {
                        isLoadingFlowerCard ? (
                           <>
                              <div className={`${styles.textSkeleton} ${styles.skeleton}`} style={{ width: '120px', marginBottom: 0 }} />
                              <div className={`${styles.buttonSkeleton} ${styles.skeleton}`} />
                           </>
                        ) : (
                           <>
                              {
                                 cartItem ? (
                                    // Вариант 1: Товар уже в корзине
                                    <div className={`
                                 ${styles.inCartControls}
                                 ${isUpdating ? 'updating' : ''}
                           `}>
                                       <div className={styles.counter}>
                                          <button disabled={isUpdating} onClick={() => handleInCartQty(cartItem.quantity - 1)}>-</button>
                                          <span>{isUpdating ? <Loader className='spinner' /> : cartItem.quantity}</span>
                                          <button disabled={isUpdating} onClick={() => handleInCartQty(cartItem.quantity + 1)}>+</button>
                                       </div>
                                       <div className={styles.inCartPrice}>
                                          В корзине: <span>{(cartItem.price * cartItem.quantity).toLocaleString()} руб.</span>
                                       </div>
                                       <div className={styles.inCartText}>
                                          Товар добавлен
                                       </div>
                                    </div>
                                 ) : (
                                    // Вариант 2: Товара нет в корзине 
                                    <>
                                       <div className={styles.totalPrice}>
                                          Цена: <span>{selectedVariant?.price_new.toLocaleString()} руб.</span>
                                       </div>
                                       <button
                                          onClick={onAddMain}
                                          className={styles.addToCart}
                                          disabled={isUpdating}
                                       >
                                          {isUpdating ? <Loader className='spinner' /> : 'В корзину'}
                                       </button>
                                    </>
                                 )
                              }
                           </>
                        )
                     }

                  </div>
               </div>
            </div >
         </div >

         {/* Секция дополнить заказ */}
         <AddonSection addons={addons}/>
      </>
   );
}

export default FlowerCard
