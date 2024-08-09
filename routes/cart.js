const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const Order = require('../models/order');
const OrderItem = require('../models/orderItem');
const Product = require('../models/product');

// Middleware to check if user is logged in
function IsLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

// Render cart page
router.get('/', IsLoggedIn, async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        res.render('cart/index', { title: 'Your Cart', cart, user: req.user });
    } catch (error) {
        next(error);
    }
});

// Handle remove from cart
router.post('/remove/:id', IsLoggedIn, async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        const itemIndex = cart.items.findIndex(item => item._id.equals(req.params.id));

        if (itemIndex > -1) {
            const item = cart.items[itemIndex];
            
            // Remove the product from the product collection
            await Product.findByIdAndDelete(item.product._id);
            
            // Remove item from cart
            cart.items.splice(itemIndex, 1);
            await cart.save();
        }

        res.redirect('/cart');
    } catch (error) {
        next(error);
    }
});

// Handle purchase items in cart
router.post('/purchase', IsLoggedIn, async (req, res, next) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

        if (cart) {
            const user = req.user._id; // Ensure this is set correctly for the order model
            const employee = req.user._id;

            let total = 0;
            const orderItems = await Promise.all(cart.items.map(async (item) => {
                const orderItem = new OrderItem({
                    product: item.product._id,
                    quantity: item.quantity,
                    price: item.product.price
                });
                await orderItem.save();
                total += item.quantity * item.product.price;
                return orderItem._id;
            }));

            const newOrder = new Order({
                user, // Assign user here
                customer: user,
                employee,
                items: orderItems,
                total
            });
            await newOrder.save();

            await Promise.all(cart.items.map(async (item) => {
                // Remove product from product collection
                await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } });
                if (item.product.stock <= 0) {
                    await Product.findByIdAndDelete(item.product._id);
                }
            }));

            cart.items = [];
            await cart.save();
        }

        res.redirect('/purchase-complete');
    } catch (error) {
        next(error);
    }
});

// Render purchase completion page
router.get('/purchase-complete', IsLoggedIn, (req, res) => {
    res.render('purchase-complete', { title: 'Purchase Complete', user: req.user });
});

module.exports = router;
