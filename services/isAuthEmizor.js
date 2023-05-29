const emizor = require("../models/emizor_model");

async function isAuthEmizor(req, res, next) {
  const emizorToken = await emizor.getEmizorToken();
  if (emizorToken) {
    const fechaHora = new Date(emizorToken.fechaHora);
    const fechaHoraActual = new Date();
    const diferencia = fechaHora - fechaHoraActual;
    const diferenciaDias = parseInt(diferencia / (1000 * 60 * 60 * 24));
    console.log(
      "🚀 ~ file: isAuthEmizor.js:10 ~ isAuthEmizor ~ diferenciaDias:",
      diferenciaDias
    );
    if (diferenciaDias < 10) {
      const postOauthToken = await emizor.postOauthToken();
      console.log("Actualizando token");
      console.log("postOauthToken: ", postOauthToken);
    }
  }

  next();
}

module.exports = isAuthEmizor;
