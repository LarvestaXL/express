import express from "express";
import { getCheckout,
        getCheckoutById,
        createCheckout,
        getAllCheckout
} from '../controller/Checkoutcontroller.js'
import { verifyToken } from "../midleware/AuthUsers.js";

const router = express.Router();

router.get('/checkout',verifyToken, getCheckout);
router.get('/get-all-checkouts',getAllCheckout);
router.get('/checkout/:id',verifyToken, getCheckoutById);
router.post('/checkout',verifyToken, createCheckout);

export default router;