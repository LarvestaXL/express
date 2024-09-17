import Cart from "../models/CartModel.js";
import Product from "../models/ProuctModel.js"; 
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import upload from "../config/Multer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getCart = async (req, res) => {
    try {
        const response = await Cart.findAll({
            where: { user_id: req.userId },
            include: [{ model: Product }]
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const getCartById = async (req, res) => {
    try {
        const response = await Cart.findOne({
            where: {
                id: req.params.id,
                user_id: req.userId
            },
            include: [{ model: Product }]
        });
        if (!response) {
            return res.status(404).json({ msg: 'Cart item not found or you do not have access to this cart item' });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status500().json({ msg: error.message });
    }
}

export const createCart = async (req, res) => {
    const { product_id } = req.body;

    try {
        const product = await Product.findOne({ where: { id: product_id } });

        if (!product) return res.status(404).json({ msg: "Product not found" });

        await Cart.create({
            product_id: product.id,
            user_id: req.userId,
            gambar: product.gambar,
            nama_barang: product.nama_barang,
            harga: product.harga
        });

        res.status(201).json({ msg: 'Product added to cart' });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const createCartWithUpload = [
    upload.single('gambar'),
    createCart
];

export const deleteCart = async (req, res) => {
    if (!req.params.id) {
        return res.status(400).json({ msg: "ID is required" });
    }

    try {
        const cartItem = await Cart.findOne({
            where: {
                id: req.params.id,
                user_id: req.userId 
            }
        });

        if (!cartItem) return res.status(404).json({ msg: "Cart item not found" });

        const sameCartItems = await Cart.findAll({
            where: {
                product_id: cartItem.product_id,
                user_id: req.userId
            }
        });

        await Cart.destroy({
            where: {
                id: cartItem.id
            }
        });
        if (sameCartItems.length === 1 && cartItem.gambar) {
            const oldPath = path.join(__dirname, '../uploads', cartItem.gambar);
            fs.unlink(oldPath, (err) => {
                if (err) {
                    console.error(err);
                }
            });
        }

        res.status(200).json({ msg: "Cart item deleted" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}
