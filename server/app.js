if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const User = require('./models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const ExpressError = require('./utils/ExpressError');
const mongoSanitize = require('express-mongo-sanitize');
const methodOverride = require('method-override');
const MongoStore = require('connect-mongo');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const creativeRoutes = require('./routes/creatives');
const clientRoutes = require('./routes/clients');
const requestRoutes = require('./routes/requests');
const proposalRoutes = require('./routes/proposals');
const subscriptionRoutes = require('./routes/subscriptions');
const adminRoutes = require('./routes/admin');

const dbUrl = process.env.DB_URL;
mongoose.connect(dbUrl, {});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected")
});

const app = express();

const allowedOrigins = [
    'http://localhost:5173', // Development
    'http://localhost:3000', // Local frontend
    'https://klicknshoot.vercel.app', // Vercel deployment
    'https://www.klicknshoot.com',
    'https://klicknshoot.com'  // Add your custom domain later
    // 'https://peskaya-98bb2fd3d6e7.herokuapp.com', // Production
    // 'https://www.peskaya.com',
];

// Middleware
app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

// HTTPS redirect for production
if(process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
      if (req.header('x-forwarded-proto') !== 'https')
        res.redirect(`https://${req.header('host')}${req.url}`)
      else
        next()
    })
}

// Body parsing and security middleware
app.use(express.urlencoded({extended: true, limit: '25mb'}));
app.use(express.json({ limit: '25mb'}));
app.use(methodOverride('_method'));
app.use(mongoSanitize());
app.set('trust proxy', 1);

// Session configuration
const secret = process.env.SECRET;
const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60,
    autoRemove: 'interval',
    autoRemoveInterval: 10
});

const sessionConfig = session({
    store,
    name: "session",
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Adjust for cross-origin
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        maxAge: 1000 * 60 * 60 *24 * 7
    }
})

app.use(sessionConfig);

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
}, User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Local variables middleware
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
})

// Serve static files for React app in production
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, '../client/dist')));
}


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/creatives', creativeRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.json({
        message: 'Travel Lead AI API Server',
        status: 'running',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Catch-all for React app in production (must come after API routes)
if (process.env.NODE_ENV === "production") {
    app.get('*', function (req, res) {
        // Only serve React app for non-API routes
        if (!req.originalUrl.startsWith('/api')) {
            res.sendFile(path.join(__dirname, "../", "client", "dist", "index.html"),
                function(err) {
                    if (err) {
                        res.status(500).send(err);
                    }
                }
            );
        }
    });
}

// 404 handler for unmatched routes
app.all('*', (req, res, next) => {
    // Always return JSON for all routes
    return res.status(404).json({ 
        error: {
            message: 'Endpoint not found',
            status: 404,
            path: req.originalUrl
        }
    });
});

// Global error handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    
    console.error('Error:', err); // Log the error for debugging

    // Always return JSON response
    const response = {
        error: {
            message: err.message || 'Internal server error',
            status: statusCode,
            path: req.originalUrl
        }
    };

    // Add stack trace in development
    if (process.env.NODE_ENV === 'development') {
        response.error.stack = err.stack;
    }

    return res.status(statusCode).json(response);
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`FrameFinder ke backend running on port ${port}`);
});