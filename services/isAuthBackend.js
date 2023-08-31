const backendToken = process.env.BACKEND_TOKEN; // Replace with your environment variable name

const verifyTokenMiddleware = (req, res, next) => {
  const clientToken = req.headers.authorization?.split(" ")[1];

  if (!clientToken || clientToken !== backendToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  next();
};

module.exports = verifyTokenMiddleware;
