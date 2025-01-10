const ProductPool = require('pg').Pool;

// For local use without docker
/*const productPool = new ProductPool({
    user: "admin",
    host: "localhost",
    database: "product_db",
    password: "admin",
    port: 6666
});*/

const productPool = new ProductPool({
    user: "admin",
    host: "product_db",
    database: "product_db",
    password: "admin",
    port: 5432
});

module.exports = productPool;