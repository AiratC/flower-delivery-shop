-- БАЗА ДАННЫХ МАГАЗИНА ДОСТАВКИ ЦВЕТОВ

CREATE TYPE user_role_type AS ENUM ('Админ', 'Пользователь');

-- Создание таблицы ролей
CREATE TABLE Roles (
   role_id SERIAL PRIMARY KEY,
   name user_role_type NOT NULL UNIQUE
);

-- Вставка базовых ролей ('Админ'), ('Пользователь'), ('Гость')
INSERT INTO Roles (name)
VALUES ('Админ'),
   ('Пользователь');

-- Создание таблицы пользователей
CREATE TABLE Users (
   user_id SERIAL PRIMARY KEY,
   role_id INT REFERENCES Roles(role_id) ON DELETE SET DEFAULT NOT NULL DEFAULT 2,
   name VARCHAR(255),
   email VARCHAR(250) UNIQUE NOT NULL,
   password_hash VARCHAR(255) NOT NULL,
   city VARCHAR(300) DEFAULT NULL,
   delivery_address VARCHAR(350) DEFAULT NULL,
   phone VARCHAR(30) UNIQUE,
   avatar TEXT DEFAULT NULL,
   is_agreed_terms BOOLEAN NOT NULL DEFAULT FALSE,
   total_spent DECIMAL(10, 2) DEFAULT 0,
   reset_password_token VARCHAR(255),
   reset_password_expires TIMESTAMP WITHOUT TIME ZONE,
   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ТАБЛИЦА НАКОПИТЕЛЬНАЯ СИСТЕМА СКИДОК
CREATE TABLE Discount_Tiers (
   tier_id SERIAL PRIMARY KEY,
   min_spent DECIMAL(10, 2) NOT NULL, -- Минимальная сумма (10000, 50000 и т.д.)
   discount_percent INT NOT NULL -- Процент (3, 5, 7)
);

INSERT INTO Discount_Tiers (min_spent, discount_percent)
VALUES (0, 0), (10000, 3), (50000, 5), (90000, 7);

-- ==========================================
-- 2. СПРАВОЧНИКИ (Для фильтров в боковой панели)
-- ==========================================

-- Таблица для фильтра "Цветовая гамма"
CREATE TABLE Color_Palettes (
   palette_id SERIAL PRIMARY KEY,
   name VARCHAR(50) UNIQUE NOT NULL -- Белая, Розовая, Красная и т.д.
);

-- Таблица для фильтра "Цветы упаковано"
CREATE TABLE Packaging_Types (
   packaging_id SERIAL PRIMARY KEY,
   name VARCHAR(50) UNIQUE NOT NULL -- Букетом, В корзине, В коробке
);

-- Таблица для фильтра "Букет с..." (Типы цветов)
CREATE TABLE Flower_Species (
   species_id SERIAL PRIMARY KEY,
   name VARCHAR(50) UNIQUE NOT NULL -- Розы, Тюльпаны, Гортензии
);

-- ==========================================
-- 3. КАТАЛОГ ТОВАРОВ
-- ==========================================

-- Основная информация о букете
CREATE TABLE Flowers (
   flower_id SERIAL PRIMARY KEY,
   title VARCHAR(255) NOT NULL,          -- Заголовок
   description TEXT,                     -- Описание
   composition JSONB DEFAULT '[]',                   -- Состав (массив строк для списка)
   delivery_info TEXT,                   -- Доставка и оплата
   images JSONB DEFAULT '[]',                        -- Массив ссылок на фото (основное + миниатюры)
   is_new BOOLEAN DEFAULT FALSE,         -- Новинка
   is_sale BOOLEAN DEFAULT FALSE,        -- Акция
   is_active BOOLEAN DEFAULT TRUE,
   
   -- Привязка к фильтрам
   palette_id INT REFERENCES Color_Palettes(palette_id),
   packaging_id INT REFERENCES Packaging_Types(packaging_id),
   
   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Связь "Многие-ко-многим" для фильтра "Букет с..." 
-- (В одном букете могут быть и Розы, и Лилии)
CREATE TABLE Flower_To_Species (
   flower_id INT REFERENCES Flowers(flower_id) ON DELETE CASCADE,
   species_id INT REFERENCES Flower_Species(species_id) ON DELETE CASCADE,
   PRIMARY KEY (flower_id, species_id)
);

-- Варианты размеров и цен для каждого букета
CREATE TABLE Flower_Variants (
   variant_id SERIAL PRIMARY KEY,
   flower_id INT REFERENCES Flowers(flower_id) ON DELETE CASCADE,
   size_name VARCHAR(50) NOT NULL,       -- Малый, Средний, Большой
   price_old DECIMAL(10, 2),             -- Старая цена
   price_new DECIMAL(10, 2) NOT NULL,    -- Новая цена
   is_default BOOLEAN DEFAULT FALSE      -- Базовый размер для отображения в каталоге
);

-- ====================================================================================
-- ТАБЛИЦА ОФОРМЛЕНИЯ ЗАКАЗА
-- ====================================================================================
CREATE TABLE Orders (
   order_id SERIAL PRIMARY KEY,
   user_id INT REFERENCES Users(user_id) ON DELETE SET NULL, 
   
   -- Способ доставки
   delivery_method VARCHAR(50) NOT NULL, -- 'Доставка по Владивостоку', 'Самовывоз'
   
   -- Дата и время
   delivery_date DATE NOT NULL,
   delivery_time_slot VARCHAR(100), -- Хранит '20:20'
   call_recipient BOOLEAN DEFAULT FALSE, -- 'Позвонить получателю...'
   keep_secret BOOLEAN DEFAULT FALSE,    -- 'Не говорить, что это цветы'
   
   -- Получатель
   recipient_type VARCHAR(50) DEFAULT 'Self', -- 'Я получатель' / 'Другой человек'
   recipient_name VARCHAR(255) NOT NULL,
   recipient_phone VARCHAR(30) NOT NULL,
   recipient_city VARCHAR(100) NOT NULL,
   delivery_address TEXT NOT NULL,
   order_note TEXT, -- Поле 'Примечание'
   
   -- Ваши контакты (Заказчик)
   customer_name VARCHAR(255) NOT NULL,
   customer_phone VARCHAR(30) NOT NULL,
   customer_email VARCHAR(150),
   customer_city VARCHAR(100), -- Поле 'Город' из блока контактов
   
   -- Оплата и статус
   total_price DECIMAL(10, 2) NOT NULL,
   payment_method VARCHAR(100) NOT NULL, -- 'Наличными при получении', 'Онлайн' и т.д.
   status VARCHAR(50) DEFAULT 'Новый',
   
   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создаем таблицу для храненеия данных заказа
CREATE TABLE Order_Items (
   order_item_id SERIAL PRIMARY KEY,
   order_id INT REFERENCES Orders(order_id) ON DELETE CASCADE NOT NULL,
   flower_id INT REFERENCES Flowers(flower_id) ON DELETE RESTRICT NOT NULL,
   selected_size VARCHAR(50), -- Добавил, чтобы знать какой размер купили
   quantity INT NOT NULL CHECK (quantity > 0),
   price_at_purchase DECIMAL(10, 2) NOT NULL -- Фиксируем цену на момент покупки!
);


-- ====================================================================================
-- ТАБЛИЦА ОТЗЫВОВ
-- ====================================================================================
CREATE TABLE Reviews (
   review_id SERIAL PRIMARY KEY,
   user_id INT REFERENCES Users(user_id) ON DELETE CASCADE NOT NULL,
   flower_id INT REFERENCES Flowers(flower_id) ON DELETE CASCADE,
   order_item_id INT REFERENCES Order_Items(order_item_id) ON DELETE CASCADE NOT NULL,
   
   -- Общие поля для обоих видов отзывов
   name VARCHAR(300),
   email VARCHAR(150),
   city VARCHAR(200), -- Понадобится для текстовых отзывов
   comment TEXT,
   rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
   
   -- Поле для фото (если оно NULL, отзыв считается просто текстовым)
   photo TEXT DEFAULT NULL, 
   
   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица корзины (объединенная)
CREATE TABLE Cart (
   cart_item_id SERIAL PRIMARY KEY,
   -- Либо user_id (для своих), либо guest_token (для гостей)
   user_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
   guest_token VARCHAR(255), 
   
   flower_id INT REFERENCES Flowers(flower_id) ON DELETE CASCADE NOT NULL,
   selected_size VARCHAR(50), -- Важно! В корзине должен быть размер
   quantity INT DEFAULT 1 CHECK (quantity > 0),
   
   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
   
   -- Ограничение: один и тот же букет одного размера не должен дублироваться строками
   CONSTRAINT unique_user_cart_item UNIQUE (user_id, flower_id, selected_size),
   CONSTRAINT unique_guest_cart_item UNIQUE (guest_token, flower_id, selected_size)
);

-- Таблица избранного
CREATE TABLE Favorites (
   favorite_id SERIAL PRIMARY KEY,
   user_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
   guest_token VARCHAR(255),
   
   flower_id INT REFERENCES Flowers(flower_id) ON DELETE CASCADE NOT NULL,
   
   CONSTRAINT unique_user_favorite UNIQUE (user_id, flower_id),
   CONSTRAINT unique_guest_favorite UNIQUE (guest_token, flower_id)
);

CREATE TABLE Ask_Question (
   ask_question_id SERIAL PRIMARY KEY,
   name VARCHAR(150) NOT NULL,
   email VARCHAR(200) DEFAULT NULL,
   phone VARCHAR(30) DEFAULT NULL, -- Уменьшили длину
   question TEXT NOT NULL,      -- Сделали обязательным, чтобы не слали пустые формы
   
   -- Новые полезные поля
   is_processed BOOLEAN DEFAULT FALSE, -- Статус: ответили клиенту или нет
   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создаем таблицу акций
CREATE TABLE Stock (
   stoсk_id SERIAL PRIMARY KEY,
   title VARCHAR(400),
   description TEXT,
   stoсk_images JSONB,
   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);