import React, { useCallback, useEffect, useState } from 'react';
import styles from './Catalog.module.css';
import fetchAxios from '../../api/axios';
import { Loader2, Search, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '../ProductCard/ProductCard';

// Константы для цен
const priceRanges = [
   { id: '0-2500', name: 'до 2500 руб.' },
   { id: '2500-4000', name: '2500 - 4000 руб.' },
   { id: '4000-6000', name: '4000 - 6000 руб.' },
   { id: '6000-0', name: 'от 6000 руб.' }, // 0 значит без лимита сверху
];

const Catalog = () => {
   const [flowers, setFlowers] = useState([]);
   const [page, setPage] = useState(1);
   const [searchTerm, setSearchTerm] = useState('');
   const [search, setSearch] = useState('');
   const [isMenuOpen, setIsMenuOpen] = useState(false);

   const [isLoading, setIsLoading] = useState(false);
   const [hasMore, setHasMore] = useState(true);

   // Справочники для фильтров
   const [directories, setDirectories] = useState({
      species: [],
      packaging: [],
      palettes: []
   });

   // Состояние выбранных фильтров
   const [selectedFilters, setSelectedFilters] = useState({
      species: [],
      packaging: [],
      palettes: [],
      priceRange: ''
   });

   // Эффект для дебаунса (задержки) поиска
   useEffect(() => {
      const delayDebounceFn = setTimeout(() => {
         setSearch(searchTerm);
      }, 500);

      return () => clearTimeout(delayDebounceFn)
   }, [searchTerm]);

   // Загрузка справочников при первом рендере
   useEffect(() => {
      const fetchDirectories = async () => {
         try {
            const [species, packaging, palettes] = await Promise.all([
               fetchAxios.get(`/directories/species`),
               fetchAxios.get(`/directories/packaging`),
               fetchAxios.get(`/directories/palettes`)
            ]);
            setDirectories({ species: species.data, packaging: packaging.data, palettes: palettes.data });
         } catch (error) {
            console.log(error)
         }
      };

      fetchDirectories();
   }, []);

   // Основная функция загрузки товаров
   const loadFlowers = useCallback(async (currentPage, isAppend = false) => {
      if (isLoading) return;

      try {
         setIsLoading(true);

         const params = {
            page: currentPage,
            search,
            species: selectedFilters.species.join(','),
            packaging: selectedFilters.packaging.join(','),
            palettes: selectedFilters.palettes.join(','),
            price: selectedFilters.priceRange
         };
         const response = await fetchAxios.get('/flowers/get-flowers-catalog', { params });

         const newItems = response.data;

         // Если пришло меньше товаров, чем размер страницы (например, 12), значит товаров больше нет
         // Или если пришел пустой массив
         if (newItems.length === 0 || newItems.length < 6) {
            setHasMore(false);
         } else {
            setHasMore(true);
         }

         setFlowers(prev => isAppend ? [...prev, ...newItems] : newItems);
      } catch (error) {
         console.log(error)
      } finally {
         setIsLoading(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [selectedFilters, search]);

   useEffect(() => {
      setFlowers([]); // Очищаем список при смене фильтров
      setPage(1);
      setHasMore(true);
      loadFlowers(1, false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [search, selectedFilters]);

   useEffect(() => {
      if (page > 1) loadFlowers(page, true);
   }, [page, loadFlowers]);

   const toggleFilter = useCallback((category, id) => {
      setSelectedFilters(prev => ({
         ...prev,
         [category]: prev[category].includes(id)
            ? prev[category].filter(i => i !== id)
            : [...prev[category], id]
      }));
   }, []);

   const handlePriceChange = useCallback((rangeId) => {
      setSelectedFilters(prev => ({
         ...prev,
         priceRange: prev.priceRange === rangeId ? '' : rangeId
      }))
   }, [])

   return (
      <div className={styles.catalogContainer}>
         {/* Мобильная кнопка фильтров (видна только на мобилках) */}
         <div className={styles.mobileFilterToggle} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span>{isMenuOpen ? "Закрыть фильтры" : "Сортировка/фильтр/поиск"}</span>
            {isMenuOpen ? <X size={20} /> : <SlidersHorizontal size={20} />}
         </div>

         <div className={styles.catalogLayout}>


            <main className={styles.main}>
               <div className={styles.grid}>
                  {flowers.length > 0 ? (
                     flowers.map(item => (
                        <ProductCard key={item.flower_id} data={item} />
                     ))
                  ) : (
                     !isLoading && <p className={styles.empty}>Букеты не найдены</p>
                  )}
               </div>

               {/* КНОПКА С ЛОАДЕРОМ */}
               <div className={styles.paginationWrapper}>
                  {isLoading ? (
                     <div className={styles.loader}>
                        <Loader2 className={styles.spinner} size={32} />
                        <span>Загружаем букеты...</span>
                     </div>
                  ) : (
                     hasMore && flowers.length > 0 && (
                        <button
                           className={styles.loadMore}
                           onClick={() => setPage(p => p + 1)}
                        >
                           Показать еще
                        </button>
                     )
                  )}
               </div>
            </main>
            
            {/* Сайдбар теперь будет иметь класс открытого состояния */}
            <aside className={`${styles.aside} ${isMenuOpen ? styles.asideOpen : ''}`}>

               <div className={styles.searchBox}>
                  <input
                     type="text"
                     placeholder="Поиск"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className={styles.searchInput}
                  />
                  <Search className={styles.searchIcon} size={18} />
               </div>

               <div className={styles.filterGroupsContainer}>
                  <div className={styles.filterBlock}>
                     <h4 className={styles.filterTitle}>Стоимость:</h4>
                     {priceRanges.map(range => (
                        <label key={range.id} className={styles.label}>
                           <input
                              type="radio"
                              checked={selectedFilters.priceRange === range.id}
                              onChange={() => handlePriceChange(range.id)}
                           />
                           <span className={selectedFilters.priceRange === range.id ? styles.activeText : ''}>
                              {range.name}
                           </span>
                        </label>
                     ))}
                  </div>

                  <FilterGroup
                     title="Букет с..."
                     items={directories.species}
                     selected={selectedFilters.species}
                     onToggle={(id) => toggleFilter('species', id)}
                     idKey='species_id'
                  />

                  <FilterGroup
                     title="Цветы упаковано"
                     items={directories.packaging}
                     selected={selectedFilters.packaging}
                     onToggle={(id) => toggleFilter('packaging', id)}
                     idKey='packaging_id'
                  />

                  <FilterGroup
                     title="Цветовая гамма"
                     items={directories.palettes}
                     selected={selectedFilters.palettes}
                     onToggle={(id) => toggleFilter('palettes', id)}
                     idKey='palette_id'
                  />
               </div>
            </aside>
            
         </div>
      </div>
   );
};

// Вспомогательный компонент для группы фильтров
function FilterGroup({ title, items, selected, onToggle, idKey }) {

   return (
      <div className={styles.filterBlock}>
         <h4 className={styles.filterTitle}>{title}</h4>
         {
            items.length > 0 && (
               items.map(item => {
                  const itemId = item[idKey];
                  return (
                     <label key={itemId} className={styles.label}>
                        <input
                           type="checkbox"
                           checked={selected.includes(itemId)}
                           onChange={() => onToggle(itemId)}
                        />
                        <span className={selected.includes(itemId) ? styles.activeText : ''}>
                           {item.name}
                        </span>
                     </label>
                  )
               }
               )
            )
         }
      </div>
   );
}

export default Catalog
