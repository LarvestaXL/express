import express from "express";
import { getCart,
        getCartById,
        createCart,
        deleteCart,
        createCartWithUpload
} from "../controller/CartController.js"
import { verifyToken } from "../midleware/AuthUsers.js";
import multer from 'multer';

const router = express.Router();

router.post('/cart', verifyToken, createCart, createCartWithUpload);
router.delete('/cart/:id', verifyToken, deleteCart);
router.get('/cart', verifyToken, getCart);
router.get('/cart/:id', verifyToken, getCartById);

export default router;