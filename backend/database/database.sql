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
   role_id INT REFERENCES Roles(role_id) ON DELETE
   SET DEFAULT NOT NULL DEFAULT 2,
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
   min_spent DECIMAL(10, 2) NOT NULL,
   -- Минимальная сумма (10000, 50000 и т.д.)
   discount_percent INT NOT NULL -- Процент (3, 5, 7)
);

INSERT INTO Discount_Tiers (min_spent, discount_percent)
VALUES (10000, 3),
   (50000, 5),
   (90000, 7);
   
-- Для всех новых пользователей
INSERT INTO Discount_Tiers (min_spent, discount_percent)
VALUES (0, 0);