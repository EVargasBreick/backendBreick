const express = require("express");
const session = require("express-session");
var cors = require("cors");
require("dotenv").config();
const serverConfig = require("./config/serverConfig.json");
const dbConnection = new (require("rest-mssql-nodejs"))({
  user: process.env.USERNAME,
  password: process.env.PASSWORD,
  server: process.env.SERVER, // replace this with your IP Serve
  database: process.env.DATABASE_NAME, // this is optional, by default takes the port 1433
  options: {
    encrypt: true,
    enableArithAbort: true,
  },
});
var corsOptions = {
  origin: process.env.URL_SERVER,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204,
};

var bodyParser = require("body-parser");

const maxAge = 60 * 60 * 12;
const app = express();
const sessionParams = {
  secret: "dsfnskdjnvksnbvd",
  resave: true,
  saveUninitialized: true,
  maxAge: maxAge,
};
(module.exports = dbConnection), sessionParams, corsOptions;
app.use(session(sessionParams));
app.use(bodyParser.json());
app.use(cors(corsOptions));
const userRoutes = require("./routes/User");
const loginRoutes = require("./routes/Login");
const productRoutes = require("./routes/Product");
const storeRoutes = require("./routes/Store");
const languajeRoutes = require("./routes/Languaje");
const rolRoutes = require("./routes/Rol");
const zoneRoutes = require("./routes/Zona");
const dayRoutes = require("./routes/Day");
const clientRoutes = require("./routes/Client");
const contactRoutes = require("./routes/Contact");
const orderRoutes = require("./routes/Order");
const mailRoutes = require("./routes/NodeMailer");
const transferRoutes = require("./routes/Transfer");
const stockRoutes = require("./routes/Stock");
const stateRoutes = require("./routes/State");
const saleRoutes = require("./routes/Sale");
const invoiceRoutes = require("./routes/Invoice");
const branchRoutes = require("./routes/Branch");
const reportRoutes = require("./routes/Reports");
const shortageRoutes = require("./routes/Shortage");
const xmlRoutes = require("./routes/Xml");
const packRoutes = require("./routes/Pack");
app.use("/", userRoutes);
app.use("/", loginRoutes);
app.use("/", productRoutes);
app.use("/", storeRoutes);
app.use("/", languajeRoutes);
app.use("/", rolRoutes);
app.use("/", zoneRoutes);
app.use("/", dayRoutes);
app.use("/", clientRoutes);
app.use("/", contactRoutes);
app.use("/", orderRoutes);
app.use("/", mailRoutes);
app.use("/", transferRoutes);
app.use("/", stockRoutes);
app.use("/", stateRoutes);
app.use("/", saleRoutes);
app.use("/", invoiceRoutes);
app.use("/", branchRoutes);
app.use("/", reportRoutes);
app.use("/", shortageRoutes);
app.use("/", xmlRoutes);
app.use("/", packRoutes);
app.listen(serverConfig.port, () => {
  console.log("Server listening on port ", process.env.PORT);
});
