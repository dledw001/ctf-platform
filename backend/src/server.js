require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 4000;

(async () => {
    app.listen(PORT, () => {
        console.log(`Backend server listening on port ${PORT}`);
    });
})();