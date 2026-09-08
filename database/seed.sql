-- ============================================
-- CHOWLY DATABASE SEED DATA
-- ============================================

-- ============================================
-- 1. RESTAURANTS
-- ============================================

INSERT INTO restaurants
(
    id,
    name,
    address,
    phone_number,
    email,
    opening_hour,
    opening_days,
    restaurant_status
)
VALUES
(
    1,
    'Bamboo Lounge',
    '19 Ikotun Road Lagos',
    '01-2793045',
    'contact@bamboolounge.com',
    '10:00 AM - 10:00 PM',
    'Monday - Sunday',
    'active'
),
(
    2,
    'Rubels & Angels',
    '12 Iganmu',
    '01-4610238',
    'hello@randa.com',
    '10:00 AM - 10:00 PM',
    'Monday - Sunday',
    'active'
),
(
    3,
    'Ego''s Kitchen',
    '56 Isolo Way Lagos',
    '01-7325916',
    'info@egokitchen.org',
    '10:00 AM - 10:00 PM',
    'Monday - Sunday',
    'active'
),
(
    4,
    'ThePlace',
    '13 Apapa Road Lagos',
    '01-5482170',
    'hello@theplace.com',
    '10:00 AM - 10:00 PM',
    'Monday - Sunday',
    'active'
),
(
    5,
    'Chicken Republic',
    '99 Airport Road Lagos',
    '01-3956724',
    'info@checkinrep.org',
    '10:00 AM - 10:00 PM',
    'Monday - Sunday',
    'active'
);


-- ============================================
-- 2. CUSTOMERS
-- ============================================

INSERT INTO customers
(
    id,
    first_name,
    last_name,
    phone_number,
    email,
    date_registered,
    customer_status
)
VALUES
(
    1,
    'Alimat',
    'Amodu',
    '08011223344',
    'aamodu@gmail.com',
    CURRENT_DATE,
    'active'
),
(
    2,
    'Bimbo',
    'Joseph',
    '08112345789',
    'bimboj@gmail.com',
    CURRENT_DATE,
    'active'
),
(
    3,
    'Alyson',
    'Gabriel',
    '09122233379',
    'alygabriel@yahoo.com',
    CURRENT_DATE,
    'active'
),
(
    4,
    'Joseph',
    'Williams',
    '07098790112',
    'jwilliams001@yahoo.com',
    CURRENT_DATE,
    'active'
),
(
    5,
    'Anthony',
    'Joshua',
    '08134425908',
    'anthonyjosh@gmail.com',
    CURRENT_DATE,
    'active'
);


-- ============================================
-- 3. EMPLOYEES
-- ============================================

INSERT INTO employees
(
    id,
    restaurant_id,
    first_name,
    last_name,
    phone_number,
    email,
    role,
    shift,
    employee_status,
    specialty
)
VALUES
(
    1,
    1,
    'Chinedu',
    'Obi',
    '08030000001',
    'chinedu.obi@chowly.com',
    'waiter',
    'Morning',
    'active',
    NULL
),
(
    2,
    1,
    'Amaka',
    'Eze',
    '08030000002',
    'amaka.eze@chowly.com',
    'waiter',
    'Evening',
    'active',
    NULL
),
(
    3,
    1,
    'Daniel',
    'Okafor',
    '08030000003',
    'daniel.okafor@chowly.com',
    'chef',
    'Morning',
    'active',
    'Grill'
),
(
    4,
    1,
    'Sarah',
    'Williams',
    '08030000004',
    'sarah.williams@chowly.com',
    'chef',
    'Evening',
    'active',
    'Continental'
),
(
    5,
    1,
    'Michael',
    'Adeyemi',
    '08030000005',
    'michael.adeyemi@chowly.com',
    'chef',
    'Morning',
    'active',
    'Nigerian Cuisine'
),
(
    6,
    1,
    'Grace',
    'Johnson',
    '08030000006',
    'grace.johnson@chowly.com',
    'bartender',
    'Morning',
    'active',
    'Cocktails'
),
(
    7,
    1,
    'David',
    'Brown',
    '08030000007',
    'david.brown@chowly.com',
    'bartender',
    'Evening',
    'active',
    'Juices'
),
(
    8,
    1,
    'Aisha',
    'Mohammed',
    '08030000008',
    'aisha.mohammed@chowly.com',
    'bartender',
    'Morning',
    'active',
    'Smoothies'
);


-- ============================================
-- 4. WAITERS
-- ============================================

INSERT INTO waiters
(
    employee_id
)
SELECT id
FROM employees
WHERE role = 'waiter'
AND restaurant_id = 1
AND id NOT IN
(
    SELECT employee_id
    FROM waiters
);


-- ============================================
-- 5. CHEFS
-- ============================================

INSERT INTO chefs
(
    employee_id
)
SELECT id
FROM employees
WHERE role = 'chef'
AND restaurant_id = 1
AND id NOT IN
(
    SELECT employee_id
    FROM chefs
);


-- ============================================
-- 6. BARTENDERS
-- ============================================

INSERT INTO bartenders
(
    employee_id
)
SELECT id
FROM employees
WHERE role = 'bartender'
AND restaurant_id = 1
AND id NOT IN
(
    SELECT employee_id
    FROM bartenders
);


-- ============================================
-- 7. MENU ITEMS
-- ============================================

INSERT INTO menu_items
(
    restaurant_id,
    name,
    item_type,
    description,
    price,
    preparation_time,
    availability_status
)
VALUES
(
    1,
    'FinFish',
    'food',
    'Freshly prepared fish meal',
    45000,
    30,
    'available'
),
(
    1,
    'Redwine',
    'drink',
    'Premium red wine',
    25000,
    5,
    'available'
),
(
    1,
    'Grilled Chicken',
    'food',
    'Tender grilled chicken',
    6500,
    25,
    'available'
),
(
    1,
    'Chicken Wings',
    'food',
    'Crispy chicken wings',
    5500,
    25,
    'available'
),
(
    1,
    'Beef Burger',
    'food',
    'Juicy beef burger with fresh vegetables',
    6000,
    20,
    'available'
),
(
    1,
    'Pasta Alfredo',
    'food',
    'Creamy Alfredo pasta',
    7000,
    25,
    'available'
),
(
    1,
    'Fried Rice & Chicken',
    'food',
    'Fried rice served with chicken',
    5500,
    20,
    'available'
),
(
    1,
    'Chapman',
    'drink',
    'Refreshing Nigerian Chapman drink',
    2500,
    5,
    'available'
),
(
    1,
    'Fresh Orange Juice',
    'drink',
    'Freshly squeezed orange juice',
    2000,
    5,
    'available'
),
(
    1,
    'Strawberry Smoothie',
    'drink',
    'Fresh strawberry smoothie',
    3500,
    8,
    'available'
),
(
    1,
    'Bottled Water',
    'drink',
    'Chilled bottled water',
    1000,
    2,
    'available'
),
(
    2,
    'Amala & Ewedu',
    'food',
    'Traditional Nigerian Amala and Ewedu',
    13500,
    25,
    'available'
),
(
    2,
    'Redwine',
    'drink',
    'Premium red wine',
    45000,
    5,
    'available'
),
(
    3,
    'Carbonara',
    'food',
    'Creamy Italian pasta',
    87000,
    30,
    'available'
),
(
    3,
    'Cocktail',
    'drink',
    'Freshly prepared cocktail',
    36000,
    10,
    'available'
),
(
    4,
    'Beef Suya',
    'food',
    'Spicy Nigerian beef suya',
    28000,
    20,
    'available'
),
(
    4,
    'Zobo Drink',
    'drink',
    'Refreshing hibiscus drink',
    15000,
    5,
    'available'
),
(
    5,
    'Jollof Rice & Chicken',
    'food',
    'Nigerian jollof rice served with chicken',
    32000,
    25,
    'available'
),
(
    5,
    'Chapman',
    'drink',
    'Classic Nigerian Chapman',
    20000,
    5,
    'available'
);


-- ============================================
-- 8. RESET SEQUENCES
-- ============================================

SELECT setval(
    pg_get_serial_sequence('restaurants', 'id'),
    COALESCE((SELECT MAX(id) FROM restaurants), 1),
    true
);

SELECT setval(
    pg_get_serial_sequence('customers', 'id'),
    COALESCE((SELECT MAX(id) FROM customers), 1),
    true
);

SELECT setval(
    pg_get_serial_sequence('employees', 'id'),
    COALESCE((SELECT MAX(id) FROM employees), 1),
    true
);

SELECT setval(
    pg_get_serial_sequence('menu_items', 'id'),
    COALESCE((SELECT MAX(id) FROM menu_items), 1),
    true
);