import { buildErrorResponse } from "../utils/response.js";

export function notFoundHandler(request, response) {
  response
    .status(404)
    .json(
      buildErrorResponse(
        "ROUTE_NOT_FOUND",
        `The route ${request.originalUrl} was not found.`,
      ),
    );
}

export function malformedJsonHandler(error, request, response, next) {
  if (
    error instanceof SyntaxError &&
    "body" in error &&
    error.status === 400 &&
    "type" in error &&
    error.type === "entity.parse.failed"
  ) {
    console.error("Malformed JSON request received.", {
      method: request.method,
      path: request.originalUrl,
    });

    return response
      .status(400)
      .json(
        buildErrorResponse(
          "INVALID_JSON",
          "The request body contains invalid JSON.",
        ),
      );
  }

  return next(error);
}

export function errorHandler(error, request, response, next) {
  if (error?.code === 11000) {
    error.statusCode = 409;
    error.code = "DUPLICATE_RECORD";
    error.message = "A record with those unique fields already exists.";
  }
  const statusCode = error.statusCode || error.status || 500;
  const code =
    error.code ||
    (statusCode === 400
      ? "BAD_REQUEST"
      : statusCode === 401
        ? "UNAUTHORIZED"
        : statusCode === 403
          ? "FORBIDDEN"
          : statusCode === 404
            ? "ROUTE_NOT_FOUND"
            : statusCode === 429
              ? "TOO_MANY_REQUESTS"
              : "SERVER_ERROR");

  const isProduction = process.env.NODE_ENV === "production";
  const message = isProduction
    ? "An unexpected server error occurred."
    : error.message || "An unexpected server error occurred.";

  console.error("API error:", {
    code,
    method: request.method,
    path: request.originalUrl,
    statusCode,
    message: isProduction ? "Hidden from client response." : message,
  });

  response
    .status(statusCode)
    .json(buildErrorResponse(code, message, error.fieldErrors || {}));
}
