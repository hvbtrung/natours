const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
}

const handleDuplicateFieldDB = err => {
    const message = `Duplicate field value: ${err.keyValue.name}. Please use another value!`;
    return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
    const message = `Invalid input data. ${err.message}`;
    return new AppError(message, 400);
}

const handleJWTError = err => {
    const message = `Invalid token. Please log in again!`;
    return new AppError(message, 401);
}

const handleJWTExpiresError = err => {
    const message = `Your token has expired! Please log in again`;
    return new AppError(message, 401);
}

const sendErrorDev = (err, req, res) => {
    // API
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    }
    // RENDER WEBSITE
    console.log('ERROR!', err);
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message
    });
}

const sendErrorProd = (err, req, res) => {
    // API
    if (req.originalUrl.startsWith('/api')) {
        // A> Operational, trusted error: send message to client
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        }
        // B> Programing or other unknown error
        // 1> Log error
        console.log('ERROR!', err);
        // 2> send generic meesage
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        });
    }
    // RENDER WEBSITE
    // A> Operational, trusted error: send message to client
    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message
        });
    }
    // B> Programing or other unknown error
    // 1> Log error
    console.log('ERROR!', err);
    // 2> send generic meesage
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: 'Please try again later.'
    });
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else {
        // We need error.name, but err not have, but json(err) have
        // so need cast from js to json, then cast json to js to take error.name
        let error = JSON.parse(JSON.stringify(err));
        error.message = err.message;
        console.log(1, err);
        console.log(2, error);

        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldDB(error);
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
        if (error.name === 'TokenExpiredError') error = handleJWTExpiresError(error);

        sendErrorProd(error, req, res);
    }
}