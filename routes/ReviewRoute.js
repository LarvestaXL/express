import express from "express";
import {
    getAllReview,
    getReview,
    getReviewById,
    createReview
} from "../controller/ReviewController.js"
import { verifyToken } from "../midleware/AuthUsers.js";


const router = express.Router();

router.get('/review',verifyToken, getReview);
router.get('/get-all-review', getAllReview);
router.get('/review/:id',verifyToken, getReviewById);
router.post('/review',verifyToken, createReview);


export default router;