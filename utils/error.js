export function throwError(code, message) {
  const _error = new Error(message);
  const error = {
    code,
    message,
    stack: _error.stack,
  };

  throw error;
}
