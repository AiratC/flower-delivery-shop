import React from 'react';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './EmptyCart.module.css';

const EmptyCart = () => {
   
   return (
      <div className={styles.container}>
         <div className={styles.content}>
            <div className={styles.iconCircle}>
               <ShoppingBag size={48} strokeWidth={1.5} />
               <div className={styles.smallCircle}></div>
            </div>

            <h2 className={styles.title}>Ваша корзина пуста</h2>
            <p className={styles.description}>
               Похоже, вы еще ничего не добавили в корзину. <br />
               У нас много интересного, загляните в каталог!
            </p>

            <Link to="/" className={styles.backBtn}>
               <ArrowLeft size={18} />
               <span>Перейти к покупкам</span>
            </Link>
         </div>
      </div>
   );
};

export default EmptyCart;