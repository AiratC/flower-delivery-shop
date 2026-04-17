import React from 'react';
import styles from './MobileMenu.module.css';
import { ChevronDown, CircleUserRound, Heart, ShoppingCart, User } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';


const MobileMenu = ({ isOpen, onClose }) => {
   const { user } = useSelector((state) => state.auth);

   if (!isOpen) return null;

   return (
      <div className={styles.overlay} onClick={onClose}>
         <div className={styles.menuDrawer} onClick={e => e.stopPropagation()}>

            {/* Список навигации */}
            <nav className={styles.navList}>
               <div>
                  <Link onClick={onClose} to="/faq" className={styles.navItem}>FAQ</Link>
                  <Link onClick={onClose} to="/reviews" className={styles.navItem}>Отзывы</Link>
                  <Link onClick={onClose} to={`/stocks`} className={styles.navItem}>Скидки</Link>
                  <Link onClick={onClose} to="/contacts" className={styles.navItem}>Контакты</Link>
                  <div className={styles.navItem}>
                     Информация для клиента
                     <ChevronDown size={18} />
                  </div>
               </div>


               {/* Футер меню */}
               <div className={styles.footer}>
                  <div>
                     {
                        user ? (
                           <div>
                              {
                                 user.avatar ? (
                                    <Link onClick={onClose} to={`/profile`}>
                                       <img
                                          src={`${import.meta.env.VITE_BACKEND_URL}${user.avatar}`}
                                          className={styles.userAvatar}
                                          alt='avatar'
                                       />
                                    </Link>
                                 ) : (
                                    <Link onClick={onClose} to={`/profile`}>
                                       <CircleUserRound size={25} className={`navLink`} />
                                    </Link>
                                 )
                              }
                           </div>
                        ) : (
                           <Link onClick={onClose} to="/auth" className={`navLink`}>
                              <User size={25} />
                           </Link>
                        )
                     }
                  </div>


                  <div>
                     <Link onClick={onClose} to={`/favorites`} className={`navLink`}>
                        <Heart size={25} />
                     </Link>
                  </div>

                  <div>
                     <Link onClick={onClose} to={`/checkout`} className={`navLink`}>
                        <ShoppingCart size={25} />
                     </Link>
                  </div>
               </div>
            </nav>


         </div>
      </div>
   );
}

export default MobileMenu
