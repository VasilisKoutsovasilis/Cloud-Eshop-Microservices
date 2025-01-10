const express = require("express");
const cors = require("cors");
const orderRoutes = require("./src/order/orderRoutes");
const app = express();

const port = 3333;

app.use(cors());
app.use(express.json());
app.use("/api", orderRoutes);

app.get("/", (req, res) => {
    res.send("Server up...");
});

app.listen(port, () => console.log(`Order Server listening on port ${port}`));

