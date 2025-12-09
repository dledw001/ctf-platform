const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const routes = require('./routes');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: 'http://localhost:3000',
        credentials: true
    })
);

app.get('/health', (req, res) => {
    res.json({status: 'ok'});
});

app.use('/api', routes);

// 404 handler
app.use('/api', (req, res) => {
    return res.status(404).json({error: 'Not found'});
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({error: 'Internal server error'});
});

module.exports = app;