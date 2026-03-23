import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      // Определяем папку в зависимости от того, что загружаем
      let subFolder;

      if(req.originalUrl.includes('addons')) subFolder = 'addons';
      if(req.originalUrl.includes('flowers')) subFolder = 'flowers';
      if(req.originalUrl.includes('users')) subFolder = 'users';
      if(req.originalUrl.includes('stocks')) subFolder = 'stocks';

      const dir = `./uploads/${subFolder}`;

      if(!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
   },
   filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.round() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
   }
});

export const upload = multer({
   storage,
   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
   fileFilter: (req, file, cb) => {
      if(file.mimetype.startsWith('image/')) cb(null, true);
      else cb(new Error('Только images'), false);
   }
})