import { Sequelize } from 'sequelize';
import { Op } from 'sequelize';
import { or } from 'sequelize';
import Checkout from "../models/CheckoutModel.js";
import Cart from "../models/CartModel.js";
import Product from "../models/ProuctModel.js";
import User from "../models/UserModel.js";
import db from '../config/Database.js';

export const getAllCheckout = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';

        const whereCondition = search
        ? {
              [Op.or]: [
                  { email: { [Op.like]: `%${search}%` } },
                  { first_name: { [Op.like]: `%${search}%` } },
                  { last_name: { [Op.like]: `%${search}%` } },
                  { address: { [Op.like]: `%${search}%` } },
                  { city: { [Op.like]: `%${search}%` } },
                  { total_harga: { [Op.like]: `%${search}%` } },
              ]
          }
        : {};

        const totalItems = await Checkout.count({ where: whereCondition });
        const totalPages = Math.ceil(totalItems / limit);

        const checkouts = await Checkout.findAll({
            limit: limit,
            offset: offset,
            where: whereCondition
        });

        if (checkouts.length === 0) {
            return res.status(200).json({
                message: 'No data found'
            });
        }

        res.status(200).json({
            data: checkouts,
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

export const getCheckout = async (req, res) => {
    try {
        const response = await Checkout.findAll({
            where: { user_id: req.userId },
            include: [{ model: Cart }]
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

export const getCheckoutById = async (req, res) => {
    try {
        const response = await Checkout.findOne({
            where: {
                id: req.params.id
            }
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

export const createCheckout = async (req, res) => {
    const {
        email, first_name, last_name, address, apartmen, city, province, postal_code, payment_number, user_id
    } = req.body;

    const transaction = await db.transaction();

    try {
        const cartItems = await Cart.findAll({
            where: { user_id },
            include: [{ model: Product }],
            transaction
        });

        if (!cartItems.length) {
            await transaction.rollback();
            return res.status(400).json({ msg: "Cart is empty" });
        }

        const checkoutPromises = cartItems.map(async (item) => {
            if (!item.product) {
                throw new Error(`Product with id ${item.product_id} not found`);
            }

            await Checkout.create({
                email,
                first_name,
                last_name,
                address,
                apartmen,
                city,
                province,
                postal_code,
                payment_number,
                user_id,
                product_id: item.product_id,
                cart_id: item.id, // Automatically populated from the Cart item
                total_harga: item.product.harga
            }, { transaction });
        });

        await Promise.all(checkoutPromises);

        await transaction.commit();
        res.status(201).json({ msg: "Checkout successful" });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ msg: error.message });
    }
}