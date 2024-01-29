function formatError(error) {
    if (typeof error === 'object' && error !== null) {
        if (error.message) {
            return error.message;
        } else {
            return JSON.stringify(error);
        }
    } else {
        return error.toString();
    }
}

module.exports = { formatError }