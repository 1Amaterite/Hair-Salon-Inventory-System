require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Basic Route for Testing
app.get('/', (req, res) => {
    res.render('login'); // Will look for views/login.ejs
});

// Start Server
app.listen(PORT, () => {
    console.log(`Inventory System Server is running on http://localhost:${PORT}`);
    console.log('Ctrl + C to stop');
});