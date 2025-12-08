const crypto = require('crypto');

function getPepper() {
    const pepper = process.env.FLAG_PEPPER;
    if (!pepper) {
        throw new Error('FLAG_PEPPER environment variable is not set');
    }
    return pepper;
}

function hashFlag(flag) {
    if (typeof flag !== 'string') {
        throw new Error('flag must be a string');
    }

    const clean = flag.trim();
    const pepper = getPepper();
    const peppered = clean + pepper;
    return crypto
        .createHash('sha256')
        .update(peppered, 'utf8')
        .digest('hex');
}

module.exports = { hashFlag };