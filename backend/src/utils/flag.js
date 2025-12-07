const crypto = require('crypto');

function hashFlag(flag) {
    if (typeof flag !== 'string') {
        throw new Error('flag must be a string');
    }

    const clean = flag.trim();
    return crypto
        .createHash('sha256')
        .update(clean, 'utf8')
        .digest('hex');
}

module.exports = { hashFlag };