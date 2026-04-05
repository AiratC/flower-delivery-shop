import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resetCheckoutState } from '../../redux/slices/checkoutSlice';
import styles from './OrderSuccessPage.module.css';

const OrderSuccessPage = () => {
   const { orderId } = useParams();
   const dispatch = useDispatch();

   // Берем данные об авторизации из стора (название слайса может быть auth или user)
   const { user } = useSelector(state => state.auth);

   useEffect(() => {
      // Сбрасываем состояние оформления при уходе со страницы
      return () => {
         dispatch(resetCheckoutState());
      };
   }, [dispatch]);

   useEffect(() => {
      window.scrollTo({ behavior: 'smooth', top: 0 })
   }, []);

   return (
      <div className={`container ${styles.successContainer}`}>
         <div className={styles.card}>
            <div className={styles.iconWrapper}>
               <svg viewBox="0 0 24 24" className={styles.successIcon} fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
               </svg>
            </div>

            <h1 className={styles.title}>Заказ успешно оформлен!</h1>
            <p className={styles.orderNumber}>Номер вашего заказа: <strong>#{orderId}</strong></p>

            <div className={styles.infoContent}>
               {user ? (
                  // ВАРИАНТ 1: ПОЛЬЗОВАТЕЛЬ АВТОРИЗОВАН
                  <>
                     <p className={styles.description}>
                        Благодарим за заказ! Мы уже начали его подготовку.
                        Все детали и история изменений доступны в вашем профиле.
                     </p>
                     <div className={styles.actions}>
                        <Link to="/profile" className={styles.primaryBtn}>В личный кабинет</Link>
                        <Link to="/" className={styles.secondaryBtn}>На главную</Link>
                     </div>
                  </>
               ) : (
                  // ВАРИАНТ 2: ГОСТЬ
                  <>
                     <p className={styles.description}>
                        Ваш заказ принят! Чтобы иметь возможность <strong>отслеживать статус</strong> и
                        копить бонусы, рекомендуем зарегистрироваться.
                     </p>
                     <div className={styles.guestNotice}>
                        Зарегистрируйтесь, используя email, указанный в заказе, чтобы он привязался к вашему аккаунту.
                     </div>
                     <div className={styles.actions}>
                        <Link to="/auth" className={styles.primaryBtn}>Зарегистрироваться</Link>
                        <Link to="/auth" className={styles.secondaryBtn}>Войти в аккаунт</Link>
                     </div>
                     <div className={styles.backLink}>
                        <Link to="/">Вернуться в магазин без регистрации</Link>
                     </div>
                  </>
               )}
            </div>
         </div>
      </div>
   );
};

export default OrderSuccessPage;