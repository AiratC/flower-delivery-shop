import React, { useState } from 'react';
import styles from './Auth.module.css';
import authImg from './../../assets/images/authImage.webp'

const Auth = () => {
   const [isLogin, setIsLogin] = useState(true);
   const [formData, setFormData] = useState({
      email: '',
      password: '',
      confirmPassword: ''
   });

   const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      console.log('Данные формы:', formData);
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
                              name="confirmPassword"
                              placeholder="••••••••"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              required
                           />
                        </div>
                     )}

                     <button type="submit" className={styles.submitBtn}>
                        {isLogin ? 'Войти' : 'Создать аккаунт'}
                     </button>
                  </form>
               </div>
            </div>
         </div>

      </div>
   );
};

export default Auth;