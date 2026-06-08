import { rateLimit } from "express-rate-limit";

const createRateLimiter = ({ windowMinutes, max, message }) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      return res.status(429).json({ message });
    }
  });

export const authRateLimiter = createRateLimiter({
  windowMinutes: 15,
  max: 20,
  message: "Trop de tentatives. Reessayez dans quelques minutes."
});

export const postCreationRateLimiter = createRateLimiter({
  windowMinutes: 10,
  max: 15,
  message: "Trop de publications envoyees rapidement. Reessayez dans quelques minutes."
});

export const commentCreationRateLimiter = createRateLimiter({
  windowMinutes: 10,
  max: 30,
  message: "Trop de commentaires envoyes rapidement. Reessayez dans quelques minutes."
});
