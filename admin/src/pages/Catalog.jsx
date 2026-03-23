import React, { useState, useEffect, useCallback, memo } from 'react';
import { Plus, BookOpen, Package, LayoutGrid, AlertCircle, Loader2, Gift, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import fetchAxios from '../api/axios';
import AddFlowerForm from '../components/AddFlowerForm'; // Тот, что мы писали с фото и ценами
import Settings from '../components/Settings'; // Твой менеджер справочников
import AddAddonsForm from '../components/AddAddonsForm';

export default function Catalog() {
   const [view, setView] = useState('list'); // 'list', 'add-flower', 'dicts'
   const [activeTab, setActiveTab] = useState('flowers');
   const [items, setItems] = useState([]);
   const [loading, setLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState('');

   // Состояние пагинации
   const [currentPage, setCurrentPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const limit = 8; // Кол-во элементов на странице

   // eslint-disable-next-line react-hooks/exhaustive-deps
   const loadData = async () => {
      setLoading(true);
      try {
         const endpoint = activeTab === 'flowers' ? '/flowers/get-flowers' : '/addons/get-addons';
         const res = await fetchAxios.get(endpoint, {
            params: {
               page: currentPage,
               limit: limit,
               search: searchQuery
            }
         });
         // Оставляем твою логику обработки данных
         setItems(res.data.data || res.data);
         setTotalPages(res.data.totalPages || 1);
      } catch (err) {
         console.error("Ошибка загрузки", err);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      if (view === 'list') {
         const delayDebounceFn = setTimeout(() => {
            loadData();
         }, 500);

         return () => clearTimeout(delayDebounceFn)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [view, activeTab, currentPage, searchQuery]);

   // Сброс страницы при смене вкладки
   const handleTabChange = (tab) => {
      setActiveTab(tab);
      setCurrentPage(1);
   }

   const deleteItem = useCallback(async (item) => {
      let flowerId = item.flower_id ? item.flower_id : null
      let addonId = item.addon_id ? item.addon_id : null
      const endpoint = flowerId ? `/flowers/delete-flower/${flowerId}` : addonId ? `/addons/delete-addons/${addonId}` : ''

      try {
         const response = await fetchAxios.delete(endpoint);
         if(response.data.success) {
            alert('Товар удален!');
            loadData();
         }
      } catch (error) {
         console.log(error)
      }

   }, [loadData]) 

   return (
      <div className="p-8 bg-slate-50 min-h-screen">
         {/* Шапка каталога */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
               <h1 className="text-3xl font-bold text-slate-800">Каталог</h1>
               <p className="text-slate-500 text-sm">Управление ассортиментом магазина</p>
            </div>

            <div className="flex flex-wrap gap-3">

               <button
                  onClick={() => setView(view === 'addons' ? 'list' : 'addons')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${view === 'addons' ? 'bg-slate-800 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                     }`}
               >
                  <Gift size={18} />
                  {view === 'addons' ? 'Назад' : 'Добавить доп. товар'}
               </button>

               <button
                  onClick={() => setView(view === 'dicts' ? 'list' : 'dicts')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${view === 'dicts' ? 'bg-slate-800 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                     }`}
               >
                  <BookOpen size={18} />
                  {view === 'dicts' ? 'Назад' : 'Справочники'}
               </button>

               <button
                  onClick={() => setView(view === 'add-flower' ? 'list' : 'add-flower')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all shadow-sm ${view === 'add-flower' ? 'bg-slate-800 text-white' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                     }`}
               >
                  <Plus size={20} />
                  {view === 'add-flower' ? 'Отмена' : 'Добавить букет'}
               </button>
            </div>
         </div>

         {/* Контентная область */}
         <div className="animate-in fade-in duration-500">
            {view === 'add-flower' && (
               <AddFlowerForm onSuccess={() => setView('list')} />
            )}

            {view === 'dicts' && (
               <Settings onSuccess={() => setView('list')} />
            )}

            {
               view === 'addons' && (
                  <AddAddonsForm onSuccess={() => setView('list')} />
               )
            }

            {view === 'list' && (
               <>
                  {/* Вкладки внутри списка */}
                  <div className='flex gap-1 bg-slate-200/50 p-1 rounded-2xl w-fit mb-6'>
                     <button
                        onClick={() => handleTabChange('flowers')}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'flowers' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                     >
                        Букеты
                     </button>
                     <button
                        onClick={() => handleTabChange('extra')}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'extra' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                     >
                        Дополнения
                     </button>
                  </div>

                  {/* Поисковик */}
                  <div className="relative w-full md:w-72 mb-5">
                     <input
                        type="text"
                        placeholder="Поиск по названию..."
                        value={searchQuery}
                        onChange={(e) => {
                           setSearchQuery(e.target.value);
                           setCurrentPage(1); // Сбрасываем на 1 страницу при поиске
                        }}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm text-sm"
                     />
                     <svg className="absolute left-3 top-3 text-slate-400" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                     </svg>
                  </div>

                  {loading ? (
                     <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                     </div>
                  ) : items.length > 0 ? (
                     <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                           {items.map((item) => (
                              <ItemCard
                                 key={activeTab === 'flowers' ? item.flower_id : item.addon_id}
                                 item={item}
                                 type={activeTab}
                                 deleteItem={deleteItem}
                              />
                           ))}
                        </div>

                        {/* Пагинация */}
                        {
                           totalPages > 1 && (
                              <div className='flex items-center justify-center gap-2 mt-12'>
                                 <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className='
                                 p-2 rounded-lg bg-white border border-slate-200
                                 text-slate-600 disabled:opacity-30 hover:bg-slate-50
                                 '
                                 >
                                    <ChevronLeft size={20} />
                                 </button>

                                 {
                                    [...Array(totalPages)].map((_, index) => (
                                       <button
                                          key={index}
                                          onClick={() => setCurrentPage(index + 1)}
                                          className={`w-10 h-10 rounded-lg font-bold text-sm
                                          transition-all ${currentPage === index + 1 ?
                                                'bg-blue-600 text-white shadow-md shadow-blue-200' :
                                                'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'

                                             }`}
                                       >
                                          {index + 1}
                                       </button>
                                    ))
                                 }

                                 <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className='p-2 rounded-lg bg-white border border-slate-200
                                 text-slate-600 disabled:opacity-30 hover:bg-slate-50'
                                 >
                                    <ChevronRight size={20} />
                                 </button>
                              </div>
                           )
                        }
                     </>

                  ) : (
                     <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-20 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                           <Package size={40} className="text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Букетов пока нет</h3>
                        <p className="text-slate-500 max-w-sm mt-2">
                           Ваш каталог пуст. Начните с добавления справочников, а затем создайте свой первый букет.
                        </p>
                     </div>
                  )}
               </>
            )}
         </div>
      </div>
   );
}

// Универсальная карточка
const ItemCard = memo(({ item, type, deleteItem }) => {
   const isFlower = type === 'flowers';
   let images = [];

   try {
      images = typeof item.image === 'string' ? JSON.parse(item.image) : (item.image || item.images || []);
      // Если после парсинга всё еще строка (бывает при двойной сериализации)
      if (typeof images === 'string') images = JSON.parse(images);
   } catch {
      images = [];
   };

   // Проверяем наличие слэша в начале пути
   const imagePath = images[0] ? (images[0].startsWith('/') ? images[0] : `/${images[0]}`) : null;
   const mainImage = imagePath
      ? `${import.meta.env.VITE_BACKEND_URL}${imagePath}`
      : `https://via.placeholder.com/400x500?text=No+Photo`;

   return (
      <div className='bg-white rounded-3xl overflow-hidden border border-b-slate-100
      shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group'>
         <div className='relative aspect-[4/5] overflow-hidden bg-slate-100'>
            {/* Кнопка удаления в углу карточки */}
            <button
               onClick={(e) => {
                  e.stopPropagation(); // Чтобы не сработало нажатие на всю карточку
                  if (window.confirm('Удалить этот товар?')) {
                     // Здесь будет вызов onDelete(item.flower_id)
                     deleteItem(item)
                  }
               }}
               className="cursor-pointer absolute top-4 right-4 p-2 bg-white/90 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-all z-20"
            >
               <Trash2 size={18} />
            </button>
            <img
               src={mainImage}
               alt={item.title}
               className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700'
            />
            {isFlower && item.is_sale && (
               <span className='absolute top-4 left-4 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg uppercase z-10'>
                  Sale
               </span>
            )}
            {!isFlower && !item.is_available && (
               <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                  <span className="bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded-lg">Нет в наличии</span>
               </div>
            )}
         </div>
         <div className="p-5">
            <h4 className="font-bold text-slate-800 text-lg leading-tight mb-2 group-hover:text-blue-600 transition-colors truncate">
               {item.title}
            </h4>
            <div className="flex items-center justify-between">
               <span className="text-blue-600 font-black text-lg">
                  {isFlower ? `от ${item.min_price || 0}` : item.price} ₽
               </span>
               <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded-md">
                  {isFlower ? (item.packaging_name || 'Букет') : 'Дополнение'}
               </span>
            </div>
         </div>
      </div>
   )
})