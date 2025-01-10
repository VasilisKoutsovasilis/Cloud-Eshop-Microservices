const productPool = require("../../productDB");
const fs = require("fs");

// Method to get all the products from the products database
const getAllProducts = (req, res) => {
    productPool.query(`SELECT * FROM products`, (error, results) => {
        if(error)
            throw error;

        res.status(200).send(results.rows);
    });
};

// Method to search for a product based on it's id
const searchProductById = (req, res) => {
    const id = parseInt(req.params.id);
    productPool.query(`SELECT * FROM products WHERE id = $1`, [id], (error, results) => {
        if(error)
            throw error;

        res.status(200).send(results.rows);
    });
};

// Method to search for a product based on it's title ignoring cases
const searchProductByTitle = (req, res) => {
    const title = `%${req.params.title}%`;
    productPool.query(`SELECT * FROM products WHERE LOWER(title) LIKE LOWER($1)`, [title], (error, results) => {
        if(error)
            throw error;

        res.status(200).send(results.rows);
    });
};

// Method to search for products based on the seller username
const searchProductByUsername = (req, res) => {
    const username = `${req.params.username}`;
    productPool.query(`SELECT * FROM products WHERE username = $1`, [username], (error, results) => {
        if(error)
            throw error;

        res.status(200).send(results.rows);
    });
};

// Method to add a new product to the products database
const addNewProduct = (req, res) => {
    const { title, price, quantity, username } = req.body;
    const img = req.file ? `http://localhost:4444/${req.file.path.replace("/app/", "")}` : null;

    productPool.query(`SELECT * FROM products WHERE title = $1`, [title], (error, results) => {
        if(error)
            throw error;

        if(results.rows.length)
            return res.status(300).send(`Product with title ${title} already exists in the database...`);

        productPool.query(`
            INSERT INTO products(title, img, price, quantity, username) 
            VALUES($1, $2, $3, $4, $5)`, [title, img, price, quantity, username], (error, results) => {
                if(error)
                    throw error;

                res.status(201).send("Product Registered Successfully!");
            });
    });
};

// Method to update a specific product's price and quantity in the products database
const updateProductById = (req, res) => {
    const id = parseInt(req.params.id);
    const { price, quantity } = req.body;
    productPool.query(`SELECT * FROM products WHERE id = $1`, [id], (error, results) => {
        if(error)
            throw error;

        if(!results.rows.length)
            return res.status(404).send(`Product with ID:${id} does not exist...`);

        productPool.query(`UPDATE products SET price = $1, quantity = $2 WHERE id =$3`, [price, quantity, id], (error, results) => {
            if(error)
                throw error;

            res.status(202).send(`Product with ID:${id} Updated Successfully!`);
        });
    });
};

// Method to delete a product from the products database
const deleteProductById = (req, res) => {
    const id = parseInt(req.params.id);

    productPool.query(`SELECT * FROM products WHERE id = $1`, [id], (error, results) => {
        if(error)
            throw error;

        if(!results.rows.length)
            return res.status(404).send(`Product with ID:${id} does not exist...`);
        
        const productToDelete = results.rows[0];
        const imagePath = productToDelete.img.replace("http://localhost:4444/images", "/app/images");

        productPool.query(`DELETE FROM products WHERE id = $1`, [id], (error, results) => {
            if(error)
                throw error;

            fs.unlink(imagePath, (unlinkError) => {
                if(unlinkError)
                    console.error("Error deleting image...");
            });
            res.status(200).send(`Product with ID:${id} Deleted successfully!`);
        });
    });
};


/* Method used to check if each of the products in an order have a valid amount value and updates their quantity in
the case that they do. Returns false if any product amount in the order exceeds it's quantity in the database, otherwise true. 
*/
const handleProducts = async (order) => {
    try {
        let newProductQuantities = [];

        for await (let prod of order.products){
            const data = await productPool.query(`SELECT * FROM products WHERE id = $1`, [prod.product_id])
            
            const quantity = parseInt(data.rows[0].quantity);

            if(quantity && quantity < parseInt(prod.amount))
                return false;
            else
                newProductQuantities.push(quantity-parseInt(prod.amount));
        }

        let i = 0;
        for await (let prod of order.products){
            let result = await productPool.query(`UPDATE products SET quantity = $1 WHERE id = $2`, 
                [newProductQuantities[i], prod.product_id]);
            i++;
        }

        return true;
    } catch (error) {
        console.log(error.message);
        throw new Error(error);
    }
    
};

module.exports = {
    getAllProducts,
    addNewProduct,
    searchProductById,
    searchProductByTitle,
    updateProductById,
    deleteProductById,
    handleProducts,
    searchProductByUsername,
};