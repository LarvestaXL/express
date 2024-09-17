import User from "../models/UserModel.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import db from "../config/Database.js";


export const loginUser = async (req, res) => {
    try {
        const user = await User.findOne({
            where: {
                email: req.body.email
            }
        });
        if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

        const match = await argon2.verify(user.password, req.body.password);
        if (!match) return res.status(400).json({ msg: "Password Salah" });

        const accessToken = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1h' }
        );

        await db.query('INSERT INTO valid_tokens (token, user_id) VALUES (:token, :userId)', {
            replacements: { token: accessToken, userId: user.id }
        });

        res.status(200).json({ accessToken });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const loginAdmin = async (req, res) => {
    try {
        const user = await User.findOne({
            where: {
                email: req.body.email,
                role: "admin"
            }
        });
        if (!user || user.role !== 'admin') return res.status(404).json({ msg: "Akses Terlarang" });
        if (!user) return res.status(404).json({ msg: "Admin tidak ditemukan" });
        const match = await argon2.verify(user.password, req.body.password);
        if (!match) return res.status(400).json({ msg: "Password Salah" });

        const adminId = user.id;
        const accessToken = jwt.sign({ userId: user.id, adminId: adminId, id: user.id , role: user.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })

         await db.query('INSERT INTO valid_tokens (token, user_id) VALUES (:token, :userId)', {
            replacements: { token: accessToken, userId: user.id }
        });
        
        res.status(200).json({ accessToken });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const Me = async (req, res) => {
    try {
        const user = await User.findOne({
            attributes: ['id', 'name', 'username', 'email', 'role', 'no_hp'],
            where: {
                id: req.user.userId
            }
        });
        if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const logout = async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(400).json({ msg: "Token not found" });

    // Hapus token dari database
    await db.query('DELETE FROM valid_tokens WHERE token = :token', {
        replacements: { token: token }
    });

    res.status(200).json({ msg: "Logout Berhasil" });
}


