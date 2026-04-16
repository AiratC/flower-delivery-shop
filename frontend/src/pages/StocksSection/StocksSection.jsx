import React, { useEffect, useState } from 'react';
import styles from './StocksSection.module.css';
import fetchAxios from '../../api/axios';
import { Loader } from 'lucide-react';

const StocksSection = () => {
   const [stocks, setStocks] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchStocks = async () => {
         try {
            const response = await fetchAxios.get('/stocks/get-stocks');
            setStocks(response.data);
         } catch (error) {
            console.error('Ошибка при загрузке акций:', error);
         } finally {
            setLoading(false);
         }
      };
      fetchStocks();
   }, []);

   useEffect(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
   }, [])

   if (loading) return <div className={styles.center}><Loader className="spinner" /></div>;

   return (
      <div className="container">
         <nav className={styles.breadcrumb}>Главная &gt; Акции</nav>
         <h1 className={styles.mainTitle}>АКЦИИ</h1>

         <div className={styles.stocksGrid}>
            {stocks.map((stock) => {
               // Берем первое изображение из массива JSONB
               const firstImage = stock.stock_images && stock.stock_images.length > 0
                  ? stock.stock_images[0]
                  : 'placeholder.png'; // Заглушка, если фото нет

               return (
                  <div key={stock.stock_id} className={styles.stockCard}>
                     <div className={styles.imageWrapper}>
                        <img
                           src={`${import.meta.env.VITE_BACKEND_URL}/${firstImage}`}
                           alt={stock.title}
                           className={styles.stockImage}
                        />
                     </div>
                     <div className={styles.cardContent}>
                        {/* Используем created_at для даты, если нет end_date */}
                        <span className={styles.date}>
                           Опубликовано {new Date(stock.created_at).toLocaleDateString('ru-RU')}
                        </span>
                        <h3 className={styles.title}>{stock.title}</h3>
                        {stock.description && (
                           <p className={styles.description}>{stock.description}</p>
                        )}
                     </div>
                  </div>
               );
            })}
         </div>
      </div>
   );
};

export default StocksSection;