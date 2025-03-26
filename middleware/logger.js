const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;

  console.log(`[${timestamp}] ${method} ${url}`);

  if (["POST", "PATCH"].includes(method)) {
    console.log("Request Body:", req.body);
  }

  // Track response status
  res.on("finish", () => {
    console.log(`[${timestamp}] ${method} ${url} - ${res.statusCode}`);
  });

  next();
};

module.exports = logger;
