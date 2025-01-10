-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    total_price BIGINT,
    status VARCHAR(10),
    username VARCHAR(255)
);

-- Create order_products table
CREATE TABLE IF NOT EXISTS order_products (
    order_product_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    product_title VARCHAR(255),
    amount INT,
    product_id INT
);