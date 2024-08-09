const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const passport = require('passport');
const hbs = require('hbs');

const indexRouter = require('./routes/index');
const employeesRouter = require('./routes/employees');
const customersRouter = require('./routes/customers');
const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');
const cartRouter = require('./routes/cart');
const purchaseCompleteRoutes = require('./routes/purchaseComplete');

const mongoose = require('mongoose');
const globals = require('./configs/globals');

const User = require('./models/user');
const githubStrategy = require('passport-github').Strategy;

const app = express();

hbs.registerHelper('isEqual', function(a, b) {
  return a.toString() === b.toString();
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
hbs.registerPartials(path.join(__dirname, 'views/partials'));

app.use(session({
  secret: 'POS_SYSTEM',
  resave: false, 
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.use(new githubStrategy({
  clientID: globals.Authentication.GitHub.ClientId,
  clientSecret: globals.Authentication.GitHub.ClientSecret,
  callbackURL: globals.Authentication.GitHub.CallbackUrl,
}, async (accessToken, refreshToken, profile, done) => {
  const user = await User.findOne({ oauthId: profile.id });
  if (user) {
    return done(null, user);
  } else {
    const newUser = new User({
      username: profile.username,
      oauthId: profile.id,
      oauthProvider: 'Github',
      created: Date.now()
    });
    const savedUser = await newUser.save();
    return done(null, savedUser);
  }
}));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use('/', indexRouter);
app.use('/employees', employeesRouter);
app.use('/products', productsRouter);
app.use('/orders', ordersRouter);
app.use('/customers', customersRouter);
app.use('/cart', cartRouter);
app.use('/purchase-complete', purchaseCompleteRoutes);

mongoose
  .connect(globals.ConnectionString.MongoDB)
  .then(() => {
    console.log('Connected successfully to MongoDB!');
  })
  .catch((err) => {
    console.log(err);
  });

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
