export function httpError(status, message) {
  const err = new Error(message)
  err.status = status
  return err
}

export const notFound = (req, res, next) => {
  next(httpError(404, `Route not found: ${req.originalUrl}`))
}

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err)

  const status = err.status || (res.statusCode >= 400 ? res.statusCode : 500)

  res.status(status).json({
    message: err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  })
}