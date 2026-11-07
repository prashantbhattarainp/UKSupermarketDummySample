import { Router } from "express";
import rateLimit from "express-rate-limit";

import { csrfProtection, ensureCsrfToken } from "../middleware/auth.js";
import {
  createAuthService,
  GENERIC_LOGIN_ERROR,
  toPublicUser,
  validateLoginInput,
} from "../services/authService.js";
import { buildErrorResponse, buildSuccessResponse } from "../utils/response.js";

export function createAuthRouter({
  authService = createAuthService(),
  loginLimiter,
  cookieName = "deepak.sid",
} = {}) {
  const router = Router();
  const limiter =
    loginLimiter ||
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 5,
      standardHeaders: "draft-7",
      legacyHeaders: false,
      message: buildErrorResponse(
        "LOGIN_RATE_LIMITED",
        "Too many login attempts. Try again later.",
      ),
    });

  router.get("/csrf", (request, response) => {
    response.json(buildSuccessResponse({ token: ensureCsrfToken(request) }));
  });

  router.post("/login", limiter, async (request, response, next) => {
    const input = validateLoginInput(request.body);
    if (Object.keys(input.fieldErrors).length > 0) {
      return response
        .status(400)
        .json(
          buildErrorResponse(
            "INVALID_LOGIN_INPUT",
            "Enter a valid email and password.",
            input.fieldErrors,
          ),
        );
    }

    try {
      const user = await authService.authenticate(
        input.normalizedEmail,
        request.body.password,
      );
      if (!user || !user.active || user.role !== "owner") {
        return response
          .status(401)
          .json(buildErrorResponse("INVALID_CREDENTIALS", GENERIC_LOGIN_ERROR));
      }

      request.session.regenerate((error) => {
        if (error) return next(error);
        request.session.userId = user.id || user._id.toString();
        ensureCsrfToken(request);
        response.json(buildSuccessResponse({ user: toPublicUser(user) }));
      });
    } catch (error) {
      next(error);
    }
  });

  router.get("/me", async (request, response, next) => {
    if (!request.session?.userId) {
      return response
        .status(401)
        .json(
          buildErrorResponse(
            "AUTHENTICATION_REQUIRED",
            "Authentication is required.",
          ),
        );
    }

    try {
      const user = await authService.findById(request.session.userId);
      if (!user || !user.active || user.role !== "owner") {
        return request.session.destroy(() =>
          response
            .status(401)
            .json(
              buildErrorResponse(
                "AUTHENTICATION_REQUIRED",
                "Authentication is required.",
              ),
            ),
        );
      }
      response.json(buildSuccessResponse({ user: toPublicUser(user) }));
    } catch (error) {
      next(error);
    }
  });

  router.post("/logout", csrfProtection, (request, response, next) => {
    if (!request.session?.userId) {
      return response
        .status(401)
        .json(
          buildErrorResponse(
            "AUTHENTICATION_REQUIRED",
            "Authentication is required.",
          ),
        );
    }

    const secureCookie = request.session.cookie.secure;
    request.session.destroy((error) => {
      if (error) return next(error);
      response.clearCookie(cookieName, {
        httpOnly: true,
        secure: secureCookie,
        sameSite: "lax",
        path: "/",
      });
      response.json(buildSuccessResponse({ loggedOut: true }));
    });
  });

  return router;
}
