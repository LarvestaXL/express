import express from "express";
import { loginUser, Me, logout, loginAdmin} from "../controller/AuthController.js"
import { verifyToken } from "../midleware/AuthUsers.js";

const router = express.Router();

router.get('/me', verifyToken, Me);
router.post('/login', loginUser);
router.post('/admin/login', loginAdmin);
router.delete('/logout', verifyToken, logout);


export default router;