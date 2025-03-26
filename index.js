const express = require("express");
const loggerMiddleware = require("./middleware/logger");
const apiRoutes = require("./routes/api");

const app = express();
const port = 3000;

app.use(express.json());
app.use(loggerMiddleware);

app.use("/api", apiRoutes);

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
