const emizor = require("../models/emizor_model");

async function isInternalAuthEmizor(req, res, next) {
  const emizorToken = await emizor.getEmizorToken();
  if (emizorToken) {
    const fechaHora = new Date(emizorToken.fechaHora);
    const fechaHoraActual = new Date();
    const diferencia = fechaHora - fechaHoraActual;
    const diferenciaDias = parseInt(diferencia / (1000 * 60 * 60 * 24));
    if (diferenciaDias < 2) {
      const postOauthToken = await emizor.postOauthToken();
      console.log("Actualizando token");
      console.log("postOauthToken: ", postOauthToken);
    } else {
      return "Bearer " + emizorToken.token;
    }
  }
}

module.exports = isInternalAuthEmizor;
