const NodeCache = require("node-cache");
const rateLimit = require("express-rate-limit");

// Cache stratejisi: 10 dakika TTL
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// Cache helper'ları
function cacheKey(prefix, id) {
  return `${prefix}:${id}`;
}

function getFromCache(key) {
  return cache.get(key);
}

function setInCache(key, value, ttl = 600) {
  cache.set(key, value, ttl);
}

function invalidateCache(pattern) {
  cache.keys().forEach(key => {
    if (key.startsWith(pattern)) cache.del(key);
  });
}

// Rate limiters
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 300, // 300 req/15min
  message: "Too many requests"
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts
  skipSuccessfulRequests: true,
  message: "Too many login attempts"
});

const tuningLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 50, // 50 tuning jobs/hour
  message: "Tuning rate limit exceeded"
});

module.exports = {
  cache,
  cacheKey,
  getFromCache,
  setInCache,
  invalidateCache,
  apiLimiter,
  authLimiter,
  tuningLimiter
};
