import { Sequelize } from "sequelize";
import {Op} from "sequelize";
import User from "../models/UserModel.js";
import Review from "../models/ReviewModel.js";
import Checkout from "../models/CheckoutModel.js";
import db from "../config/Database.js";
import Product from "../models/ProuctModel.js";

export const getAllReview = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';

        const whereCondition = search
        ? {
              [Op.or]: [
                  { content: { [Op.like]: `%${search}%` } },
                  { rating: { [Op.like]: `%${search}%` } }
              ]
          }
        : {};

        const totalItems = await Review.count({where: whereCondition});
        const totalPages = Math.ceil(totalItems / limit);

        const reviews = await Review.findAll({
            limit: limit,
            offset: offset,
            where: whereCondition
        });

        if (reviews.length === 0) {
            return res.status(200).json({
                message: 'No review found'
            });
        }

        res.status(200).json({
            data: reviews,
            pagination: {
                totalItems: totalItems,
                totalPages: totalPages,
                currentPage: page,
                pageSize: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const getReview = async (req, res) => {
    try {
        const response = await Review.findAll({
            where: { user_id: req.userId },
            include: [{ model: Checkout }]
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const getReviewById = async (req, res) => {
    try {
        const response = await Review.findOne({
            where: {
                id: req.params.id
            }
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const createReview = async (req, res) => {
    const { user_id, content, rating, checkout_id, product_id } = req.body;

    try {
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        const checkout = await Checkout.findByPk(checkout_id);
        if (!checkout) {
            return res.status(404).json({ msg: "Checkout not found" });
        }

        const product = await Product.findByPk(product_id);
        if (!product) {
            return res.status(404).json({ msg: "Product not found" });
        }

        const newReview = await Review.create({
            user_id,
            content,
            rating,
            checkout_id,
            product_id,
        });

        res.status(201).json(newReview);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}