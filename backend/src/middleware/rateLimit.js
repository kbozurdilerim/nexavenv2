const requests = {};

module.exports = (limit = 10, windowMs = 60000) => {
  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();

    if (!requests[ip]) {
      requests[ip] = [];
    }

    requests[ip] = requests[ip].filter(
      timestamp => now - timestamp < windowMs
    );

    if (requests[ip].length >= limit) {
      return res.status(429).json({
        error: "Çok fazla istek"
      });
    }

    requests[ip].push(now);
    next();
  };
};
