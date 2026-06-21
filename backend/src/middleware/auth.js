import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { User } from "../models/User.js";
import { authorizeRoles } from "./roleMiddleware.js";

function getTokenFromHeader(req) {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) return null;
  return auth.slice("Bearer ".length).trim();
}

export const requireAuth = asyncHandler(async (req, res, next) => {
  const token = getTokenFromHeader(req);
  if (!token) {
    res.status(401);
    throw new Error("Not authorized, token missing");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.sub).select("-passwordHash");
    if (!user) {
      res.status(401);
      throw new Error("Not authorized, user not found");
    }
    req.user = user;
    next();
  } catch {
    res.status(401);
    throw new Error("Not authorized, token invalid");
  }
});

export const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = getTokenFromHeader(req);
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.sub).select("-passwordHash");
    if (user) req.user = user;
  } catch {
    req.user = null;
  }
  next();
});

export function requireRole(...roles) {
  return authorizeRoles(...roles);
}

export const authMiddleware = requireAuth;
export const roleMiddleware = authorizeRoles;
export { authorizeRoles };

