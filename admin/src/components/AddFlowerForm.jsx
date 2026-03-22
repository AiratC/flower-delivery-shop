import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, Save } from 'lucide-react';
import fetchAxios from '../api/axios';

export default function AddFlowerForm() {
   // Данные из справочников (подгрузим при монтировании)
   // !!! palettes - цветовая гамма
   // !!! packaging - упаковано
   // !!! species - "Букет с..." (Типы цветов)
   const [dictionaries, setDictionaries] = useState({
      palettes: [],
      packaging: [],
      species: []
   });

   // Состояние формы
   const [formData, setFormData] = useState({
      title: '',
      description: '',
      palette_id: '',
      packaging_id: '',
      is_new: false,
      is_sale: false,
      images: [],
      selected_species: [], // Для таблицы Flower_To_Species
      variants: [{ size_name: 'Стандарт', price_old: '', price_new: '', is_default: true }]
   });

   // 1. Загрузка справочников
   useEffect(() => {
      const fetchDicts = async () => {
         try {
            const [p, pack, s] = await Promise.all([
               fetchAxios.get('/dicts/palettes'),
               fetchAxios.get('/dicts/packaging'),
               fetchAxios.get('/dicts/species')
            ]);
            setDictionaries({ palettes: p.data, packaging: pack.data, species: s.data });
         } catch { console.error("Ошибка загрузки справочников"); }
      };
      fetchDicts();
   }, []);

   // 2. Управление вариантами цен (Flower_Variants)
   const addVariant = () => {
      setFormData({ ...formData, variants: [...formData.variants, { size_name: '', price_old: '', price_new: '', is_default: false }] });
   };

   const removeVariant = (index) => {
      const newVariants = formData.variants.filter((_, i) => i !== index);
      setFormData({ ...formData, variants: newVariants });
   };

   const handleVariantChange = (index, field, value) => {
      const newVariants = [...formData.variants];
      newVariants[index][field] = value;
      setFormData({ ...formData, variants: newVariants });
   };

   // Хендлер для выбора файлов
   const handleImageUpload = async (e) => {
      const files = Array.from(e.target.files);

      // Здесь обычно идет отправка на бэкенд через FormData
      // const data = new FormData();
      // files.forEach(file => data.append('photos', file));
      // const res = await fetchAxios.post('/upload', data);

      // Пока сделаем временные превью (Local URL), чтобы увидеть результат
      const newImages = files.map(file => URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
   };

   const removeImage = (index) => {
      setFormData(prev => ({
         ...prev,
         images: prev.images.filter((_, i) => i !== index)
      }));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      try {
         await fetchAxios.post('/flowers', formData);
         alert('Букет успешно добавлен!');
      } catch { alert('Ошибка при сохранении'); }
   };

   return (
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto p-6 space-y-8 bg-white rounded-2xl shadow-sm border border-slate-100">
         <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-xl font-bold text-slate-800">Добавление нового букета</h2>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all">
               <Save size={18} /> Сохранить букет
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ЛЕВАЯ КОЛОНКА: Основное */}
            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Название букета</label>
                  <input
                     type="text" required
                     className="w-full px-4 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                     value={formData.title}
                     onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
               </div>

               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Описание</label>
                  <textarea
                     rows="4"
                     className="w-full px-4 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                     value={formData.description}
                     onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Цветовая гамма</label>
                     <select
                        className="w-full px-4 py-2 bg-slate-50 border rounded-lg outline-none"
                        value={formData.palette_id}
                        onChange={e => setFormData({ ...formData, palette_id: e.target.value })}
                     >
                        <option value="">Выберите...</option>
                        {dictionaries.palettes.map(p => <option key={p.palette_id} value={p.palette_id}>{p.name}</option>)}
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Тип упаковки</label>
                     <select
                        className="w-full px-4 py-2 bg-slate-50 border rounded-lg outline-none"
                        value={formData.packaging_id}
                        onChange={e => setFormData({ ...formData, packaging_id: e.target.value })}
                     >
                        <option value="">Выберите...</option>
                        {dictionaries.packaging.map(p => <option key={p.packaging_id} value={p.packaging_id}>{p.name}</option>)}
                     </select>
                  </div>
               </div>
            </div>

            {/* ПРАВАЯ КОЛОНКА: Виды цветов и Чекбоксы */}
            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Состав (какие цветы в букете)</label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 border rounded-lg bg-slate-50">
                     {dictionaries.species.map(s => (
                        <label key={s.species_id} className="flex items-center gap-2 text-sm cursor-pointer">
                           <input
                              type="checkbox"
                              checked={formData.selected_species.includes(s.species_id)}
                              onChange={(e) => {
                                 const val = s.species_id;
                                 const newSpecies = e.target.checked
                                    ? [...formData.selected_species, val]
                                    : formData.selected_species.filter(id => id !== val);
                                 setFormData({ ...formData, selected_species: newSpecies });
                              }}
                           /> {s.name}
                        </label>
                     ))}
                  </div>
               </div>

               <div className="flex gap-6 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                     <input type="checkbox" checked={formData.is_new} onChange={e => setFormData({ ...formData, is_new: e.target.checked })} />
                     <span className="text-sm font-medium">Новинка</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                     <input type="checkbox" checked={formData.is_sale} onChange={e => setFormData({ ...formData, is_sale: e.target.checked })} />
                     <span className="text-sm font-medium">Акция</span>
                  </label>
               </div>
            </div>
         </div>

         {/* СЕКЦИЯ ИЗОБРАЖЕНИЙ */}
         <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Фотографии букета</label>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
               {/* Список уже загруженных */}
               {formData.images.map((img, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200">
                     <img src={img} alt="preview" className="w-full h-full object-cover" />
                     <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                     >
                        <Trash2 size={14} />
                     </button>
                     {idx === 0 && (
                        <span className="absolute bottom-0 left-0 right-0 bg-blue-600/80 text-white text-[10px] text-center py-0.5">
                           Главное
                        </span>
                     )}
                  </div>
               ))}

               {/* Кнопка добавления */}
               <label className="cursor-pointer aspect-square rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-all text-slate-500">
                  <ImageIcon size={28} />
                  <span className="text-[10px] mt-1 font-medium">Добавить</span>
                  <input
                     type="file"
                     multiple
                     accept="image/*"
                     className="hidden"
                     onChange={handleImageUpload}
                  />
               </label>
            </div>
            <p className="text-xs text-slate-400">Первое фото будет использовано как обложка в каталоге.</p>
         </div>

         {/* НИЖНЯЯ СЕКЦИЯ: Варианты цен */}
         <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-slate-800">Размеры и цены (Flower_Variants)</h3>
               <button
                  type="button" onClick={addVariant}
                  className="text-blue-600 text-sm font-semibold flex items-center gap-1 hover:underline"
               >
                  <Plus size={16} /> Добавить размер
               </button>
            </div>

            <div className="space-y-3">
               {formData.variants.map((v, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-4 items-end bg-slate-50 p-4 rounded-xl border border-slate-200">
                     <div>
                        <label className="block text-xs text-slate-500 mb-1">Название (Малый, 51 роза...)</label>
                        <input
                           type="text" required value={v.size_name}
                           onChange={e => handleVariantChange(idx, 'size_name', e.target.value)}
                           className="w-full px-3 py-1.5 border rounded-md outline-none"
                        />
                     </div>
                     <div>
                        <label className="block text-xs text-slate-500 mb-1">Старая цена</label>
                        <input
                           type="number" value={v.price_old}
                           onChange={e => handleVariantChange(idx, 'price_old', e.target.value)}
                           className="w-full px-3 py-1.5 border rounded-md outline-none"
                        />
                     </div>
                     <div>
                        <label className="block text-xs text-slate-500 mb-1">Новая цена (Актуальная)</label>
                        <input
                           type="number" required value={v.price_new}
                           onChange={e => handleVariantChange(idx, 'price_new', e.target.value)}
                           className="w-full px-3 py-1.5 border rounded-md outline-none"
                        />
                     </div>
                     <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-xs">
                           <input
                              type="radio" name="default_size" checked={v.is_default}
                              onChange={() => {
                                 const newVars = formData.variants.map((varnt, i) => ({ ...varnt, is_default: i === idx }));
                                 setFormData({ ...formData, variants: newVars });
                              }}
                           /> По умолчанию
                        </label>
                        {formData.variants.length > 1 && (
                           <button type="button" onClick={() => removeVariant(idx)} className="text-red-500 hover:bg-red-100 p-2 rounded-lg">
                              <Trash2 size={18} />
                           </button>
                        )}
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </form>
   );
}