import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import db from "../config/Database.js";

export const adminOnly = async (req, res, next) => {
    try {
        const user = await User.findOne({
            where: {
                id: req.session.id
            }
        });
        if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });
        if (user.role !== "admin") return res.status(403).json({ msg: "Akses terlarang" });
        next();
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401); 
    }

    try {
        const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = user;
        req.userId = user.id || user.userId;  // Sesuaikan dengan payload JWT-mu

        console.log('Verified User id:', req.userId);  // Debugging

        const [results, metadata] = await db.query('SELECT * FROM valid_tokens WHERE token = :token', {
            replacements: { token: token },
            type: db.QueryTypes.SELECT
        });

        if (results.length === 0) {
            return res.status(403).json({ msg: "Token not valid" });
        }

        next();
    } catch (error) {
        return res.status(403).json({ msg: "Forbidden", error: error.message });
    }
};
