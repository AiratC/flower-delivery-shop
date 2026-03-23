import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Tag, Package, Loader2, Calendar, X } from 'lucide-react';
import fetchAxios from '../api/axios';
import AddStockForm from '../components/AddStockForm';

export default function Stocks() {
   const [stocks, setStocks] = useState([]);
   const [loading, setLoading] = useState(true);
   const [showForm, setShowForm] = useState(false);

   const loadStocks = useCallback(async () => {
      setLoading(true);
      try {
         const res = await fetchAxios.get('/stocks/get-stocks');
         setStocks(res.data);
      } catch (err) {
         console.error("Ошибка загрузки акций", err);
      } finally {
         setLoading(false);
      }
   }, [])

   useEffect(() => {
      loadStocks();
   }, [loadStocks]);

   return (
      <div className="p-8 bg-slate-50 min-h-screen">
         <div className="flex items-center justify-between mb-8">
            <div>
               <h1 className="text-3xl font-bold text-slate-800">Акции</h1>
               <p className="text-slate-500 text-sm">Управление специальными предложениями</p>
            </div>
            <button
               onClick={() => setShowForm(true)}
               className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-200"
            >
               <Plus size={20} />
               Добавить акцию
            </button>
         </div>

         {showForm && (
            <AddStockForm
               onClose={() => setShowForm(false)}
               onSuccess={() => { setShowForm(false); loadStocks(); }}
            />
         )}

         {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
         ) : stocks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {stocks.map(stock => (
                  <StockCard key={stock.stock_id} stock={stock} />
               ))}
            </div>
         ) : (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-20 flex flex-col items-center text-center">
               <Tag size={48} className="text-slate-300 mb-4" />
               <h3 className="text-xl font-bold text-slate-800">Акций пока нет</h3>
               <p className="text-slate-500 mt-2">Создайте первую акцию, чтобы привлечь клиентов!</p>
            </div>
         )}
      </div>
   );
}

// Мини-компонент карточки
function StockCard({ stock }) {
   const images = typeof stock.stock_images === 'string' ? JSON.parse(stock.stock_images) : (stock.stock_images || []);
   const mainImage = images[0] ? `${import.meta.env.VITE_BACKEND_URL}/${images[0].replace(/^\//, '')}` : 'https://via.placeholder.com/600x300?text=No+Image';

   return (
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all">
         <div className="h-48 overflow-hidden">
            <img src={mainImage} alt={stock.title} className="w-full h-full object-cover" />
         </div>
         <div className="p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-2">{stock.title}</h3>
            <p className="text-slate-600 text-sm line-clamp-3 mb-4">{stock.description}</p>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
               <Calendar size={14} />
               {new Date(stock.created_at).toLocaleDateString()}
            </div>
         </div>
      </div>
   );
}
