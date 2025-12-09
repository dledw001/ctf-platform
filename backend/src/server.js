// for production, use dotenv to load env vars from .env file
if (process.env.NODE_ENV !== 'production') {
    try {
        require('dotenv').config();
    } catch(err) {
        // ignore error if .env is not present
    }
}

const app = require('./app');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
});