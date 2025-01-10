const { Router } = require("express");
const multer = require("multer");
const productCtrl = require("./productController");

const productRouter = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "/app/images");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

productRouter.get("/products", productCtrl.getAllProducts);
productRouter.post("/products", upload.single("img"), productCtrl.addNewProduct);
productRouter.get("/products/:id", productCtrl.searchProductById);
productRouter.get("/products/tsearch/:title", productCtrl.searchProductByTitle);
productRouter.get("/products/usersearch/:username", productCtrl.searchProductByUsername);
productRouter.put("/products/:id", productCtrl.updateProductById);
productRouter.delete("/products/:id", productCtrl.deleteProductById);

module.exports = productRouter;