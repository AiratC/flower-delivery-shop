import React, { useState } from 'react';
import { Save, Image as ImageIcon, Trash2, PackagePlus, Loader2 } from 'lucide-react';
import fetchAxios from '../api/axios';

export default function AddAddonsForm({ onSuccess }) {
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [preview, setPreview] = useState(null);

   const [formData, setFormData] = useState({
      title: '',
      price: '',
      is_available: true,
      raw_file: null
   });

   const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
         setFormData({ ...formData, raw_file: file });
         setPreview(URL.createObjectURL(file));
      }
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (isSubmitting) return;

      setIsSubmitting(true);
      const data = new FormData();

      data.append('title', formData.title);
      data.append('price', formData.price);
      data.append('is_available', formData.is_available);
      if (formData.raw_file) {
         data.append('image', formData.raw_file); // Multer на бэкенде поймает это поле
      }

      try {
         await fetchAxios.post('/addons', data);
         if (preview) URL.revokeObjectURL(preview);

         // Сброс формы
         setFormData({ title: '', price: '', is_available: true, raw_file: null });
         setPreview(null);

         if (onSuccess) onSuccess();
         alert('Дополнительный товар добавлен!');
      } catch (error) {
         console.error("Ошибка при сохранении:", error);
         alert('Не удалось сохранить товар');
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
         <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                     <PackagePlus size={24} />
                  </div>
                  <div>
                     <h2 className="text-xl font-bold text-slate-800">Новое дополнение</h2>
                     <p className="text-sm text-slate-500">Конфеты, игрушки, открытки и др.</p>
                  </div>
               </div>
               <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
               >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  Сохранить
               </button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
               {/* Секция фото */}
               <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Изображение товара</label>
                  <div className="relative group aspect-square rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 hover:border-blue-400 transition-colors flex flex-col items-center justify-center overflow-hidden">
                     {preview ? (
                        <>
                           <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                           <button
                              type="button"
                              onClick={() => { setPreview(null); setFormData({ ...formData, raw_file: null }); }}
                              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                           >
                              <Trash2 size={16} />
                           </button>
                        </>
                     ) : (
                        <label className="cursor-pointer flex flex-col items-center gap-2 text-slate-400 hover:text-blue-500">
                           <ImageIcon size={40} strokeWidth={1.5} />
                           <span className="text-xs font-medium">Загрузить фото</span>
                           <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </label>
                     )}
                  </div>
               </div>

               {/* Поля ввода */}
               <div className="md:col-span-2 space-y-6">
                  <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-2">Название</label>
                     <input
                        type="text"
                        required
                        placeholder="Напр: Набор конфет 'Ferrero Rocher'"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Цена (₽)</label>
                        <input
                           type="number"
                           required
                           placeholder="0.00"
                           className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                           value={formData.price}
                           onChange={e => setFormData({ ...formData, price: e.target.value })}
                        />
                     </div>
                     <div className="flex items-end pb-3">
                        <label className="flex items-center gap-3 cursor-pointer group">
                           <div className="relative">
                              <input
                                 type="checkbox"
                                 className="sr-only peer"
                                 checked={formData.is_available}
                                 onChange={e => setFormData({ ...formData, is_available: e.target.checked })}
                              />
                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                           </div>
                           <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">
                              В наличии
                           </span>
                        </label>
                     </div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                     <p className="text-xs text-amber-700 leading-relaxed">
                        Эти товары будут предлагаться клиенту на этапе оформления заказа как дополнение к основному букету.
                     </p>
                  </div>
               </div>
            </div>
         </form>
      </div>
   );
}
