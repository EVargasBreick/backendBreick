const express = require("express");
const session = require("express-session");
var cors = require("cors");
const serverConfig = require("./config/serverConfig.json");
const dbConnection = new (require("rest-mssql-nodejs"))({
  user: serverConfig.user,
  password: serverConfig.password,
  server: serverConfig.server, // replace this with your IP Serve
  database: serverConfig.database, // this is optional, by default takes the port 1433
  options: {
    encrypt: true,
    enableArithAbort: true,
  },
});
var corsOptions = {
  origin: serverConfig.urlServer,
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
app.use("/", userRoutes);
app.use("/", loginRoutes);
app.use("/", productRoutes);
app.use("/", storeRoutes);
app.use("/", languajeRoutes);
app.use("/", rolRoutes);
app.use("/", zoneRoutes);

app.listen(serverConfig.port, () => {
  console.log("Server listening on port ", serverConfig.port);
});
