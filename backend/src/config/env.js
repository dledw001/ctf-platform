// only use dotenv when .env is present && NODE_ENV is not production
if (process.env.NODE_ENV === 'production') {
    try {
        require('dotenv').config();
    } catch (err) {
        // ignore error if .env is not present
    }
}

module.exports = process.env;