import React, { useState, useEffect, useCallback } from 'react';
import styles from './FlowerCard.module.css';
import { useParams } from 'react-router-dom';
import fetchAxios from '../../api/axios';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/slices/cartSlice';

const FlowerCard = () => {
   const { flowerId } = useParams();
   const [flower, setFlower] = useState(null);
   const [selectedVariant, setSelectedVariant] = useState(null);
   const [quantity, setQuantity] = useState(1);
   const [indexImg, setIndexImg] = useState(0);

   const dispatch = useDispatch();

   const onAddMain = useCallback(async () => {
      dispatch(addToCart({
         itemId: flower.flower_id,
         itemType: 'flower',
         selectedSize: selectedVariant,
         quantity: quantity
      }))
   }, [dispatch, flower.flower_id, quantity, selectedVariant]);

   // Функция для добавления доп товара которую потом перемещю в копонент AddonCard
   // const addToAddon = useCallback(async () => {
   //    itemId: addonRouter.addon_id,
   //    itemType: 'addon',
   //    selectedSize: null,
   //    quantity: 1
   // });

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

   // Загрузка данных (в реальности через useEffect или RTK Query)
   useEffect(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      getOneFlower(flowerId)
   }, [flowerId]);

   useEffect(() => {
      window.scrollTo({ behavior: 'smooth', top: 0 })
   }, []);


   return (
      <div className={styles.productPage}>
         <div className={`container ${styles.containerFlowerCard}`}>
            {/* Левая часть: Изображения */}
            <div className={styles.imageSection}>
               {flower?.is_new && <span className={styles.badgeNew}>Новинка</span>}
               <img src={import.meta.env.VITE_BACKEND_URL + flower?.images[indexImg]} alt={flower?.title} className={styles.mainImage} />
               <div className={styles.thumbnails}>
                  {flower?.images.map((img, idx) => (
                     <img onClick={() => setIndexImg(idx)} key={idx} src={import.meta.env.VITE_BACKEND_URL + img} alt="thumb" />
                  ))}
               </div>
            </div>

            {/* Правая часть: Инфо */}
            <div className={styles.infoSection}>
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

               <div className={styles.footerAction}>
                  <div className={styles.counter}>
                     <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                     <span>{quantity}</span>
                     <button onClick={() => setQuantity(q => q + 1)}>+</button>
                  </div>
                  <div className={styles.totalPrice}>
                     Сумма: <span>{(selectedVariant?.price_new * quantity).toLocaleString()} руб.</span>
                  </div>
                  <button
                     onClick={onAddMain}
                     className={styles.addToCart}
                  >
                     В корзину
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
}

export default FlowerCard
