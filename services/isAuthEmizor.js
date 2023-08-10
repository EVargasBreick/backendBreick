const emizor = require("../models/emizor_model");

async function isAuthEmizor(req, res, next) {
  const emizorToken = await emizor.getEmizorToken();
  if (emizorToken) {
    const fechaHora = new Date(emizorToken.fechaHora);
    const fechaHoraActual = new Date();
    const diferencia = fechaHora - fechaHoraActual;
    const diferenciaDias = parseInt(diferencia / (1000 * 60 * 60 * 24));
    if (diferenciaDias < 2) {
      console.log("Token vencido");
      const postOauthToken = await emizor.postOauthToken();
      console.log("Actualizando token");
      console.log(
        "postOauthToken: ",
        JSON.parse(postOauthToken).data.access_token
      );
      req.headers.authorization =
        "Bearer " + JSON.parse(postOauthToken).data.access_token;
    } else {
      req.headers.authorization = "Bearer " + emizorToken.token;
    }
  }

  next();
}

module.exports = isAuthEmizor;
