/**
 *
 * @param {import("express").Request} req The request object
 * @param {import("express").Response} res The response object
 * @returns
 */
const RequestHandler = (req, res, next) => {
  const config = res.app.get("config") ?? {};
  const userPrefs = res.app.get("userPrefs") ?? {};

  res.locals = { ...res.locals, config, userPrefs };

  next();
};

export default RequestHandler;
