import { Sequelize, DataTypes } from "sequelize";
import db from "../config/Database.js";
import Checkout from "./CheckoutModel.js";
import User from "./UserModel.js";
import Product from "./ProuctModel.js";

const Review = db.define('reviews', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    content: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    checkout_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Checkout,
            key: 'id'
        }
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Product,
            key: 'id'
        }
    },
}, {
    freezeTableName: true
});

Review.belongsTo(User, { foreignKey: 'user_id' });
Review.belongsTo(Checkout, { foreignKey: 'checkout_id' });
Review.belongsTo(Product, { foreignKey: 'product_id' });

User.hasMany(Review, { foreignKey: 'user_id' });
Checkout.hasMany(Review, { foreignKey: 'checkout_id' });
Product.hasMany(Review, { foreignKey: 'product_id' });

export default Review;