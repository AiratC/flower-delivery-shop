import React, { useCallback, useState } from 'react'
import styles from './ChangePasswordSection.module.css'
import { Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import fetchAxios from '../../api/axios';

const info = `Пароль должен быть от 12 символов и содержать минимум 4 спецсимвола ~!@#$%^&*()/`

const ChangePasswordSection = () => {
   const [passwordData, setPasswordData] = useState({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
   });
   const [isSaving, setIsSaving] = useState(false);

   const specialChars = /[~!@#$%^&*()/]/g;
   const countSymbol = (passwordData?.newPassword?.match(specialChars) || []).length;

   // Проверка условия пароля
   const isPasswordDirty = passwordData.newPassword.length > 0;
   const isPasswordWeak = passwordData.newPassword.length < 12 || countSymbol < 4;
   const passwordConditionCheck = isPasswordDirty && isPasswordWeak;

   const handlePasswordChange = useCallback(async (e) => {
      e.preventDefault();

      if (passwordConditionCheck) {
         return toast.warning('Пароль не надёжный')
      };

      if (passwordData.newPassword !== passwordData.confirmPassword) {
         return toast.error(`Пароли не совпадают`);
      };

      try {
         setIsSaving(true);
         const response = await fetchAxios.put(`/users/change-password`, {
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
         });

         if (response.data.success) {
            toast.success(response.data.message || 'Пароль изменён');
            setPasswordData({
               currentPassword: '',
               newPassword: '',
               confirmPassword: '',
            })
         }
      } catch (error) {
         toast.error(error?.response?.data?.message || 'Ошибка при смене пароля')
      } finally {
         setIsSaving(false);
      }
   }, [passwordData, passwordConditionCheck]);

   return (
      <>
         <h3>Смена пароля</h3>
         <form onSubmit={handlePasswordChange} className={styles.formGrid} style={{ gridTemplateColumns: '1fr', maxWidth: '400px' }}>
            <div className={styles.inputGroup}>
               <label>Текущий пароль</label>
               <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Введите текущий пароль"
                  required
               />
            </div>
            <div className={styles.inputGroup}>
               <label>Новый пароль</label>
               {
                  passwordConditionCheck && (
                     <span style={{ color: 'red', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>
                        {info}
                     </span>
                  )
               }
               <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Минимум 12 символов и 4 спецсимвола"
                  required
               />
            </div>
            <div className={styles.inputGroup}>
               <label>Повторите <span style={{ color: '#63a355' }}>новый</span> пароль</label>
               <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Повторите новый пароль"
                  required
               />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
               <button
                  type="button"
                  className={styles.cancelBtn}
                  disabled={isSaving}
                  onClick={() => setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })}
               >
                  Отмена
               </button>
               <button
                  type="submit"
                  className={styles.saveBtn}
                  disabled={isSaving}
               >
                  {isSaving ? <Loader size={20} className='spinner' /> : 'Сохранить'}
               </button>
            </div>
         </form>
      </>
   )
}

export default ChangePasswordSection
