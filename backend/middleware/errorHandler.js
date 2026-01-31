function errorHandler(err, req, res, next) {    
    const statusCode = err.status || 500
    
    console.error(`---`)
    console.error(`[HIBA] ${req.method} ${req.url} - IP: ${req.ip}`)
    console.error(`Üzenet: ${err.message}`)
    console.error(`---`)

    
    res.status(statusCode).json({success: false, message: err.message || "Szerverhiba történt." })
}

module.exports = errorHandler