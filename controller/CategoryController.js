import Category from "../models/CategoryModel.js";
import { Op } from "sequelize";
import { fileURLToPath } from 'url';
import upload from "../config/Multer.js";
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const getCategories = async (req, res) => {
    try {
        const response = await Category.findAll();
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const getCategoriesById = async (req, res) => {
    try {
        const response = await Category.findOne({
            where: {
                id: req.params.id
            }
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const createCategories = async (req, res) => {
    const { nama_kategori, deskripsi } = req.body;
    const gambar = req.file ? req.file.filename : null; // Ambil nama file gambar dari multer

    try {
        await Category.create({
            nama_kategori: nama_kategori,
            deskripsi: deskripsi,
            gambar: gambar,
        });
        res.status(201).json({ msg: 'Category Created' });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

// Middleware to handle file upload in the request
export const createCategoriesWithUpload = [
    upload.single('gambar'),
    createCategories
];

export const updateCategories = async (req, res) => {
    try {
        const category = await Category.findOne({
            where: {
                id: req.params.id 
            }
        });

        if (!category) {
            return res.status(404).json({ msg: "Category not found" });
        }

        const { nama_kategori, deskripsi, gambar } = req.body;
        const updatedData = { nama_kategori, deskripsi, gambar };

          if (req.file) {
            // Hapus gambar lama jika ada
            if (category.gambar) {
                const oldPath = path.join(__dirname, '../uploads', category.gambar);
                fs.unlink(oldPath, (err) => {
                    if (err) {
                        console.error(err);
                    }
                });
            }
            updatedData.gambar = req.file.filename;
        }

        if (req.role === "admin") {
            await Category.update(updatedData, {
                where: {
                    id: category.id
                }
            });
        } else {
            
            if (req.userId !== category.userId) {
                return res.status(403).json({ msg: "Forbidden. You are not authorized to update this category." });
            }
            await Category.update(updatedData, {
                where: {
                    [Op.and]: [{ id: category.id }]
                }
            });
        }

        res.status(200).json({ msg: "Category Updated" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const updateCategoriesWithUpload = [
    upload.single('gambar'),
    updateCategories
];


export const deleteCategories = async (req, res) => {
    try {
        const category = await Category.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!category) return res.status(404).json({ msg: "Data not found" });

         // Hapus gambar jika ada
         if (category.gambar) {
            const oldPath = path.join(__dirname, '../uploads', category.gambar);
            fs.unlink(oldPath, (err) => {
                if (err) {
                    console.error(err);
                }
            });
        }

        if (req.role === "admin") {
            await Category.destroy({
                where: {
                    id: category.id
                }
            });
        } else {
            if (req.userId !== category.userId) return res.status(403).json({ msg: "Forbidden" });
            await Category.destroy({
                where: {
                    [Op.and]: [{ id: category.id }]
                }
            });
        }

        res.status(200).json({ msg: "Category Deleted" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}
