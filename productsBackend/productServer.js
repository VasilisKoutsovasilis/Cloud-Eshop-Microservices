const express = require("express");
const cors = require("cors");
const productRoutes = require("./src/product/productRoutes");

const app = express();

const port = 4444;

app.use(cors());
app.use(express.json());
app.use('/images', express.static('/app/images'));
app.use('/api', productRoutes);

const kafka = require("./src/product/productKafka");

app.get("/", (req, res) => {
    console.log("Server up...");
});

app.listen(port, () => console.log(`Product Server listening on port ${port}`));