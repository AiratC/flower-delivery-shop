import React, { useEffect, useState } from 'react';
import styles from './Auth.module.css';
import authImg from './../../assets/images/authImage.webp'
import { useDispatch, useSelector } from 'react-redux';
import { fetchAuth } from '../../redux/slices/authSlice';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { fetchCart } from '../../redux/slices/cartSlice';

const Auth = () => {
   const [isLogin, setIsLogin] = useState(true);
   const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      repeatPassword: '',
      agree: false
   });
   const { loading, user } = useSelector(state => state.auth);
   const dispatch = useDispatch();
   const navigate = useNavigate();

   useEffect(() => {
      if(user) return navigate('/profile');
   }, [user, navigate]);

   const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      // Для чекбокса берем checked, для остального value
      setFormData({
         ...formData,
         [name]: type === 'checkbox' ? checked : value
      });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      if (!isLogin && !formData.agree) {
         toast.warning("Необходимо согласие на обработку данных");
         return;
      }

      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin
         ? { userEmail: formData.email, password: formData.password }
         : {
            name: formData.name,
            userEmail: formData.email,
            password: formData.password,
            repeatPassword: formData.repeatPassword,
            agree: formData.agree
         };

      try {
         const response = await dispatch(fetchAuth({ formData: payload, endpoint })).unwrap();

         // СРАЗУ ПОСЛЕ ВХОДА обновляем корзину, чтобы увидеть объединенные товары
         dispatch(fetchCart());
         
         toast.success(response.message);
         navigate('/profile');
      } catch (error) {
         toast.error(error);
      }

   };

   return (
      <div className={`${styles.authWrapper}`}>
         <div className={``}>
            <div className={`${styles.authContainer}`}>
               {/* Левая часть: Картинка */}
               <div className={styles.imageSide}>
                  <img
                     src={authImg}
                     alt="Tulips"
                  />
               </div>

               {/* Правая часть: Форма */}
               <div className={styles.formSide}>
                  <div className={styles.tabs}>
                     <button
                        className={isLogin ? styles.activeTab : styles.tab}
                        onClick={() => setIsLogin(true)}
                     >
                        Войти
                     </button>
                     <button
                        className={!isLogin ? styles.activeTab : styles.tab}
                        onClick={() => setIsLogin(false)}
                     >
                        Зарегистрироваться
                     </button>
                  </div>

                  <form className={styles.form} onSubmit={handleSubmit}>
                     {!isLogin && (
                        <div className={styles.inputField}>
                           <label>Имя:</label>
                           <input
                              type="text"
                              name="name"
                              placeholder="Введите имя"
                              value={formData.name}
                              onChange={handleChange}
                              required
                           />
                        </div>
                     )}

                     <div className={styles.inputField}>
                        <label>Email:</label>
                        <input
                           type="email"
                           name="email"
                           placeholder="example@gmail.com"
                           value={formData.email}
                           onChange={handleChange}
                           required
                        />
                     </div>

                     <div className={styles.inputField}>
                        <label>Пароль:</label>
                        <input
                           type="password"
                           name="password"
                           placeholder="••••••••"
                           value={formData.password}
                           onChange={handleChange}
                           required
                        />
                     </div>

                     {!isLogin && (
                        <div className={styles.inputField}>
                           <label>Повторите пароль:</label>
                           <input
                              type="password"
                              name="repeatPassword"
                              placeholder="••••••••"
                              value={formData.repeatPassword}
                              onChange={handleChange}
                              required
                           />
                        </div>
                     )}

                     {!isLogin && (
                        <div className={styles.agreeWrapper}>
                           <label className={styles.checkboxLabel}>
                              <input
                                 type="checkbox"
                                 name="agree"
                                 checked={formData.agree}
                                 onChange={handleChange}
                                 className={styles.checkbox}
                                 required
                              />
                              <span className={styles.agreeText}>
                                 Согласие на обработку персональных данных
                              </span>
                           </label>
                        </div>
                     )}

                     <button type="submit" disabled={loading} className={styles.submitBtn}>
                        {loading ? (
                           <Loader2 className={`spinner`} size={20} />
                        ) : (
                           isLogin ? 'Войти' : 'Создать аккаунт'
                        )}
                     </button>
                  </form>
               </div>
            </div>
         </div>

      </div>
   );
};

export default Auth;