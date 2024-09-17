import Product from "../models/ProuctModel.js";
import Category from "../models/CategoryModel.js";
import db from "../config/Database.js";
import { Op } from "sequelize";
import { or } from "sequelize";
import { fileURLToPath } from 'url';
import upload from "../config/Multer.js";
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getProduct = async (req, res) => {
    try {
        const search = req.query.search || '';

        const whereCondition = search
        ? {
              [Op.or]: [
                  { nama_barang: { [Op.like]: `%${search}%` } },
                  { deskripsi: { [Op.like]: `%${search}%` } },
                  { warna: { [Op.like]: `%${search}%` } },
                  { ukuran: { [Op.like]: `%${search}%` } },
                  { tags: { [Op.like]: `%${search}%` } },
                  { bahan: { [Op.like]: `%${search}%` } },
              ]
          }
        : {};

        const products = await Product.findAll({
            where: whereCondition
        });

        if (products.length === 0) {
            return res.status(200).json({
                message: 'No products found'
            });
        }

        res.status(200).json({
            data: products
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const getProductById = async(req,res)=> {
    try {
        const response = await Product.findOne({
            where: {
                id: req.params.id
            }
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const createProducts = async (req, res) => {
    const { category_id, nama_barang, deskripsi, harga, diskon, bahan, tags, sku, ukuran, warna } = req.body;
    const  gambar = req.file ? req.file.filename : null; // Ambil nama file gambar dari multer

    try {
        await Product.create({
            category_id: category_id,
            nama_barang: nama_barang,
            gambar: gambar,
            deskripsi: deskripsi,
            harga: harga,
            diskon: diskon,
            bahan: bahan,            
            tags: tags,            
            sku: sku,            
            ukuran: ukuran,            
            warna: warna,            

        });
        res.status(201).json({ msg: 'Product Created' });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

// Middleware to handle file upload in the request
export const createProductsWithUpload = [
    upload.single('gambar'),
    createProducts
];

export const updateProducts = async (req, res) => {
    try {
        const product = await Product.findOne({
            where: {
                id: req.params.id
            }
        });

        if (!product) {
            return res.status(404).json({ msg: "Product not found" });
        }

        const { category_id, nama_barang, deskripsi, harga, diskon, bahan, tags, sku, ukuran, warna } = req.body;
        const updatedData = { category_id, nama_barang, deskripsi, harga, diskon, bahan, tags, sku, ukuran, warna };

        if (req.file) {
            // Hapus gambar lama jika ada
            if (product.gambar) {
                const oldPath = path.join(__dirname, '../uploads', product.gambar);
                fs.unlink(oldPath, (err) => {
                    if (err) {
                        console.error(err);
                    }
                });
            }
            updatedData.gambar = req.file.filename;
        }

        await Product.update(updatedData, {
            where: {
                id: product.id
            }
        });

        res.status(200).json({ msg: "Product Updated" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const updateProductsWithUpload = [
    upload.single('gambar'),
    updateProducts
];

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findOne({
            where: {
                id: req.params.id
            }
        });

        if (!product) return res.status(404).json({ msg: "Data not found" });
        
        const response = 
        await Product.destroy({
                where: {
                    id: product.id
                }
            });
        // Hapus gambar jika ada
        if (product.gambar) {
            const oldPath = path.join(__dirname, '../uploads', product.gambar);
            fs.unlink(oldPath, (err) => {
                if (err) {
                    console.error(err);
                }
            });
        }

         else {
            if (req.userId !== product.userId) return res.status(403).json({ msg: "Forbidden" });
            await Product.destroy({
                where: {
                    [Op.and]: [{ id: product.id }]
                }
            });
        }

        res.status(200).json({ msg: "Product Deleted" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const getProductCountByCategory = async (req, res) => {
    try {
        const productCounts = await Product.findAll({
            attributes: [
                'category_id',
                [db.fn('COUNT', db.col('products.id')), 'product_count']
            ],
            group: ['category_id'],
            include: [{
                model: Category,
                attributes: ['nama_kategori'],
                as: 'category'
            }]
        });

        const result = {};
        
        productCounts.forEach(pc => {
            const categoryName = pc.category?.nama_kategori?.toLowerCase();
            const productCount = parseInt(pc.dataValues.product_count);

            if (categoryName) {
                result[categoryName] = productCount;
            }
        });

        res.status(200).json(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ msg: error.message });
    }
}
