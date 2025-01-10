const OrderPool = require("pg").Pool;

// For local use without docker
/*const orderPool = new OrderPool({
    user: "admin",
    host: "localhost",
    database: "order_db",
    password: "admin",
    port: 5555
});*/

const orderPool = new OrderPool({
    user: "admin",
    host: "order_db",
    database: "order_db",
    password: "admin",
    port: 5432
});

module.exports = orderPool;