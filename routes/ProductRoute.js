import express from "express";
import multer from "multer";
import {
    getProduct,
    getProductById,
    createProducts,
    updateProducts,deleteProduct,
    getProductCountByCategory 
} from "../controller/ProductController.js";
import { verifyToken, adminOnly } from "../midleware/AuthUsers.js";

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // path tersimpan e gambar 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

router.get('/products', getProduct);
router.get('/products/:id', getProductById);
router.post('/products', upload.single('gambar'), createProducts);
router.patch('/products/:id', upload.single('gambar'), updateProducts);
router.delete('/products/:id', deleteProduct);

router.get('/dashboard', getProductCountByCategory);

export default router;
