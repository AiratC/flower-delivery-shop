import React, { useEffect, useMemo, useState } from 'react'
import styles from './AddonSection.module.css';
import AddonCard from '../AddonCard/AddonCard';
import { Link } from 'react-router-dom';

const ITEMS_PER_PAGE = 6; // 2 ряда по 3 крточки на десктопе

const AddonSection = ({ addons = [] }) => {
   const [currentPage, setCurrentPage] = useState(1);

   const totalPages = Math.ceil(addons.length / ITEMS_PER_PAGE);


   // Получаем товары для текущей страницы
   const currentItems = useMemo(() => {
      return addons.slice(
         (currentPage - 1) * ITEMS_PER_PAGE,
         currentPage * ITEMS_PER_PAGE
      )
   }, [addons, currentPage]);

   // Логика отображения номеров страниц (умная пагинация)
   const getPageNumbers = () => {
      const pages = [];
      const range = 1; // Количество страниц ПЕРЕД и ПОСЛЕ текущей (например: 4 [5] 6)

      if (totalPages <= 5) {
         for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else {
         pages.push(1);
         if (currentPage > range + 2) pages.push('...');

         let start = Math.max(2, currentPage - range);
         let end = Math.min(totalPages - 1, currentPage + range);

         for (let i = start; i <= end; i++) pages.push(i);

         if (currentPage < totalPages - (range + 1)) pages.push('...');
         pages.push(totalPages);
      }
      return pages;
   };

   useEffect(() => {
      if (currentPage > totalPages && totalPages > 0) {
         // eslint-disable-next-line react-hooks/set-state-in-effect
         setCurrentPage(totalPages);
      }
   }, [totalPages, currentPage]);

   if (!addons.length) return null;

   return (
      <section className={styles.addonsSection}>
         <div className={`container`}>
            <h2 className={styles.sectionTitle}>ДОПОЛНИТЬ ЗАКАЗ</h2>

            {
               currentItems.length > 0 ? (
                  <div className={styles.grid}>
                     {
                        currentItems.map(addon => (
                           <AddonCard key={addon.addon_id} addon={addon} />
                        ))
                     }
                  </div>
               ) : (
                  <h3 style={{ color: 'red' }}>Нет дополнительных товаров</h3>
               )
            }


            {
               totalPages > 1 && (
                  <div className={styles.pagination}>
                     {
                        getPageNumbers().map((page, index) => (
                           <button
                              key={index}
                              disabled={page === '...'}
                              className={`
                              ${styles.pageBtn} ${page === currentPage ? styles.active : ''}
                              ${page === '...' ? styles.dots : ''}
                              `
                              }
                              onClick={() => typeof page === 'number' && setCurrentPage(page)}
                           >
                              {page}
                           </button>
                        ))
                     }
                  </div>
               )
            }

            <div className={styles.footerAction}>
               <Link
                  to={`/checkout`}
                  className={styles.checkoutBtn}
               >
                  Оформить заказ
               </Link>
            </div>
         </div>
      </section>
   )
}

export default React.memo(AddonSection);
