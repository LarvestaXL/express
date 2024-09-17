import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Product from "./ProuctModel.js";
import Cart from "./CartModel.js";
import User from "./UserModel.js";

const { DataTypes } = Sequelize;

const Checkout = db.define('checkouts', {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    apartmen: {
        type: DataTypes.STRING,
        allowNull: true
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    province: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    postal_code: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    payment_number: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            notEmpty: true
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
    cart_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Cart,
            key: 'id'
        }
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    total_harga: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            notEmpty: true
        }
    }
}, {
    freezeTableName: true
});

User.hasMany(Checkout, { foreignKey: 'user_id' });
Checkout.belongsTo(User, { foreignKey: 'user_id' });
//
Product.hasMany(Checkout, { foreignKey: 'product_id' });
Checkout.belongsTo(Product, { foreignKey: 'product_id' });
//
Cart.hasMany(Checkout, { foreignKey: 'cart_id' });
Checkout.belongsTo(Cart, { foreignKey: 'cart_id' });

export default Checkout;