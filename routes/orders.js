const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Employee = require('../models/employee');
const OrderItem = require('../models/orderItem');
const Product = require('../models/product');
const pdf = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Middleware to check if user is authenticated
function IsLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

// List all orders
router.get('/', async (req, res, next) => {
    try {
        const orders = await Order.find()
            .populate({
                path: 'items',
                populate: {
                    path: 'product',
                    select: 'name price'
                }
            });
        res.render('order/index', { title: 'Orders', orders, user: req.user });
    } catch (error) {
        next(error);
    }
});

// Render add order form
router.get('/add', IsLoggedIn, async (req, res, next) => {
    try {
        const employees = await Employee.find();
        const products = await Product.find();
        res.render('order/add', { title: 'Add Order', employees, products, user: req.user });
    } catch (error) {
        next(error);
    }
});

// Handle add order form submission
router.post('/add', IsLoggedIn, async (req, res, next) => {
    try {
        const { employee, items } = req.body;
        let total = 0;
        const orderItems = await Promise.all(items.map(async (item) => {
            const product = await Product.findById(item.product);
            const orderItem = new OrderItem({ product: product._id, quantity: item.quantity, price: product.price });
            await orderItem.save();
            total += item.quantity * product.price;
            return orderItem._id;
        }));

        const newOrder = new Order({ employee, items: orderItems, total });
        await newOrder.save();
        res.redirect('/orders');
    } catch (error) {
        next(error);
    }
});

// Handle delete order
router.post('/delete/:id', IsLoggedIn, async (req, res, next) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.redirect('/orders');
    } catch (error) {
        next(error);
    }
});

router.get('/invoice/:id', async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate({
                path: 'items',
                populate: {
                    path: 'product',
                    select: 'name price'
                }
            })
            .populate('employee', 'name');

        if (!order) {
            return res.status(404).send('Order not found');
        }

        const invoicesDir = path.join(__dirname, '..', 'invoices');
        if (!fs.existsSync(invoicesDir)) {
            fs.mkdirSync(invoicesDir);
        }

        const invoicePath = path.join(invoicesDir, `invoice-${order._id}.pdf`);
        const doc = new pdf();
        doc.pipe(fs.createWriteStream(invoicePath));

        // Title
        doc.fontSize(20).text('Invoice', { align: 'center' }).moveDown();

        // Order ID
        doc.fontSize(14).text(`Order ID: ${order._id}`).moveDown();

        // Employee
        doc.text(`Store Owner: ${order.employee ? order.employee.name : 'YOGI PATEL'}`).moveDown();

        // Table rows
        order.items.forEach(item => {
            doc.text(`Product Name: ${item.product ? item.product.name : 'N/A'}`);
            doc.text(`Quantity: ${item.quantity}`);
            doc.moveDown();
        });

        // Total Amount
        doc.text(`Total Amount: $${order.total.toFixed(2)}`).moveDown();

        // Thank You Message
        doc.fontSize(12).text('Thank you for your business!', { align: 'center' });

        doc.end();

        res.download(invoicePath, `invoice-${order._id}.pdf`);
    } catch (error) {
        console.error('Error generating invoice:', error);
        res.status(500).send('Error generating invoice');
    }
});

module.exports = router;