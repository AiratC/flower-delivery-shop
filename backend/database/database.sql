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