const orderPool = require("../../orderDB");
const kafka = require("./orderKafka");

/* Method to get all the orders from the order database.Returns them as 
an array of objects with format: [{id, products: [{title1, amount, prod_id},...],totalPrice, status},...]
 */
const getAllOrders = async(req, res) => {
    try {
        const orderResults = await orderPool.query("SELECT * FROM orders");

        let finalOrders = [];

        for(let order of orderResults.rows){
            const { id, total_price, status, username } = order;

            const productResults = await orderPool.query(`SELECT product_title, amount, product_id
                                                        FROM order_products
                                                        WHERE order_id = $1`, [id]);
            
            const orderProducts = productResults.rows.map(x => ({
                title: x.product_title,
                amount: x.amount,
                product_id: x.product_id
            }));

            finalOrders.push({
                id: id,
                products: orderProducts,
                total_price: total_price,
                status: status,
                username: username
            });
        }

        res.status(200).json(finalOrders);

    } catch (error) {
        res.status(500).send("Error fetching data");
    }
};

/* Method to get all the orders associated with a specific username from the order database.Returns them as 
an array of objects with format: [{id, products: [{title1, amount, prod_id},...],totalPrice, status, username},...]
 */
const getOrdersByUsername = async(req, res) => {
    const username = `${req.params.username}`;

    try {
        const orderResults = await orderPool.query(`SELECT * FROM orders WHERE username = $1`, [username]);

        let finalOrders = [];

        for(let order of orderResults.rows){
            const { id, total_price, status, username } = order;

            const productResults = await orderPool.query(`SELECT product_title, amount, product_id
                                                        FROM order_products
                                                        WHERE order_id = $1`, [id]);
            
            const orderProducts = productResults.rows.map(x => ({
                title: x.product_title,
                amount: x.amount,
                product_id: x.product_id
            }));

            finalOrders.push({
                id: id,
                products: orderProducts,
                total_price: total_price,
                status: status,
                username: username
            });
        }

        res.status(200).json(finalOrders);
    } catch (error) {
        res.status(500).send("Error fetching data...");
    }
};

// Method to add a new order to the order database
const addNewOrder = async (req, res) => {
    try {
        const { products, total_price, status, username } = req.body;

        await orderPool.query(`INSERT INTO orders (total_price, status, username) VALUES ($1, $2, $3)`, [total_price, status, username]);

        const newOrderId = (await orderPool.query(`SELECT id FROM orders ORDER BY id DESC LIMIT 1`)).rows[0]?.id;
        
        const query = `
        INSERT INTO order_products (order_id, product_title, amount, product_id)
        VALUES ${products.map((_, index) => `($${index*4 + 1}, $${index*4+2}, $${index*4+3}, $${index*4 + 4})`).join(', ')}`;

        const values = products.flatMap(x => [newOrderId, x.title, x.amount, x.product_id]);

        orderPool.query(query, values, (error, results) => {
            if(error)
                throw error;

            res.status(201).send("Order successfully added!");
            const orderMsg = {
                id: newOrderId,
                products: products
            }
            kafka.sendOrders(orderMsg);
        })
    } catch (error) {
        res.status(500).send("Error while adding new order");
    }
    
};

module.exports = {
    getAllOrders,
    addNewOrder,
    getOrdersByUsername,
};
