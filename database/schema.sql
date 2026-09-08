-- ============================================
-- CHOWLY DATABASE SCHEMA
-- Based on:
-- Alimat Amodu Application Architecture
-- Chowly Build Assignment
-- ============================================


-- ============================================
-- DROP TABLES
-- ============================================

DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS order_status_history CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS order_preparations CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS bartenders CASCADE;
DROP TABLE IF EXISTS chefs CASCADE;
DROP TABLE IF EXISTS waiters CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;


-- ============================================
-- 1. RESTAURANTS
-- ============================================

CREATE TABLE restaurants (
    id SERIAL PRIMARY KEY,

    name VARCHAR(150) NOT NULL,

    address VARCHAR(255),

    phone_number VARCHAR(30),

    email VARCHAR(150) UNIQUE,

    opening_hour VARCHAR(50),

    opening_days VARCHAR(100),

    restaurant_status VARCHAR(30) NOT NULL
        DEFAULT 'active'
        CHECK (
            restaurant_status IN (
                'active',
                'inactive'
            )
        )
);


-- ============================================
-- 2. CUSTOMERS
-- ============================================

CREATE TABLE customers (
    id SERIAL PRIMARY KEY,

    first_name VARCHAR(100) NOT NULL,

    last_name VARCHAR(100) NOT NULL,

    gender VARCHAR(20),

    phone_number VARCHAR(30),

    email VARCHAR(150) UNIQUE,

    date_registered DATE DEFAULT CURRENT_DATE,

    customer_status VARCHAR(30) NOT NULL
        DEFAULT 'active'
        CHECK (
            customer_status IN (
                'active',
                'inactive'
            )
        )
);


-- ============================================
-- 3. EMPLOYEES
-- ============================================

CREATE TABLE employees (
    id SERIAL PRIMARY KEY,

    restaurant_id INTEGER NOT NULL
        REFERENCES restaurants(id)
        ON DELETE CASCADE,

    first_name VARCHAR(100) NOT NULL,

    last_name VARCHAR(100) NOT NULL,

    phone_number VARCHAR(30),

    email VARCHAR(150),

    role VARCHAR(30) NOT NULL
        CHECK (
            role IN (
                'waiter',
                'chef',
                'bartender'
            )
        ),

    shift VARCHAR(30),

    employee_status VARCHAR(30) NOT NULL
        DEFAULT 'active'
        CHECK (
            employee_status IN (
                'active',
                'inactive'
            )
        ),

    specialty VARCHAR(150)
);


-- ============================================
-- 4. WAITERS
-- ============================================

CREATE TABLE waiters (
    id SERIAL PRIMARY KEY,

    employee_id INTEGER NOT NULL UNIQUE
        REFERENCES employees(id)
        ON DELETE CASCADE
);


-- ============================================
-- 5. CHEFS
-- ============================================

CREATE TABLE chefs (
    id SERIAL PRIMARY KEY,

    employee_id INTEGER NOT NULL UNIQUE
        REFERENCES employees(id)
        ON DELETE CASCADE
);


-- ============================================
-- 6. BARTENDERS
-- ============================================

CREATE TABLE bartenders (
    id SERIAL PRIMARY KEY,

    employee_id INTEGER NOT NULL UNIQUE
        REFERENCES employees(id)
        ON DELETE CASCADE
);


-- ============================================
-- 7. MENU ITEMS
-- ============================================

CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,

    restaurant_id INTEGER NOT NULL
        REFERENCES restaurants(id)
        ON DELETE CASCADE,

    name VARCHAR(150) NOT NULL,

    item_type VARCHAR(30) NOT NULL
        CHECK (
            item_type IN (
                'food',
                'drink'
            )
        ),

    description TEXT,

    price NUMERIC(10,2) NOT NULL
        CHECK (price >= 0),

    preparation_time INTEGER NOT NULL
        CHECK (preparation_time >= 0),

    availability_status VARCHAR(30) NOT NULL
        DEFAULT 'available'
        CHECK (
            availability_status IN (
                'available',
                'unavailable'
            )
        ),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- 8. ORDERS
-- ============================================

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,

    customer_id INTEGER NOT NULL
        REFERENCES customers(id),

    restaurant_id INTEGER NOT NULL
        REFERENCES restaurants(id),

    waiter_id INTEGER
        REFERENCES employees(id),

    chef_id INTEGER
        REFERENCES employees(id),

    bartender_id INTEGER
        REFERENCES employees(id),

    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    order_time TIME DEFAULT CURRENT_TIME,

    order_status VARCHAR(30) NOT NULL
        DEFAULT 'pending'
        CHECK (
            order_status IN (
                'pending',
                'preparing',
                'served',
                'paid'
            )
        ),

    waiting_time INTEGER NOT NULL
        DEFAULT 0
        CHECK (waiting_time >= 0),

    special_request TEXT,

    total_amount NUMERIC(10,2) NOT NULL
        DEFAULT 0
        CHECK (total_amount >= 0),

    served_at TIMESTAMP,

    paid_at TIMESTAMP
);


-- ============================================
-- 9. ORDER ITEMS
-- ============================================

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,

    order_id INTEGER NOT NULL
        REFERENCES orders(id)
        ON DELETE CASCADE,

    menu_item_id INTEGER NOT NULL
        REFERENCES menu_items(id),

    unit_price NUMERIC(10,2) NOT NULL
        CHECK (unit_price >= 0),

    quantity INTEGER NOT NULL
        CHECK (quantity > 0),

    subtotal NUMERIC(10,2) NOT NULL
        CHECK (subtotal >= 0)
);


-- ============================================
-- 10. ORDER PREPARATION
-- ============================================
-- Additional implementation table.
-- Used to track preparation of individual order items.

CREATE TABLE order_preparations (
    id SERIAL PRIMARY KEY,

    order_item_id INTEGER NOT NULL
        REFERENCES order_items(id)
        ON DELETE CASCADE,

    chef_id INTEGER
        REFERENCES employees(id),

    bartender_id INTEGER
        REFERENCES employees(id),

    preparation_status VARCHAR(30) NOT NULL
        DEFAULT 'preparing'
        CHECK (
            preparation_status IN (
                'preparing',
                'completed'
            )
        )
);


-- ============================================
-- 11. COMPLAINTS
-- ============================================

CREATE TABLE complaints (
    id SERIAL PRIMARY KEY,

    order_id INTEGER NOT NULL
        REFERENCES orders(id)
        ON DELETE CASCADE,

    customer_id INTEGER NOT NULL
        REFERENCES customers(id),

    description TEXT NOT NULL,

    complaint_date DATE DEFAULT CURRENT_DATE,

    complaint_time TIME DEFAULT CURRENT_TIME,

    status VARCHAR(30) NOT NULL
        DEFAULT 'submitted'
        CHECK (
            status IN (
                'submitted',
                'resolved'
            )
        )
);


-- ============================================
-- 12. RATINGS
-- ============================================

CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,

    order_id INTEGER NOT NULL
        REFERENCES orders(id)
        ON DELETE CASCADE,

    customer_id INTEGER NOT NULL
        REFERENCES customers(id),

    score INTEGER NOT NULL
        CHECK (score BETWEEN 1 AND 5),

    comment TEXT,

    rating_date DATE DEFAULT CURRENT_DATE
);


-- ============================================
-- 13. PAYMENTS
-- ============================================

-- ==========================================
-- PAYMENTS
-- ==========================================

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,

    order_id INTEGER NOT NULL UNIQUE
        REFERENCES orders(id)
        ON DELETE CASCADE,

    amount NUMERIC(10,2) NOT NULL
        CHECK (amount >= 0),

    payment_method VARCHAR(50) NOT NULL
        DEFAULT 'demo_card',

    payment_status VARCHAR(30) NOT NULL
        DEFAULT 'successful',

    is_demo BOOLEAN NOT NULL
        DEFAULT TRUE,

    payment_date DATE
        DEFAULT CURRENT_DATE
);


-- ============================================
-- 14. USERS
-- ============================================
-- Login is not required by the assignment.
-- This table is retained for possible future use.

CREATE TABLE users (
    id SERIAL PRIMARY KEY,

    email VARCHAR(150) NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    user_role VARCHAR(30) NOT NULL
        CHECK (
            user_role IN (
                'customer',
                'waiter'
            )
        ),

    customer_id INTEGER UNIQUE
        REFERENCES customers(id)
        ON DELETE CASCADE,

    employee_id INTEGER UNIQUE
        REFERENCES employees(id)
        ON DELETE CASCADE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CHECK (
        (
            user_role = 'customer'
            AND customer_id IS NOT NULL
            AND employee_id IS NULL
        )
        OR
        (
            user_role = 'waiter'
            AND employee_id IS NOT NULL
            AND customer_id IS NULL
        )
    )
);


-- ============================================
-- 15. BONUS: ORDER STATUS HISTORY
-- ============================================

CREATE TABLE order_status_history (
    id SERIAL PRIMARY KEY,

    order_id INTEGER NOT NULL
        REFERENCES orders(id)
        ON DELETE CASCADE,

    status VARCHAR(30) NOT NULL
        CHECK (
            status IN (
                'pending',
                'preparing',
                'served',
                'paid'
            )
        ),

    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- 16. BONUS: NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,

    customer_id INTEGER NOT NULL
        REFERENCES customers(id)
        ON DELETE CASCADE,

    order_id INTEGER
        REFERENCES orders(id)
        ON DELETE CASCADE,

    message TEXT NOT NULL,

    notification_type VARCHAR(50) NOT NULL,

    is_read BOOLEAN NOT NULL
        DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- END OF SCHEMA
-- ============================================