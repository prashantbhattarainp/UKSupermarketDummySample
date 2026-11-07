import crypto from "node:crypto";

import { buildErrorResponse } from "../utils/response.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function createAuthMiddleware({ authService } = {}) {
  return {
    requireSession(request, response, next) {
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

      authService
        .findById(request.session.userId)
        .then((user) => {
          if (!user || !user.active) {
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

          request.user = user;
          next();
        })
        .catch(next);
    },
    requireRole(role) {
      return (request, response, next) => {
        if (request.user?.role !== role) {
          return response
            .status(403)
            .json(
              buildErrorResponse(
                "INSUFFICIENT_PERMISSIONS",
                "You do not have permission to perform this action.",
              ),
            );
        }
        next();
      };
    },
  };
}

export function ensureCsrfToken(request) {
  if (!request.session.csrfToken) {
    request.session.csrfToken = crypto.randomBytes(32).toString("hex");
  }
  return request.session.csrfToken;
}

export function csrfProtection(request, response, next) {
  if (SAFE_METHODS.has(request.method)) return next();

  const token = request.get("X-CSRF-Token");
  if (
    !token ||
    !request.session?.csrfToken ||
    token !== request.session.csrfToken
  ) {
    return response
      .status(403)
      .json(
        buildErrorResponse(
          "CSRF_TOKEN_REQUIRED",
          "A valid CSRF token is required.",
        ),
      );
  }

  next();
}
