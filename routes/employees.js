const express = require('express');
const router = express.Router();
const Employee = require('../models/employee');
const user = require('../models/user');

function IsLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

// List all employees
router.get('/',   async (req, res, next) => {
    try {
        const employees = await Employee.find();
        res.render('employee/index', { title: 'Employees', employees, user: req.user });
    } catch (error) {
        next(error);
    }
});

// Render add employee form
router.get('/add',  IsLoggedIn, (req, res, next) => {
    res.render('employee/add', { title: 'Add Employee', user: req.user });
});

// Handle add employee form submission
router.post('/add',  IsLoggedIn ,async (req, res, next) => {
    try {
        const { name, age, id, gender, shiftStatus } = req.body;
        const newEmployee = new Employee({ name, age, id, gender, shiftStatus });
        await newEmployee.save();
        res.redirect('/employees');
    } catch (error) {
        next(error);
    }
});

// Render edit employee form
router.get('/edit/:id', IsLoggedIn, async (req, res, next) => {
    try {
        const employee = await Employee.findById(req.params.id);
        res.render('employee/edit', { title: 'Edit Employee', employee, user: req.user });
    } catch (error) {
        next(error);
    }
});

// Handle edit employee form submission
router.post('/edit/:id', IsLoggedIn, async (req, res, next) => {
    try {
        const { name, age, id, gender, shiftStatus } = req.body;
        await Employee.findByIdAndUpdate(req.params.id, { name, age, id, gender, shiftStatus });
        res.redirect('/employees');
    } catch (error) {
        next(error);
    }
});

// Handle delete employee
router.post('/delete/:id',  IsLoggedIn, async (req, res, next) => {
    try {
        await Employee.findByIdAndDelete(req.params.id);
        res.redirect('/employees');
    } catch (error) {
        next(error);
    }
});

module.exports = router;
