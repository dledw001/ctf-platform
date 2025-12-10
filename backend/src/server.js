require('dotenv').config();
const app = require('./app');

const { ensureAdmin } = require('./utils/ensureAdmin');

const PORT = process.env.PORT || 4000;

(async () => {
    await ensureAdmin();
    app.listen(PORT, () => {
        console.log(`Backend server listening on port ${PORT}`);
    });
})();