const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Cart = require('../models/cart');  // Added Cart model import
const path = require('path');
const fs = require('fs');

function IsLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

// Function to get list of image files from public/images folder
const getImageOptions = () => {
    const imageDir = path.join(__dirname, '../public/images');
    return fs.readdirSync(imageDir).filter(file => /\.(jpg|jpeg|png|gif)$/.test(file));
};

// List all products
router.get('/', async (req, res, next) => {
    try {
        const products = await Product.find();
        res.render('product/index', { title: 'Products', products, user: req.user });
    } catch (error) {
        next(error);
    }
});

// Render add product form
router.get('/add', IsLoggedIn, (req, res, next) => {
    const imageOptions = getImageOptions();
    res.render('product/add', { title: 'Add Product', user: req.user, imageOptions });
});

// Handle add product form submission
router.post('/add', IsLoggedIn, async (req, res, next) => {
    try {
        const { name, price, stock, description, imageFiles } = req.body;
        const numericPrice = parseFloat(price.replace('$', '')); // Remove dollar sign and convert to number
        if (isNaN(numericPrice) || numericPrice > 100) {
            return res.status(400).send('Invalid price. Please ensure the price is a number not exceeding $100.');
        }

        const newProduct = new Product({ name, price: numericPrice, stock, description, imageFiles: imageFiles.split(',') });
        await newProduct.save();
        res.redirect('/products');
    } catch (error) {
        next(error);
    }
});


// Render edit product form
router.get('/edit/:id', IsLoggedIn, async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        const imageOptions = getImageOptions();
        res.render('product/edit', { title: 'Edit Product', product, user: req.user, imageOptions });
    } catch (error) {
        next(error);
    }
});

// Handle edit product form submission
router.post('/edit/:id', IsLoggedIn, async (req, res, next) => {
    try {
        const { name, price, stock, description, imageFiles } = req.body;
        await Product.findByIdAndUpdate(req.params.id, { name, price, stock, description, imageFiles: imageFiles.split(',') });
        res.redirect('/products');
    } catch (error) {
        next(error);
    }
});

// Handle delete product
router.post('/delete/:id', IsLoggedIn, async (req, res, next) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect('/products');
    } catch (error) {
        next(error);
    }
});

// Handle add to cart
router.post('/add-to-cart/:id', IsLoggedIn, async (req, res, next) => {
    try {
        const productId = req.params.id;
        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        const existingItemIndex = cart.items.findIndex(item => item.product.equals(productId));
        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += 1;
        } else {
            cart.items.push({ product: productId, quantity: 1 });
        }

        await cart.save();
        res.redirect('/cart');
    } catch (error) {
        next(error);
    }
});

module.exports = router;
