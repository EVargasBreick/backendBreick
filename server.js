const express = require("express");
const session = require("express-session");
const https = require("https");
const fs = require("fs");
var cors = require("cors");
require("dotenv").config();
const serverConfig = require("./config/serverConfig.json");
const dbConnection = 1; /*= new (require("rest-mssql-nodejs"))({
  user: process.env.USER_NAME,
  password: process.env.PASSWORD,
  server: process.env.SERVER, // replace this with your IP Serve
  database: process.env.DATABASE_NAME, // this is optional, by default takes the port 1433
  options: {
    encrypt: true,
    enableArithAbort: true,
  },
});*/

var corsOptions = {
  origin: process.env.TYPE ? "http://localhost:3006" : process.env.URL_SERVER,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204,
};

var bodyParser = require("body-parser");
const options = {
  key: fs.readFileSync("./breickkey.key"),
  cert: fs.readFileSync("./breickventas_lat.crt"),
  ca: fs.readFileSync("./breickventas_lat.ca-bundle"),
};
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
const userRoutes = require("./routes/user");
const loginRoutes = require("./routes/login");
const productRoutes = require("./routes/product");
const storeRoutes = require("./routes/store");
const languajeRoutes = require("./routes/languaje");
const rolRoutes = require("./routes/rol");
const zoneRoutes = require("./routes/zona");
const dayRoutes = require("./routes/day");
const clientRoutes = require("./routes/client");
const contactRoutes = require("./routes/contact");
const orderRoutes = require("./routes/order");
const mailRoutes = require("./routes/node_mailer");
const transferRoutes = require("./routes/transfer");
const stockRoutes = require("./routes/stock");
const stateRoutes = require("./routes/state");
const saleRoutes = require("./routes/sale");
const invoiceRoutes = require("./routes/invoice");
const branchRoutes = require("./routes/branch");
const reportRoutes = require("./routes/reports");
const shortageRoutes = require("./routes/shortage");
const xmlRoutes = require("./routes/xml");
const packRoutes = require("./routes/pack");
const rejectedRoutes = require("./routes/rejected");
const dropRoutes = require("./routes/drop");
const testLogging = require("./services/logDailyKardex");
const getInvoicesIncomplete = require("./services/getIncompleteInvoices");
const logIncompleteInvoices = require("./services/logIncompleteInvoices");
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
app.use("/", rejectedRoutes);
app.use("/", dropRoutes);

const serverType = process.env.TYPE ? "local" : "web";

if (serverType === "web") {
  https.createServer(options, app).listen(443, () => {
    console.log("Server listening on port 443");
    console.log("Hora actual", new Date());
    function setupInterval() {
      const now = new Date();
      var millisTill4AM =
        new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1,
          4,
          0,
          0,
          0
        ) - now;
      if (millisTill4AM < 0) {
        millisTill4AM += 86400000; // it's after 4am, try 4am tomorrow.
      }
      setTimeout(function () {
        testLogging();
        setInterval(testLogging, 24 * 60 * 60 * 1000);
      }, millisTill4AM);

      var millisTill1040AM =
        new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          10,
          00,
          0,
          0
        ) - now;
      if (millisTill1040AM < 0) {
        millisTill1040AM += 86400000; // it's after 10:40am, try 10:40am tomorrow.
      }

      setTimeout(function () {
        getInvoicesIncomplete();
        setInterval(getInvoicesIncomplete, 24 * 60 * 60 * 1000);
      }, millisTill1040AM);
    }
    setupInterval();
  });
} else {
  app.listen(serverConfig.port, () => {
    console.log("Cors options", corsOptions);
    console.log("Server listening on port ", 5200);
    //logIncompleteInvoices();
  });
}
