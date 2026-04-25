import jwt from "jsonwebtoken";
import jwtConfig from "../configs/jwt.config.js";

export const Guest = (req, res, next) => {
  const token = req.cookies?.accessToken;
  if (!token) return next();

  try {
    jwt.verify(token, jwtConfig.accessKey);
    res.redirect("/api/login"); // token valid — profilega
  } catch {
    next(); // token eskirgan yoki noto'g'ri — o'tkazib yubor
  }
};
