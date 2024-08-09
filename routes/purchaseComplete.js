const express = require('express');
const router = express.Router();

function IsLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

// Render purchase complete page
router.get('/', IsLoggedIn, (req, res, next) => {
    res.render('cart/purchase-complete', { title: 'Purchase Complete', user: req.user });
});

module.exports = router;
