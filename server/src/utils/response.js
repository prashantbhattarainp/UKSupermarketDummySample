export function buildSuccessResponse(data = {}, meta = {}) {
  return {
    data,
    meta,
    error: null,
  };
}

export function buildErrorResponse(code, message, fieldErrors = {}) {
  return {
    data: null,
    meta: {},
    error: {
      code,
      message,
      ...(Object.keys(fieldErrors).length > 0 ? { fieldErrors } : {}),
    },
  };
}
