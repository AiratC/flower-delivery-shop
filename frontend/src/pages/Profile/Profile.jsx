import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SquarePen, ShoppingBag, Lock, Loader } from 'lucide-react';
import styles from './Profile.module.css';
import { useNavigate } from 'react-router-dom';
import { fetchUserLogout } from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';
import { clearCart } from '../../redux/slices/cartSlice';
import { resetCheckoutState } from '../../redux/slices/checkoutSlice';

const Profile = () => {
   // 1. Получаем данные пользователя из Redux
   // Предположим, в объекте user есть поле totalOrdersSum
   const { user, loading } = useSelector((state) => state.auth);
   console.log(user)
   const dispatch = useDispatch();
   const navigate = useNavigate();

   // 2. Состояние для переключения вкладок
   const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'orders', 'password'

   // Состояние для редактирования профиля
   const [isEditing, setIsEditing] = useState(false);

   // Инициализируем пустыми строками, чтобы избежать undefined в инпутах
   const [formData, setFormData] = useState({
      fullName: '',
      phone: '',
      city: '',
      address: '',
   });

   // 3. Динамический расчет скидки
   const totalSum = user?.total_spent || 0;

   const discountData = useMemo(() => {
      if (totalSum >= 90000) return { percent: 7, next: null };
      if (totalSum >= 50000) return { percent: 5, next: 90000 };
      if (totalSum >= 10000) return { percent: 3, next: 50000 };
      return { percent: 0, next: 10000 };
   }, [totalSum]);

   const calculateProgress = () => {
      if (totalSum >= 90000) return 100;
      if (totalSum >= 50000) return 66 + ((totalSum - 50000) / 40000) * 34;
      if (totalSum >= 10000) return 33 + ((totalSum - 10000) / 40000) * 33;
      return (totalSum / 10000) * 33;
   };

   // 4. Маппинг названий для хлебных крошек
   const tabNames = {
      profile: 'Профиль',
      orders: 'Мои заказы',
      password: 'Смена пароля'
   };

   // СИНХРОНИЗАЦИЯ: Обновляем форму, когда данные пользователя загружены
   useEffect(() => {
      if (user) {
         // eslint-disable-next-line react-hooks/set-state-in-effect
         setFormData({
            fullName: user.name || '',
            phone: user.phone || '',
            city: user.city || '',
            address: user.delivery_address || '',
         });
      }
   }, [user]);

   const handleLogout = async () => {
      try {
         const response = await dispatch(fetchUserLogout()).unwrap();
         if (response.success) {
            toast.success(response.message);
            dispatch(clearCart());
            dispatch(resetCheckoutState());
            navigate('/');
         }
      } catch (error) {
         toast.error(error.message);
      }
   }

   // Если юзера еще нет в сторе И идет загрузка — показываем Loader вместо нулей
   if (!user && loading) {
      return (
         <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <Loader className='spinner' size={60} />
         </div>
      );
   }

   return (
      <div className={styles.profilePage}>
         <div className={`container ${styles.profileContainer}`}>

            {/* Динамические хлебные крошки */}
            <nav className={styles.breadcrumbs}>
               Главная &gt; Личный кабинет &gt; <span>{tabNames[activeTab]}</span>
            </nav>

            <div className={styles.layout}>
               {/* Левое меню (Sidebar) */}
               <aside className={styles.sidebar}>
                  <h2 className={styles.sidebarTitle}>ЛИЧНЫЙ КАБИНЕТ</h2>
                  <nav className={styles.sideNav}>
                     <button
                        className={`${styles.sideLink} ${activeTab === 'profile' ? styles.active : ''}`}
                        onClick={() => setActiveTab('profile')}
                     >
                        Профиль <SquarePen size={16} />
                     </button>
                     <button
                        className={`${styles.sideLink} ${activeTab === 'orders' ? styles.active : ''}`}
                        onClick={() => setActiveTab('orders')}
                     >
                        Мои заказы <ShoppingBag size={16} />
                     </button>
                     <button
                        className={`${styles.sideLink} ${activeTab === 'password' ? styles.active : ''}`}
                        onClick={() => setActiveTab('password')}
                     >
                        Смена пароля <Lock size={16} />
                     </button>
                  </nav>
               </aside>

               {/* Основной контент */}
               <main className={styles.content}>

                  {/* Условие: показываем блок скидки и информацию только на вкладке профиля */}
                  {activeTab === 'profile' && (
                     <>
                        <section className={styles.discountCard}>
                           <div className={styles.discountBadge}>
                              {discountData.percent > 0
                                 ? `Ваша скидка — ${discountData.percent}%`
                                 : 'Ваша накопительная скидка'}
                           </div>

                           <div className={styles.progressWrapper}>
                              <div className={styles.progressBar}>
                                 <div
                                    className={styles.progressFill}
                                    style={{ width: `${calculateProgress()}%` }}
                                 ></div>
                                 <div className={`${styles.dot} ${styles.dot1} ${totalSum >= 10000 ? styles.activeDot : ''}`}></div>
                                 <div className={`${styles.dot} ${styles.dot2} ${totalSum >= 50000 ? styles.activeDot : ''}`}></div>
                                 <div className={`${styles.dot} ${styles.dot3} ${totalSum >= 90000 ? styles.activeDot : ''}`}></div>
                              </div>

                              <div className={styles.progressLabels}>
                                 <div className={styles.labelGroup}>
                                    <span>СУММА ЗАКАЗОВ:</span>
                                 </div>
                                 <div className={styles.labelGroup}>
                                    <span className={styles.milestone}>ОТ 10 000 РУБ.</span>
                                    <span className={styles.percent}>3%</span>
                                 </div>
                                 <div className={styles.labelGroup}>
                                    <span className={styles.milestone}>ОТ 50 000 РУБ.</span>
                                    <span className={styles.percent}>5%</span>
                                 </div>
                                 <div className={styles.labelGroup}>
                                    <span className={styles.milestone}>ОТ 90 000 РУБ.</span>
                                    <span className={styles.percent}>7%</span>
                                 </div>
                              </div>
                           </div>

                           <div className={styles.totalSumText}>
                              Сумма заказов — <span>{totalSum.toLocaleString()} руб.</span>
                           </div>
                        </section>

                        <section className={styles.infoCard}>
                           <div className={styles.cardHeader}>
                              <h3>Информация обо мне</h3>
                              <button
                                 className={styles.editBtn}
                                 onClick={() => setIsEditing(!isEditing)}
                              >
                                 {isEditing ? 'Сохранить' : 'Редактировать'} <SquarePen size={16} />
                              </button>
                           </div>

                           <div className={styles.formGrid}>
                              <div className={styles.inputGroup}>
                                 <label>Имя и фамилия</label>
                                 <input
                                    type="text"
                                    value={formData.fullName}
                                    disabled={!isEditing}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                 />
                              </div>
                              <div className={styles.inputGroup}>
                                 <label>Моб. номер</label>
                                 <input
                                    type="text"
                                    value={formData.phone}
                                    disabled={!isEditing}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                 />
                              </div>
                              <div className={styles.inputGroup}>
                                 <label>Город</label>
                                 <input
                                    type="text"
                                    value={formData.city}
                                    disabled={!isEditing}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                 />
                              </div>
                              <div className={styles.inputGroup}>
                                 <label>Адрес</label>
                                 <input
                                    type="text"
                                    value={formData.address}
                                    disabled={!isEditing}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                 />
                              </div>
                           </div>
                        </section>
                        <button
                           className={`${styles.logoutBtn} ${loading && 'opacity-50'}`}
                           onClick={handleLogout}
                           disabled={loading}
                        >
                           { loading ? <Loader className={`spinner`} size={23}/> : 'Выйти' }
                        </button>
                     </>
                  )}

                  {/* Контент для других вкладок */}
                  {activeTab === 'orders' && (
                     <section className={styles.infoCard}>
                        <h3>Мои заказы</h3>
                        <p>Список ваших заказов пуст.</p>
                     </section>
                  )}

                  {activeTab === 'password' && (
                     <section className={styles.infoCard}>
                        <h3>Смена пароля</h3>
                        <div className={styles.formGrid} style={{ gridTemplateColumns: '1fr' }}>
                           <div className={styles.inputGroup}>
                              <label>Новый пароль</label>
                              <input type="password" placeholder="Введите новый пароль" />
                           </div>
                           <button className={styles.editBtn} style={{ width: 'fit-content' }}>Обновить пароль</button>
                        </div>
                     </section>
                  )}
               </main>
            </div>
         </div>
      </div>
   );
};

export default Profile;