import User from "../models/UserModel.js";
import argon2 from "argon2";
import { Op } from "sequelize";

export const getAll = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        const whereCondition = search
        ? {
              [Op.or]: [
                  { name: { [Op.like]: `%${search}%` } },
                  { username: { [Op.like]: `%${search}%` } },
                  { email: { [Op.like]: `%${search}%` } },
                  { role: { [Op.like]: `%${search}%` } },
              ]
          }
        : {};

        const totalItems = await User.count({ where: whereCondition });
        const totalPages = Math.ceil(totalItems / limit);

        const users = await User.findAll({
            where: whereCondition,
            limit: limit,
            offset: offset
        });

        if (users.length === 0) {
            return res.status(200).json({
                message: 'No users found'
            });
        }

        res.status(200).json({
            data: users,
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

export const getUser = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        const whereCondition = {
            role: { [Op.ne]: 'admin' },
            ...(search && {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { username: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } },
                ]
            })
        };

        const totalItems = await User.count({ where: whereCondition });
        const totalPages = Math.ceil(totalItems / limit);

        const users = await User.findAll({
            where: whereCondition,
            limit: limit,
            offset: offset
        });

        if (users.length === 0) {
            return res.status(200).json({
                message: 'No users found'
            });
        }

        res.status(200).json({
            data: users,
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

export const getAdmin = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        const whereCondition = {
            role: { [Op.ne]: 'user' },
            ...(search && {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { username: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } },
                    { role: { [Op.like]: `%${search}%` } }
                ]
            })
        };

        const totalItems = await User.count({ where: whereCondition });
        const totalPages = Math.ceil(totalItems / limit);

        const admins = await User.findAll({
            where: whereCondition,
            limit: limit,
            offset: offset
        });

        if (admins.length === 0) {
            return res.status(200).json({
                message: 'No admins found'
            });
        }

        res.status(200).json({
            data: admins,
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

export const getById = async (req, res) => {
    try {
        const response = await User.findOne({
            where: {
                id: req.params.id
            }
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const registerUser = async (req, res) => {
    const { name, username, email, no_hp, password, confPassword } = req.body;
    if (password !== confPassword) return res.status(400).json({ msg: "Password dan konfirmasi password tidak cocok" });
    const hashedPassword = await argon2.hash(password);
    try {
        await User.create({
            name: name,
            username: username,
            email: email,
            no_hp: no_hp,
            password: hashedPassword,
            role: 'user'
        });
        res.status(201).json({ msg: "Register berhasil" });
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
}

export const registerAdmin = async (req, res) => {
    const { name, username, email, no_hp, password, confPassword } = req.body;
    if (password !== confPassword) return res.status(400).json({ msg: "Password dan konfirmasi password tidak cocok" });
    const hashedPassword = await argon2.hash(password);
    try {
        await User.create({
            name: name,
            username: username,
            email: email,
            no_hp: no_hp,
            password: hashedPassword,
            role: 'admin'
        });
        res.status(201).json({ msg: "Register berhasil" });
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
}

export const updateUser = async (req, res) => {
    const user = await User.findOne({
        where: {
            id: req.params.id
        }
    });
    if (!user || user.role !== 'user') return res.status(404).json({ msg: "User tidak ditemukan" });

    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });
    const { name, username, email, no_hp, password, confPassword, role } = req.body;
    let hashedPassword;
    if (password === "" || password === null) {
        hashedPassword = user.password;
    } else {
        hashedPassword = await argon2.hash(password);
    }
    if (password !== confPassword) return res.status(400).json({ msg: "Password dan konfirmasi password tidak cocok" });
    try {
        await User.update({
            name: name,
            username: username,
            email: email,
            no_hp: no_hp,
            password: hashedPassword,
            role: role
        }, {
            where: {
                id: user.id
            }
        });
        res.status(200).json({ msg: "Update berhasil" });
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
}

export const deleteUser = async (req, res) => {
    const user = await User.findOne({
        where: {
            id: req.params.id
        }
    });
    if (!user || user.role !== 'user') return res.status(404).json({ msg: "User tidak ditemukan" });

    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });
    try {
        await User.destroy({
            where: {
                id: user.id
            }
        });
        res.status(200).json({ msg: "User deleted" });
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
}

export const deleteAdmin = async (req, res) => {
    const user = await User.findOne({
        where: {
            id: req.params.id
        }
    });
    if (!user || user.role !== 'admin') return res.status(404).json({ msg: "Admin tidak ditemukan" });

    if (!user) return res.status(404).json({ msg: "Admin tidak ditemukan" });
    try {
        await User.destroy({
            where: {
                id: user.id
            }
        });
        res.status(200).json({ msg: "Admin deleted" });
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
}
