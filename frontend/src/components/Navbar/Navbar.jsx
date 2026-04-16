import React, { useEffect, useState } from 'react';
import { MapPin, Phone, ShoppingBag, Menu, X, ChevronDown, User, Heart, ShoppingCart, CircleUserRound } from 'lucide-react';
import mainLogo from '../../assets/images/main-logo.webp'; // Путь к вашему логотипу
import styles from './Navbar.module.css'
import MobileMenu from '../MobileMenu/MobileMenu';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Navbar = () => {
   const [isMenuOpen, setIsMenuOpen] = useState(false);
   const { user } = useSelector((state) => state.auth);

   useEffect(() => {
      if (isMenuOpen) {
         document.body.style.overflow = 'hidden';
      } else {
         document.body.style.overflow = 'auto'; // 'auto' лучше чем 'scroll', чтобы не было пустой полосы
      }

      // На всякий случай возвращаем скролл при размонтировании компонента
      return () => {
         document.body.style.overflow = 'auto';
      };
   }, [isMenuOpen])

   const toggleMobileMenu = () => {
      setIsMenuOpen(prev => !prev)
   }

   return (
      <>
         <nav className={styles.navWrapper}>
            {/* Top Bar */}
            <div style={{ backgroundColor: '#5d4e59' }}>
               <div className={`${styles.topBar} container`}>
                  <div className={styles.topContainer}>
                     <div className={styles.location}>
                        <MapPin size={16} color="#82b366" />
                        <span>г. Владивосток, ул. Пушкинская, 17 А</span>
                     </div>

                     <div className={styles.contacts}>
                        <a href="tel:+78083535335" className={styles.link}>
                           <Phone size={16} color="#82b366" />
                           + 7 808 353 53 35
                        </a>
                        <span className="hidden md:inline">+ 7 888 888 88 88</span>
                     </div>

                     <div className={styles.cartInfo}>
                        <ShoppingBag size={18} />
                        <span>150 000 руб.</span>
                     </div>
                  </div>
               </div>
            </div>


            {/* Main Navigation */}
            <div className={`${styles.mainNavbar} container`}>
               <div className={styles.mainContainer}>
                  {/* Кнопка меню (только мобилки) */}
                  <button
                     className={styles.mobileMenuBtn}
                     onClick={toggleMobileMenu}
                  >
                     {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                  </button>

                  <nav className={styles.nav}>
                     <Link to="/faq" className={`navLink`}>FAQ</Link>
                     <Link to="/reviews" className={`navLink`}>Отзывы</Link>
                     <Link to="/contacts" className={`navLink`}>Контакты</Link>
                  </nav>

                  <Link to={`/`} className={styles.logo}>
                     <img src={mainLogo} alt="Цветочная Лавка" className={styles.logoImg} />
                  </Link>

                  <nav className={styles.nav}>
                     <div className={`${styles.informForClient}`}>
                        Информация для клиента <ChevronDown size={20} />
                     </div>

                     <div>
                        {
                           user ? (
                              <div>
                                 {
                                    user.avatar ? (
                                       <Link to={`/profile`}>
                                          <img 
                                          src={`${import.meta.env.VITE_BACKEND_URL}${user.avatar}`} 
                                          className={styles.userAvatar}
                                          alt='avatar' 
                                          />
                                       </Link>
                                    ) : (
                                       <Link to={`/profile`}>
                                          <CircleUserRound size={18} className={`navLink`} />
                                       </Link>
                                    )
                                 }
                              </div>
                           ) : (
                              <Link to="/auth" className={`navLink`}>
                                 <User size={18} />
                              </Link>
                           )
                        }
                     </div>


                     <div>
                        <Link to={`/favorites`} className={`navLink`}>
                           <Heart size={18} />
                        </Link>
                     </div>

                     <div>
                        <Link to={`/checkout`} className={`navLink`}>
                           <ShoppingCart size={18} />
                        </Link>
                     </div>

                     <div className={styles.currencySwitch}>
                        <span className={styles.currencyActive}>РУБ.</span>
                        <span>ДОЛ.</span>
                     </div>
                  </nav>

                  {/* Вариант валюты для мобилок (как на макете 2) */}
                  <div className={`${styles.currencySwitchMobile} md:hidden`}>
                     <div className={styles.currencyActive}>РУБ.</div>
                     <div>ДОЛ.</div>
                  </div>
               </div>
            </div>
         </nav>

         {/* Мобильное меню */}
         <MobileMenu
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
         />
      </>

   );
}

export default Navbar
