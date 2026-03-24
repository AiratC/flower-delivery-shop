import React from 'react';
import styles from './MobileMenu.module.css';
import { ChevronDown, User } from 'lucide-react';


const MobileMenu = ({ isOpen, onClose }) => {
   if (!isOpen) return null;

   return (
      <div className={styles.overlay} onClick={onClose}>
         <div className={styles.menuDrawer} onClick={e => e.stopPropagation()}>

            {/* Список навигации */}
            <nav className={styles.navList}>
               <div>
                  <a href="/catalog" className={styles.navItem}>Каталог</a>
                  <a href="/reviews" className={styles.navItem}>Отзывы</a>
                  <a href="/contacts" className={styles.navItem}>Контакты</a>
                  <div className={styles.navItem}>
                     Информация для клиента
                     <ChevronDown size={18} />
                  </div>
               </div>


               {/* Футер меню */}
               <a href="/orders" className={styles.footer}>
                  <User size={20} />
                  Мои заказы
               </a>
            </nav>


         </div>
      </div>
   );
}

export default MobileMenu
