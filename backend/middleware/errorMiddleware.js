
const AppError = require('./appError');

const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV !== 'production') {
        console.error('ERROR 💥', err);
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
        });
    }


    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }

    console.error('PRODUCTION ERROR :', err);

    return res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!',
    });
};

module.exports = globalErrorHandler;

