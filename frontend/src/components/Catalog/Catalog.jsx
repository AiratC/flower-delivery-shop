/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useState, useRef } from 'react';
import styles from './Catalog.module.css';
import fetchAxios from '../../api/axios';
import { Loader2, Search, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '../ProductCard/ProductCard';

const priceRanges = [
   { id: '0-2500', name: 'до 2500 руб.' },
   { id: '2500-4000', name: '2500 - 4000 руб.' },
   { id: '4000-6000', name: '4000 - 6000 руб.' },
   { id: '6000-0', name: 'от 6000 руб.' },
];

const Catalog = () => {
   const [flowers, setFlowers] = useState([]);
   const [page, setPage] = useState(1);
   const [searchTerm, setSearchTerm] = useState('');
   const [search, setSearch] = useState('');
   const [isMenuOpen, setIsMenuOpen] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [hasMore, setHasMore] = useState(true);
   const [isReady, setIsReady] = useState(false);

   const gridRef = useRef(null);

   const [directories, setDirectories] = useState({ species: [], packaging: [], palettes: [] });
   const [selectedFilters, setSelectedFilters] = useState({ species: [], packaging: [], palettes: [], priceRange: '' });

   const isInitialMount = useRef(true);

   const loadFlowers = useCallback(async (targetPage, isAppend = false, shouldScrollTop = false) => {
      if (isLoading) return;
      setIsLoading(true);

      try {
         const params = {
            page: targetPage,
            limit: 6,
            search: search, // Берем из актуального стейта
            species: selectedFilters.species.join(','),
            packaging: selectedFilters.packaging.join(','),
            palettes: selectedFilters.palettes.join(','),
            price: selectedFilters.priceRange
         };

         const response = await fetchAxios.get('/flowers/get-flowers-catalog', { params });
         const newItems = response.data;

         setFlowers(prev => {
            if (isAppend) {
               // Убираем возможные дубликаты по ID, если они проскочили
               const existingIds = new Set(prev.map(f => f.flower_id));
               const uniqueNew = newItems.filter(f => !existingIds.has(f.flower_id));
               return [...prev, ...uniqueNew];
            }
            return newItems;
         });

         setHasMore(newItems.length === 6);
         setPage(targetPage);

         if (shouldScrollTop) {
            // Используем setTimeout, чтобы дождаться отрисовки DOM
            setTimeout(() => {
               gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 0);
         }
      } catch (error) {
         console.error("Ошибка загрузки:", error);
      } finally {
         setIsLoading(false);
      }
   }, [selectedFilters, search]);

   useEffect(() => {
      const init = async () => {
         try {
            const [s, pack, pal] = await Promise.all([
               fetchAxios.get(`/directories/species`),
               fetchAxios.get(`/directories/packaging`),
               fetchAxios.get(`/directories/palettes`)
            ]);
            setDirectories({ species: s.data, packaging: pack.data, palettes: pal.data });
         } catch (e) { console.error(e); }

         const saved = sessionStorage.getItem('catalog_cache');
         if (saved) {
            const cache = JSON.parse(saved);
            setFlowers(cache.flowers);
            setPage(cache.page);
            setHasMore(cache.hasMore);
            setSelectedFilters(cache.filters);
            setSearch(cache.search);
            setSearchTerm(cache.search);
         }
         setIsReady(true); // Устанавливаем готовность в самом конце
      };
      init();
   }, []);

   useEffect(() => {
      // 1. Ждем, пока отработает init()
      if (!isReady) return;

      // 2. Если это самый первый маунт компонента
      if (isInitialMount.current) {
         isInitialMount.current = false;

         // КРИТИЧЕСКИЙ МОМЕНТ: 
         // Если в стейте уже есть цветы (из кэша), 
         // мы ПРЕРЫВАЕМ эффект, чтобы не сбрасывать пагинацию к 1 странице.
         if (flowers.length > 0) {
            console.log("Восстановлено из кэша: блокируем сброс пагинации");
            return;
         }
      };

      // 3. Если мы дошли сюда, значит либо кэша не было, 
      // либо пользователь изменил фильтры/поиск вручную.
      console.log("Фильтры изменились: сброс на 1 страницу");
      loadFlowers(1, false, true);

   }, [search, JSON.stringify(selectedFilters), isReady]);

   // 4. Сохранение в кэш
   useEffect(() => {
      // Сохраняем всегда, когда данные изменились и компонент готов
      if (isReady && flowers.length > 0) {
         const stateToSave = { flowers, page, hasMore, filters: selectedFilters, search };
         sessionStorage.setItem('catalog_cache', JSON.stringify(stateToSave));
      }
   }, [flowers, page, hasMore, selectedFilters, search, isReady]);

   // -----------------------------------------------------------------------------------------

   // Дебаунс поиска
   useEffect(() => {
      const t = setTimeout(() => setSearch(searchTerm), 500);
      return () => clearTimeout(t);
   }, [searchTerm]);

   const handleLoadMore = () => {
      loadFlowers(page + 1, true); // Грузим следующую страницу и добавляем в хвост
   };

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
   }, []);

   return (
      <div className={styles.catalogContainer}>
         <div className={styles.mobileFilterToggle} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span>{isMenuOpen ? "Закрыть фильтры" : "Сортировка/фильтр/поиск"}</span>
            {isMenuOpen ? <X size={20} /> : <SlidersHorizontal size={20} />}
         </div>

         <div className={styles.catalogLayout}>
            <main className={styles.main}>
               <div className={styles.grid} ref={gridRef}>
                  {flowers.map(item => (
                     <ProductCard key={`${item.flower_id}-${item.name}`} data={item} isLoading={isLoading} />
                  ))}
                  {flowers.length === 0 && !isLoading && <p className={styles.empty}>Букеты не найдены</p>}
               </div>

               <div className={styles.paginationWrapper}>
                  {isLoading ? (
                     <div className={styles.loader}>
                        <Loader2 className="spinner" size={32} />
                        <span>Загружаем букеты...</span>
                     </div>
                  ) : (
                     hasMore && flowers.length > 0 && (
                        <button className={styles.loadMore} onClick={handleLoadMore}>
                           Показать еще
                        </button>
                     )
                  )}
               </div>
            </main>

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
                  {/* ... (блоки фильтров без изменений) ... */}
                  <div className={styles.filterBlock}>
                     <h4 className={styles.filterTitle}>Стоимость:</h4>
                     {priceRanges.map(range => (
                        <label key={range.id} className={styles.label}>
                           <input
                              type="radio"
                              checked={selectedFilters.priceRange === range.id}
                              onChange={() => handlePriceChange(range.id)}
                           />
                           <span className={selectedFilters.priceRange === range.id ? styles.activeText : ''}>{range.name}</span>
                        </label>
                     ))}
                  </div>

                  <FilterGroup title="Букет с..." items={directories.species} selected={selectedFilters.species} onToggle={(id) => toggleFilter('species', id)} idKey='species_id' />
                  <FilterGroup title="Цветы упаковано" items={directories.packaging} selected={selectedFilters.packaging} onToggle={(id) => toggleFilter('packaging', id)} idKey='packaging_id' />
                  <FilterGroup title="Цветовая гамма" items={directories.palettes} selected={selectedFilters.palettes} onToggle={(id) => toggleFilter('palettes', id)} idKey='palette_id' />
               </div>
            </aside>
         </div>
      </div>
   );
};

// Вспомогательный компонент FilterGroup как в твоем коде
function FilterGroup({ title, items, selected, onToggle, idKey }) {
   return (
      <div className={styles.filterBlock}>
         <h4 className={styles.filterTitle}>{title}</h4>
         {items.map(item => {
            const itemId = item[idKey];
            return (
               <label key={itemId} className={styles.label}>
                  <input type="checkbox" checked={selected.includes(itemId)} onChange={() => onToggle(itemId)} />
                  <span className={selected.includes(itemId) ? styles.activeText : ''}>{item.name}</span>
               </label>
            )
         })}
      </div>
   );
}

export default Catalog;
