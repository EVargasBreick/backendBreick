const conversor = require("conversor-numero-a-letras-es-ar");

const convertToText = (number) => {
  const entero = Math.trunc(number);
  const resto = Math.trunc(((number - Math.trunc(number)) * 100).toFixed(2));
  let ClaseConversor = conversor.conversorNumerosALetras;
  let miConversor = new ClaseConversor();
  var texto = miConversor.convertToText(entero);
  return {
    texto,
    resto,
  };
};

module.exports = { convertToText };
