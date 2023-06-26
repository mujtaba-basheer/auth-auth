const express = require("express");
const dotenv = require("dotenv");
const router = require("./routes");
const cors = require("cors");
dotenv.config();

const app = express();
app.options("*", cors());
app.use(cors());
app.use(express.json({ limit: "5mb" }));
if (process.env.NODE_ENV === "development") {
  const morgan = require("morgan");
  app.use(morgan("dev"));
}
app.use("/api", router);
// test endpoint
app.get("/*", (req, res) => {
  res.send("API is running...\n");
});

// spinning up the server
const port = process.env.PORT || 5000;
app.listen(port, () =>
  console.log(`Server running in ${process.env.NODE_ENV} on port ${port}...`)
);
