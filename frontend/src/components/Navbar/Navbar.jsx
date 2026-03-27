import React, { useState } from 'react';
import { MapPin, Phone, ShoppingBag, Menu, X, ChevronDown, User, Heart, ShoppingCart } from 'lucide-react';
import mainLogo from '../../assets/images/main-logo.webp'; // Путь к вашему логотипу
import styles from './Navbar.module.css'
import MobileMenu from '../MobileMenu/MobileMenu';
import { Link } from 'react-router-dom';

const Navbar = () => {
   const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                     onClick={() => setIsMenuOpen(!isMenuOpen)}
                  >
                     {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                  </button>

                  <nav className={styles.nav}>
                     <Link to="/catalog" className={`navLink`}>Каталог</Link>
                     <Link to="/reviews" className={`navLink`}>Отзывы</Link>
                     <Link to="/contacts" className={`navLink`}>Контакты</Link>
                  </nav>

                  <div className={styles.logo}>
                     <img src={mainLogo} alt="Цветочная Лавка" className={styles.logoImg} />
                  </div>

                  <nav className={styles.nav}>
                     <div className={`${styles.informForClient}`}>
                        Информация для клиента <ChevronDown size={20} />
                     </div>

                     <div>
                        <Link to="/profile" className={`navLink`}>
                           <User size={18} />
                        </Link>
                     </div>


                     <div>
                        <Link to={`/favorites`} className={`navLink`}>
                           <Heart size={18} />
                        </Link>
                     </div>

                     <div>
                        <Link to={`/cart`} className={`navLink`}>
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
