-- Create products table
CREATE TABLE IF NOT EXISTS products(
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    img TEXT,
    price BIGINT,
    quantity BIGINT,
    username VARCHAR(255)
);

-- Insert a few products into the products database if it is empty
INSERT INTO products (title, img, price, quantity, username)
SELECT * FROM (VALUES
    ('Android Smartphone', 'https://www.pngitem.com/pimgs/m/110-1106205_smartphone-png-free-images-smartphone-png-transparent-png.png', 250, 60, 'steve'),
    ('IOS Smartphone', 'https://atlas-content-cdn.pixelsquid.com/assets_v2/296/2962610729624016433/jpeg-600/G03.jpg?modifiedAt=1', 285, 70, 'steve'),
    ('Smart-Watch Black', 'https://png.pngtree.com/png-vector/20240202/ourmid/pngtree-smart-watch-electronic-device-3d-illustration-png-image_11589741.png', 53, 80, 'steve'),
    ('Smart-Watch White', 'https://w7.pngwing.com/pngs/842/836/png-transparent-apple-watch-series-3-apple-watch-series-2-mockup-s-watch-strap-electronics-gadget-apple-watch.png', 55, 80, 'steve'),
    ('Earbuds Blue', 'https://png.pngtree.com/png-vector/20240603/ourmid/pngtree-earbuds-in-a-blue-container-on-transparent-background-png-image_12605698.png', 30, 80,'mary'),
    ('Earbuds Black', 'https://png.pngtree.com/png-vector/20240815/ourmid/pngtree-black-wireless-earbuds-in-charging-case---clipart-illustration-png-image_13492239.png', 35, 80, 'mary'),
    ('Headphones Black', 'https://pngimg.com/d/headphones_PNG101980.png', 150, 90,'mary'),
    ('Casual Mouse', 'https://www.transparentpng.com/thumb/computer-mouse/PZx3o8-computer-mouse-transparent.png', 30, 120, 'mary'),
    ('Gaming Mouse', 'https://www.pngplay.com/wp-content/uploads/2/Gaming-Pc-Mouse-Transparent-Background.png', 80, 100, 'steve'),
    ('1TB HDD', 'https://pngimg.com/uploads/hard_disc/Hard%20disc%20PNG,%20hard%20drive%20PNG%20images%20free%20download,%20HDD%20PNG_PNG12047.png', 75, 90, 'mary')
) AS tmp (title, img, price, quantity, username)
WHERE NOT EXISTS (SELECT 1 FROM products);