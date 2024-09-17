import express from "express";
import {
    getUser,
    getAll,
    getById,
    getAdmin,
    registerUser,
    registerAdmin,
    updateUser,
    deleteUser,
    deleteAdmin
} from "../controller/UserController.js"
import { adminOnly } from "../midleware/AuthUsers.js"

const router = express.Router();
router.get('/all-user', getAll)
//user route
router.get('/user', getUser);
router.post('/register', registerUser);
router.get('/user/:id', getById);
router.patch('/user/:id', updateUser);
router.delete('/user/:id',adminOnly, deleteUser);
//admin route
router.get('/admin', getAdmin);
router.post('/admin/register', registerAdmin);
router.get('/admin/:id', getById);
router.delete('/admin/:id', deleteAdmin);

export default router;