import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Settings as SettingsIcon } from 'lucide-react';
import fetchAxios from '../api/axios';

const DictionaryManager = ({ title, endpoint, placeholder }) => {
   const [items, setItems] = useState([]);
   const [newValue, setNewValue] = useState('');

   // Загрузка данных
   const loadData = async () => {
      try {
         const res = await fetchAxios.get(endpoint);
         setItems(res.data);
      } catch { console.error("Ошибка загрузки " + title); }
   };

   // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
   useEffect(() => { loadData(); }, []);

   // Добавление новой записи
   const handleAdd = async () => {
      if (!newValue.trim()) return;
      try {
         await fetchAxios.post(endpoint, { name: newValue });
         setNewValue('');
         loadData();
      } catch { alert("Такое значение уже есть или ошибка сервера"); }
   };

   // Удаление
   const handleDelete = async (id) => {
      if (!window.confirm("Удалить? Это может затронуть букеты, где выбран этот элемент.")) return;
      try {
         await fetchAxios.delete(`${endpoint}/${id}`);
         loadData();
      } catch { alert("Нельзя удалить: этот элемент используется в товарах"); }
   };

   return (
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
         <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <SettingsIcon size={18} className="text-blue-500" /> {title}
         </h3>

         <div className="flex gap-2 mb-4">
            <input
               type="text"
               className="flex-1 px-3 py-2 bg-slate-50 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
               placeholder={placeholder}
               value={newValue}
               onChange={(e) => setNewValue(e.target.value)}
            />
            <button onClick={handleAdd} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
               <Plus size={20} />
            </button>
         </div>

         <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {items.map((item) => (
               <div key={item.id || item.palette_id || item.packaging_id || item.species_id}
                  className="flex justify-between items-center p-3 bg-slate-50 rounded-xl group transition-all">
                  <span className="text-slate-700 font-medium">{item.name}</span>
                  <button
                     onClick={() => handleDelete(item.id || item.palette_id || item.packaging_id || item.species_id)}
                     className="text-slate-300 hover:text-red-500 transition-colors"
                  >
                     <Trash2 size={16} />
                  </button>
               </div>
            ))}
         </div>
      </div>
   );
};

export default function Settings() {
   return (
      <div className="p-8 bg-slate-50 min-h-screen">
         <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">Управление справочниками</h1>
            <p className="text-slate-500">Настройте фильтры и категории для вашего каталога</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <DictionaryManager
               title="Цветовая гамма"
               endpoint="/dicts/palettes"
               placeholder="Напр: Красная"
            />
            <DictionaryManager
               title="Тип упаковки"
               endpoint="/dicts/packaging"
               placeholder="Напр: В корзине"
            />
            <DictionaryManager
               title="Виды цветов"
               endpoint="/dicts/species"
               placeholder="Напр: Гортензии"
            />
         </div>
      </div>
   );
}