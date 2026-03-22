import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Package, LayoutGrid, AlertCircle, Loader2 } from 'lucide-react';
import fetchAxios from '../api/axios';
import AddFlowerForm from '../components/AddFlowerForm'; // Тот, что мы писали с фото и ценами
import Settings from '../components/Settings'; // Твой менеджер справочников

export default function Catalog() {
   const [view, setView] = useState('list'); // 'list', 'add-flower', 'dicts'
   const [flowers, setFlowers] = useState([]);
   const [loading, setLoading] = useState(true);

   const loadFlowers = async () => {
      setLoading(true);
      try {
         const res = await fetchAxios.get('/flowers');
         setFlowers(res.data);
      } catch (err) {
         console.error("Ошибка загрузки цветов", err);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      if (view === 'list') loadFlowers();
   }, [view]);

   return (
      <div className="p-8 bg-slate-50 min-h-screen">
         {/* Шапка каталога */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
               <h1 className="text-3xl font-bold text-slate-800">Каталог букетов</h1>
               <p className="text-slate-500 text-sm">Управление ассортиментом и категориями</p>
            </div>

            <div className="flex gap-3">
               <button
                  onClick={() => setView(view === 'dicts' ? 'list' : 'dicts')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${view === 'dicts' ? 'bg-slate-800 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                     }`}
               >
                  <BookOpen size={18} />
                  {view === 'dicts' ? 'Назад в каталог' : 'Справочники'}
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
               <Settings />
            )}

            {view === 'list' && (
               <>
                  {loading ? (
                     <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                        <p className="text-slate-500">Загружаем букеты...</p>
                     </div>
                  ) : flowers.length > 0 ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {flowers.map((flower) => (
                           <FlowerCard key={flower.flower_id} flower={flower} />
                        ))}
                     </div>
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

// Мини-компонент карточки для списка
function FlowerCard({ flower }) {
   // Берем первое изображение из массива или заглушку
   const mainImage = flower.images?.[0] || 'https://via.placeholder.com/400x500?text=No+Photo';

   return (
      <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
         <div className="relative aspect-[4/5] overflow-hidden">
            <img
               src={mainImage}
               alt={flower.title}
               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {flower.is_sale && (
               <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
                  SALE
               </span>
            )}
         </div>
         <div className="p-4">
            <h4 className="font-bold text-slate-800 truncate">{flower.title}</h4>
            <div className="flex items-center justify-between mt-2">
               <span className="text-blue-600 font-bold">
                  от {flower.min_price || 0} ₽
               </span>
               <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded">
                  {flower.packaging_name || 'Упаковка'}
               </span>
            </div>
         </div>
      </div>
   );
}
