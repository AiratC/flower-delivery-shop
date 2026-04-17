import React, { useState, useEffect, useCallback } from 'react';
import { Star, Loader2, Camera, X, MessageSquare } from 'lucide-react';
import styles from './ReviewsPage.module.css';
import fetchAxios from '../../api/axios';
import { toast } from 'react-toastify';

const ReviewsPage = () => {
   const [viewType, setViewType] = useState('text'); // 'text' или 'photo'
   const [reviews, setReviews] = useState([]);
   const [currentPage, setCurrentPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const [loading, setLoading] = useState(true);
   const [purchasedItems, setPurchasedItems] = useState([]);
   const [loadingItems, setLoadingItems] = useState(false);
   const [preview, setPreview] = useState(null);

   // Состояния для формы
   const [formData, setFormData] = useState({
      flower_id: null,
      order_item_id: null,
      name: '',
      email: '',
      city: '',
      comment: '',
      rating: 5,
      photo: null
   });
   const [isSubmitting, setIsSubmitting] = useState(false);

   // Модальное окно для фото
   const [selectedReview, setSelectedReview] = useState(null);

   const LIMIT = viewType === 'text' ? 6 : 8;

   // Загрузка данных для отзыва товаров
   const loadPurchasedItems = useCallback(async () => {
      setLoadingItems(true);
      try {
         const res = await fetchAxios.get('/reviews/get-purchased-items', {
            headers: {
               'x-guest-token': localStorage.getItem('guest_token')
            }
         });
         setPurchasedItems(res.data);
      } catch (error) {
         console.error('Ошибка загрузки товаров: ', error)
      } finally {
         setLoadingItems(false);
      }
   }, []);

   const loadReviews = useCallback(async () => {
      setLoading(true);
      try {
         const res = await fetchAxios.get(`/reviews/get-reviews?type=${viewType}&page=${currentPage}&limit=${LIMIT}`);
         setReviews(res.data.data);
         setTotalPages(res.data.totalPages);
      } catch (e) {
         console.error("Ошибка загрузки:", e);
      } finally {
         setLoading(false);
      }
   }, [viewType, currentPage, LIMIT]);

   useEffect(() => {
      loadReviews();
      loadPurchasedItems();
   }, [loadReviews, loadPurchasedItems]);

   const handleTypeChange = (type) => {
      setViewType(type);
      setCurrentPage(1);
      setReviews([]);
   };

   const handleRating = (val) => setFormData(prev => ({ ...prev, rating: val }));

   const handleItemSelect = (e) => {
      const selectedId = e.target.value;
      const item = purchasedItems.find(i => i.order_item_id === parseInt(selectedId));
      if (item) {
         setFormData(prev => ({
            ...prev,
            order_item_id: item.order_item_id,
            flower_id: item.flower_id
         }))
      }
   }

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (!formData.order_item_id) {
         return toast.warning('Пожалуйста, выберите товар из списка ваших покупок');
      };

      setIsSubmitting(true);
      try {
         // Используем FormData если отправляем фото (photo)
         const data = new FormData();
         Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
         });

         // Здесь должна быть логика получения flower_id и order_item_id (например из контекста заказа)
         await fetchAxios.post('/reviews/create-review', formData, {
            headers: {
               'x-guest-token': localStorage.getItem('guest_token'),
               'Content-Type': 'multipart/form-data'
            }
         });
         toast.success('Отзыв успешно отправлен!');
         setFormData({
            flower_id: null,
            order_item_id: null,
            name: '',
            email: '',
            city: '',
            comment: '',
            rating: 5,
            photo: null
         })
         loadReviews();
         loadPurchasedItems();
      } catch (err) {
         toast.error(err.response?.data?.message || 'Ошибка отправки');
      } finally {
         setIsSubmitting(false);
      }
   };

   const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
         setFormData({ ...formData, photo: file });
         setPreview(URL.createObjectURL(file));
      }
   };

   useEffect(() => {
      return () => {
         if (preview) URL.revokeObjectURL(preview);
      }
   }, [preview]);

   useEffect(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
   }, [])

   // Логика пагинации "Окно" (чтобы кнопки не росли)
   const renderPagination = () => {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(totalPages, start + maxVisible - 1);

      if (end - start + 1 < maxVisible) {
         start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
         pages.push(
            <button
               key={i}
               className={currentPage === i ? styles.activePage : styles.pageBtn}
               onClick={() => setCurrentPage(i)}
            >
               {i}
            </button>
         );
      }
      return pages;
   };

   return (
      <div className={`${styles.wrapper} container`}>
         <aside className={styles.sidebar}>
            <h1 className={styles.mainTitle}>ОТЗЫВЫ</h1>
            <div className={styles.menu}>
               <button
                  className={viewType === 'text' ? styles.menuActive : styles.menuBtn}
                  onClick={() => handleTypeChange('text')}
               >
                  Текстовые отзывы
               </button>
               <button
                  className={viewType === 'photo' ? styles.menuActive : styles.menuBtn}
                  onClick={() => handleTypeChange('photo')}
               >
                  Фотоотзывы
               </button>
            </div>
         </aside>

         <main className={styles.container}>
            <div className={styles.breadcrumbs}>Главная {'>'} Отзывы</div>

            <div className={styles.contentArea}>
               {loading ? (
                  <div className={styles.loader}><Loader2 className="spinner" size={50} /></div>
               ) : reviews.length > 0 ? (
                  <div className={viewType === 'text' ? styles.textGrid : styles.photoGrid}>
                     {reviews.map((rev) => (
                        viewType === 'text' ? (
                           <div key={rev.review_id} className={styles.textCard}>
                              <div className={styles.cardHeader}>
                                 <span className={styles.userName}>{rev.name}</span>
                                 <div className={styles.stars}>
                                    {[...Array(5)].map((_, i) => (
                                       <Star key={i} size={14} fill={i < rev.rating ? "#f1c40f" : "none"} color="#f1c40f" />
                                    ))}
                                 </div>
                              </div>
                              <div className={styles.meta}>{new Date(rev.created_at).toLocaleDateString()} г. {rev.city}</div>
                              <p className={styles.comment}>{rev.comment}</p>
                           </div>
                        ) : (
                           <div key={rev.review_id} className={styles.photoItem} onClick={() => setSelectedReview(rev)}>
                              <img src={import.meta.env.VITE_BACKEND_URL + rev.photo} alt="Отзыв" />
                           </div>
                        )
                     ))}
                  </div>
               ) : (
                  /* Блок, если отзывов нет */
                  <div className={styles.emptyState}>
                     <div className={styles.emptyIcon}>
                        <MessageSquare size={48} strokeWidth={1} />
                     </div>
                     <h3>Отзывов пока нет</h3>
                     <p>Станьте первым, кто поделится своим впечатлением о наших цветах!</p>
                  </div>
               )}

               {totalPages > 1 && (
                  <div className={styles.pagination}>
                     {renderPagination()}
                  </div>
               )}
            </div>

            {/* Форма */}
            <section className={styles.formSection}>
               <form onSubmit={handleSubmit} className={styles.reviewForm}>
                  <div className={styles.formGrid}>
                     {viewType === 'photo' && (
                        <div className={styles.uploadBox}>
                           <input
                              type="file"
                              id="photo"
                              hidden
                              accept='image/*'
                              onChange={handleFileChange}
                           />
                           <label htmlFor="photo" className={styles.uploadLabel}>
                              {preview ? (
                                 <div className={styles.previewContainer}>
                                    <img src={preview} alt="Preview" className={styles.imagePreview} />
                                    <div className={styles.changePhotoOverlay}>
                                       <Camera size={24} />
                                       <span>Изменить</span>
                                    </div>
                                 </div>
                              ) : (
                                 <>
                                    <Camera size={32} />
                                    <span>Загрузить изображение</span>
                                 </>
                              )}
                           </label>
                        </div>
                     )}
                     <div className={styles.inputsColumn}>
                        <div className={styles.selectWrapper}>
                           <select
                              className={styles.itemSelect}
                              required
                              onChange={handleItemSelect}
                              value={formData.order_item_id || ""}
                           >
                              <option value="" disabled>Выберите купленный товар</option>
                              {purchasedItems.map(item => (
                                 <option key={item.order_item_id} value={item.order_item_id}>
                                    {item.flower_name}
                                 </option>
                              ))}
                           </select>
                           {purchasedItems.length === 0 && !loadingItems && (
                              <span className={styles.noItemsHint}>У вас нет товаров, доступных для отзыва</span>
                           )}
                        </div>

                        <div className={styles.inputGroup}>
                           <input type="text" placeholder="Имя и фамилия" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                           <input type="email" placeholder="Эл. почта" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                           <input type="text" placeholder="Город" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                        </div>
                        <textarea placeholder="Ваш комментарий" value={formData.comment} onChange={e => setFormData({ ...formData, comment: e.target.value })} />

                        <div className={styles.formFooter}>
                           <div className={styles.ratingPicker}>
                              <span>Оцените нашу работу</span>
                              <div className={styles.starsSelect}>
                                 {[1, 2, 3, 4, 5].map(num => (
                                    <Star
                                       key={num}
                                       onClick={() => handleRating(num)}
                                       fill={num <= formData.rating ? "#76bc21" : "none"}
                                       color="#76bc21"
                                       className={styles.clickableStar}
                                    />
                                 ))}
                              </div>
                           </div>
                           <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                              {isSubmitting ? <Loader2 className={styles.spin} size={18} /> : 'Отправить'}
                           </button>
                        </div>
                     </div>
                  </div>
               </form>
            </section>
         </main>

         {/* Модалка для фотоотзыва */}
         {selectedReview && (
            <div className={styles.modalOverlay} onClick={() => setSelectedReview(null)}>
               <div className={styles.modal} onClick={e => e.stopPropagation()}>
                  <button className={styles.closeBtn} onClick={() => setSelectedReview(null)}>
                     <X size={24} />
                  </button>
                  <div className={styles.modalContent}>
                     <div className={styles.modalImageWrapper}>
                        <img
                           src={import.meta.env.VITE_BACKEND_URL + selectedReview.photo}
                           alt="Review full"
                        />
                     </div>
                     <div className={styles.modalInfo}>
                        <div className={styles.modalHeader}>
                           <h3>{selectedReview.name}</h3>
                           <span className={styles.modalDate}>
                              {new Date(selectedReview.created_at).toLocaleDateString()}
                           </span>
                        </div>
                        <div className={styles.modalStars}>
                           {[...Array(5)].map((_, i) => (
                              <Star
                                 key={i}
                                 size={16}
                                 fill={i < selectedReview.rating ? "#f1c40f" : "none"}
                                 color="#f1c40f"
                              />
                           ))}
                        </div>
                        <p className={styles.modalComment}>{selectedReview.comment}</p>
                        {selectedReview.city && <span className={styles.modalCity}>г. {selectedReview.city}</span>}
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div >
   );
};

export default ReviewsPage;