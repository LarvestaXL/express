import express from "express";
import multer from "multer";
import {
    getCategories,
    getCategoriesById,
    createCategories,
    updateCategories,
    deleteCategories
} from "../controller/CategoryController.js";
import { verifyToken, adminOnly } from "../midleware/AuthUsers.js";

const router = express.Router();

//  multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Path where the files will be saved
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.get('/categories', getCategories);
router.get('/categories/:id', getCategoriesById);
router.post('/categories', upload.single('gambar'), createCategories);
router.patch('/categories/:id', upload.single('gambar'), updateCategories);
router.delete('/categories/:id', deleteCategories);

export default router;
