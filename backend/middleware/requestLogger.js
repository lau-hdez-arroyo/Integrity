export default function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, path, statusCode } = req;
    const user = req.user?.id || 'anonymous';

    console.log(`[${new Date().toISOString()}] ${method} ${path} - ${res.statusCode} (${duration}ms) - User: ${user}`);
  });

  next();
}
