const express = require('express');
const router = express.Router();
const Customer = require('../models/customer');
function IsLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}
// List all customers
router.get('/', IsLoggedIn, async (req, res, next) => {
    try {
        const customers = await Customer.find();
        res.render('customer/index', { title: 'Customers', customers, user: req.user });
    } catch (error) {
        next(error);
    }
});

// Render add customer form
router.get('/add',IsLoggedIn, (req, res, next) => {
    res.render('customer/add', { title: 'Add Customer', user: req.user });
});

// Handle add customer form submission
router.post('/add',IsLoggedIn, async (req, res, next) => {
    try {
        const { name, email, phone, address } = req.body;
        const newCustomer = new Customer({ name, email, phone, address });
        await newCustomer.save();
        res.redirect('/customers');
    } catch (error) {
        next(error);
    }
});

// Render edit customer form
router.get('/edit/:id',IsLoggedIn, async (req, res, next) => {
    try {
        const customer = await Customer.findById(req.params.id);
        res.render('customer/edit', { title: 'Edit Customer', customer, user: req.user });
    } catch (error) {
        next(error);
    }
});

// Handle edit customer form submission
router.post('/edit/:id',IsLoggedIn, async (req, res, next) => {
    try {
        const { name, email, phone, address } = req.body;
        await Customer.findByIdAndUpdate(req.params.id, { name, email, phone, address });
        res.redirect('/customers');
    } catch (error) {
        next(error);
    }
});

// Handle delete customer
router.post('/delete/:id', IsLoggedIn, async (req, res, next) => {
    try {
        await Customer.findByIdAndDelete(req.params.id);
        res.redirect('/customers');
    } catch (error) {
        next(error);
    }
});

module.exports = router;
