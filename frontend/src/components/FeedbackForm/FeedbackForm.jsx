import React, { useEffect, useState } from 'react';
import styles from './FeedbackForm.module.css';
import fetchAxios from '../../api/axios';
import { toast } from 'react-toastify';
import { Loader } from 'lucide-react';


const FeedbackForm = () => {
   const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      question: ''
   });
   const [isSubmit, setIsSubmit] = useState(false);

   useEffect(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
   }, []);

   const handleSubmit = async (e) => {
      e.preventDefault();
      try {
         setIsSubmit(true);
         const response = await fetchAxios.post('/messages/send-message', formData);
         if (response.data.success) {
            toast.success(response.data.message);
            setFormData({
               name: '',
               email: '',
               phone: '',
               question: ''
            })
         }
      } catch (error) {
         console.log(error);
         toast.error(error?.response?.data?.message || 'Ошибка при отправки');
      } finally {
         setIsSubmit(false)
      }
   }

   return (
      <div className={styles.formSection}>
         <h3>Остались вопросы? Свяжитесь с нами.</h3>
         <form className={styles.feedbackForm} onSubmit={handleSubmit}>
            <div className={styles.inputsColumn}>
               <input
                  type="text"
                  placeholder='Имя фамилия'
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required />
               <input
                  type="email"
                  placeholder='Эл. почта'
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required />
               <input
                  type="tel"
                  placeholder='Моб. номер'
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required />
            </div>
            <div className={styles.textColumn}>
               <textarea
               placeholder='Возникший вопрос'
               value={formData.question}
               onChange={(e) => setFormData({ ...formData, question: e.target.value })}
               >
               </textarea>
               <button disabled={isSubmit} type='submit' className={styles.sendBtn}>
                  { isSubmit ? <Loader className='spinner'/> : 'Отправить' }
               </button>
            </div>
         </form>
      </div>
   )
}

export default FeedbackForm
