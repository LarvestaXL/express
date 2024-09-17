import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
/* import db from "./config/Database.js"; 
 */import UserRoute from "./routes/UserRoute.js";
import AuthRoute from "./routes/AuthRoute.js";
import CategoryRoute from "./routes/CategoryRoute.js" 
import ProductRoute from "./routes/ProductRoute.js";
import CartRout from "./routes/CartRout.js"
import ReviewRoute from "./routes/ReviewRoute.js"
import CheckoutRoute from './routes/CheckoutRoute.js'
import { verifyToken } from "./midleware/AuthUsers.js";

dotenv.config();

const app = express();
/* 
(async ()=> {
    await db.sync();
})();  */  

app.use(session({
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized : true,
    cookie: {
        secure: 'auto'
    }
}));


app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Mendapatkan direktori saat ini dalam ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware untuk file statis di folder uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());    
app.use(express.urlencoded({ extended: true }));
app.use(UserRoute);
app.use(AuthRoute);
app.use(CategoryRoute);
app.use(ProductRoute);
app.use(CartRout);
app.use(CheckoutRoute);
app.use(ReviewRoute);

app.listen(process.env.APP_PORT, ()=> {
    console.log('Server up and running .....')
});
