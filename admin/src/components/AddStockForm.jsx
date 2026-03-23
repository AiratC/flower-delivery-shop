import React, { memo, useState } from 'react';
import { X, Upload } from 'lucide-react';
import fetchAxios from '../api/axios';

export default memo(function AddStockForm({ onClose, onSuccess }) {
   const [title, setTitle] = useState('');
   const [description, setDescription] = useState('');
   const [files, setFiles] = useState([]);

   const handleSubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      Array.from(files).forEach(file => formData.append('images', file));

      try {
         await fetchAxios.post('/stocks/create-stock', formData);
         onSuccess();
      } catch {
         alert("Ошибка при сохранении");
      }
   };

   return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
         <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center">
               <h2 className="text-xl font-bold">Новая акция</h2>
               <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Заголовок</label>
                  <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
               </div>
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Описание</label>
                  <textarea rows="4" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
               </div>
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Изображение</label>
                  <input type="file" multiple onChange={e => setFiles(e.target.files)} className="hidden" id="stock-files" />
                  <label htmlFor="stock-files" className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all">
                     <Upload className="text-slate-400 mb-2" />
                     <span className="text-sm text-slate-500 font-medium">{files.length > 0 ? `Выбрано: ${files.length}` : 'Нажмите для загрузки'}</span>
                  </label>
               </div>
               <button type="submit" className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all">
                  Создать акцию
               </button>
            </form>
         </div>
      </div>
   );
})