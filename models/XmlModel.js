const axios = require("axios");
const xml2js = require("xml2js");
const xmlConfig = require("../config/xmlConfig.json");
const dbConnection = require("../server");
function xmlLogin(body) {
  return new Promise(async (resolve, reject) => {
    const builder = new xml2js.Builder({
      rootName: "soap:Envelope",
      xmldec: {
        version: "1.0",
        encoding: "UTF-8",
      },
      renderOpts: {
        pretty: false,
        indent: " ",
        newline: "\n",
      },
      headless: true,
    });
    const config = {
      headers: {
        "Content-Type": "text/xml;charset=UTF-8",
        SOAPAction: "http://comfiar.com.ar/webservice/IniciarSesion",
      },
    };
    const jsonBody = {
      $: {
        "xmlns:soap": "http://schemas.xmlsoap.org/soap/envelope/",
        "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
        "xmlns:xsd": "http://www.w3.org/2001/XMLSchema",
      },
      "soap:Body": {
        IniciarSesion: {
          $: {
            xmlns: "http://comfiar.com.ar/webservice/",
          },
          usuarioId: `${body.email}`,
          password: `${body.password}`,
        },
      },
    };
    const xmlBody = builder.buildObject(jsonBody);
    try {
      const response = await axios.post(
        `${xmlConfig.xmlUrl}/ws/WSComfiar.asmx`,
        xmlBody,
        config
      );
      xml2js.parseString(response.data, (err, result) => {
        if (err) {
          reject({ data: "error", code: 500 });
        } else {
          const {
            "soap:Envelope": {
              "soap:Body": [body],
            },
          } = result;
          const fechaVen =
            body.IniciarSesionResponse[0].IniciarSesionResult[0]
              .FechaVencimiento[0];
          const token =
            body.IniciarSesionResponse[0].IniciarSesionResult[0].SesionId[0];
          const inserted = insertToken(token, fechaVen);
          inserted
            .then((res) => {
              console.log("Token actualizado", res);
              resolve({ data: "success", code: 200 });
            })
            .catch((err) => {
              console.log("Error al actualizar el token", err);
              reject({ data: "error", code: 500 });
            });
        }
      });
    } catch (error) {
      console.log(error);
      reject({ data: "error", code: 500 });
    }
  });
}

function insertToken(token, fecha) {
  const queryInsertToken = `update TokenComfiar set stringToken='${token}', 
    fechaHora='${fecha}' where idToken=1`;
  console.log("Query pa guardar", queryInsertToken);
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const added = await dbConnection.executeQuery(queryInsertToken);
      if (added.success) {
        resolve(added);
      } else {
        reject(added);
      }
    }, 100);
  });
}

function verifyToken() {
  const queryToken =
    "select cast(fechaHora as varchar(50)) as fechaHora, stringToken from TokenComfiar";
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const isValid = await dbConnection.executeQuery(queryToken);
      if (isValid.success) {
        console.log("Respuesta del query de validez bien", isValid.data[0][0]);
        const stringToken = isValid.data[0][0].stringToken;
        const databaseDateString = isValid.data[0][0].fechaHora;
        const databaseDate = new Date(databaseDateString);
        const currentDate = new Date();
        if (databaseDate.getTime() > currentDate.getTime()) {
          resolve({ fecha: databaseDateString, sesionId: stringToken });
        } else {
          console.log("Token pasado");
          reject(false);
        }
      } else {
        console.log(isValid, "Respuesta del query de validez mal");
      }
    }, 100);
  });
}

function getLastId(body) {
  console.log("Body recibido", body);
  return new Promise((resolve, reject) => {
    const verifiedToken = verifyToken();
    verifiedToken
      .then(async ({ fecha, sesionId }) => {
        let dateparts = fecha.split(" ");
        let date2 = `${dateparts[0]}T${dateparts[1]}`;
        const builder = new xml2js.Builder({
          rootName: "soap:Envelope",
          xmldec: {
            version: "1.0",
            encoding: "UTF-8",
          },
          renderOpts: {
            pretty: false,
            indent: " ",
            newline: "\n",
          },
          headless: true,
        });
        const config = {
          headers: {
            "Content-Type": "text/xml;charset=UTF-8",
            SOAPAction:
              "http://comfiar.com.ar/webservice/UltimoNumeroComprobante",
          },
        };
        const jsonBody = {
          $: {
            "xmlns:soap": "http://schemas.xmlsoap.org/soap/envelope/",
            "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            "xmlns:xsd": "http://www.w3.org/2001/XMLSchema",
          },
          "soap:Body": {
            UltimoNumeroComprobante: {
              $: {
                xmlns: "http://comfiar.com.ar/webservice/",
              },
              cuitId: `${body.nit}`,
              puntoDeVentaId: `${body.puntoDeVentaId}`,
              tipoDeComprobanteId: `${body.tipoComprobante}`,
              token: {
                SesionId: `${sesionId}`,
                FechaVencimiento: `${date2}`,
              },
            },
          },
        };
        const xmlBody = builder.buildObject(jsonBody);
        try {
          const response = await axios.post(
            `${xmlConfig.xmlUrl}/ws/WSComfiar.asmx`,
            xmlBody,
            config
          );
          xml2js.parseString(response.data, (err, result) => {
            if (err) {
              reject(err);
            } else {
              const {
                "soap:Envelope": {
                  "soap:Body": [body],
                },
              } = result;
              const ultimoId =
                body.UltimoNumeroComprobanteResponse[0]
                  .UltimoNumeroComprobanteResult[0];
              resolve(ultimoId);
            }
          });
        } catch (error) {
          console.log(error);
          reject(error);
        }
      })
      .catch((err) => {
        console.log("Token pasado, reiniciando sesion", err);
        const newLogin = xmlLogin({
          email: xmlConfig.comfiarUser,
          password: xmlConfig.comfiarPassword,
        });
        newLogin
          .then((nl) => {
            console.log("Obtener id", nl);
            const tryAgain = getLastId(body);
            tryAgain
              .then((resp) => {
                console.log("Tried again", resp);
                resolve(resp);
              })
              .catch((error) => {
                console.log("Error al tratar", error);
                reject(false);
              });
          })
          .catch((error) => {
            console.log("Error", error);
          });
      });
  });
}

function authorizeInvoice(body) {
  return new Promise(async (resolve, reject) => {
    const verifiedToken = verifyToken();
    verifiedToken
      .then(async ({ fecha, sesionId }) => {
        let dateparts = fecha.split(" ");
        let date2 = `${dateparts[0]}T${dateparts[1]}`;
        const builder = new xml2js.Builder({
          rootName: "soap:Envelope",
          xmldec: {
            version: "1.0",
            encoding: "UTF-8",
          },
          renderOpts: {
            pretty: false,
            indent: " ",
            newline: "\n",
          },
          headless: true,
        });
        const config = {
          headers: {
            "Content-Type": "text/xml;charset=UTF-8",
            SOAPAction:
              "http://comfiar.com.ar/webservice/AutorizarComprobantesAsincronico",
          },
        };
        const jsonBody = {
          $: {
            "xmlns:soap": "http://schemas.xmlsoap.org/soap/envelope/",
            "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            "xmlns:xsd": "http://www.w3.org/2001/XMLSchema",
          },
          "soap:Body": {
            AutorizarComprobantesAsincronico: {
              $: {
                xmlns: "http://comfiar.com.ar/webservice/",
              },
              XML: `${body.XML}`,
              cuitAProcesar: `${body.nit}`,
              puntoDeVentaId: `${body.idSucursal}`,
              tipoDeComprobanteId: `${body.tipoComprobante}`,
              formatoId: body.formatoId,
              token: {
                SesionId: `${sesionId}`,
                FechaVencimiento: `${date2}`,
              },
            },
          },
        };
        const xmlBody = builder.buildObject(jsonBody);
        try {
          const response = await axios.post(
            `${xmlConfig.xmlUrl}/ws/WSComfiar.asmx`,
            xmlBody,
            config
          );
          xml2js.parseString(response.data, (err, result) => {
            if (err) {
              reject(err);
            } else {
              const {
                "soap:Envelope": {
                  "soap:Body": [body],
                },
              } = result;
              const cufResponse =
                body.AutorizarComprobantesAsincronicoResponse[0]
                  .AutorizarComprobantesAsincronicoResult[0];

              resolve(cufResponse);
            }
          });
        } catch (error) {
          console.log(error);
          reject(error);
        }
      })
      .catch((err) => {
        console.log("Token pasado, reiniciando sesion", err);
        const newLogin = xmlLogin({
          email: xmlConfig.comfiarUser,
          password: xmlConfig.comfiarPassword,
        });
        newLogin
          .then((nl) => {
            console.log("Obtener id", nl);
            const tryAgain = authorizeInvoice(body);
            tryAgain
              .then((resp) => {
                console.log("Tried again", resp);
                resolve(resp);
              })
              .catch((error) => {
                console.log("Error al tratar", error);
                reject(false);
              });
          })
          .catch((error) => {
            console.log("Error", error);
          });
      });
  });
}

function InvoiceOut(body) {
  console.log("Body recibido", body);
  return new Promise((resolve, reject) => {
    const verifiedToken = verifyToken();
    verifiedToken
      .then(async ({ fecha, sesionId }) => {
        let dateparts = fecha.split(" ");
        let date2 = `${dateparts[0]}T${dateparts[1]}`;
        const builder = new xml2js.Builder({
          rootName: "soap:Envelope",
          xmldec: {
            version: "1.0",
            encoding: "UTF-8",
          },
          renderOpts: {
            pretty: false,
            indent: " ",
            newline: "\n",
          },
          headless: true,
        });
        const config = {
          headers: {
            "Content-Type": "text/xml;charset=UTF-8",
            SOAPAction:
              "http://comfiar.com.ar/webservice/SalidaTransaccionBolivia",
          },
        };
        const jsonBody = {
          $: {
            "xmlns:soap": "http://schemas.xmlsoap.org/soap/envelope/",
            "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            "xmlns:xsd": "http://www.w3.org/2001/XMLSchema",
          },
          "soap:Body": {
            SalidaTransaccionBolivia: {
              $: {
                xmlns: "http://comfiar.com.ar/webservice/",
              },
              cuitId: `${body.nit}`,
              transaccionId: body.id,
              token: {
                SesionId: `${sesionId}`,
                FechaVencimiento: `${date2}`,
              },
            },
          },
        };
        const xmlBody = builder.buildObject(jsonBody);
        try {
          const response = await axios.post(
            `${xmlConfig.xmlUrl}/ws/WSComfiar.asmx`,
            xmlBody,
            config
          );
          xml2js.parseString(response.data, (err, result) => {
            if (err) {
              reject(err);
            } else {
              const {
                "soap:Envelope": {
                  "soap:Body": [body],
                },
              } = result;

              resolve(body);
            }
          });
        } catch (error) {
          console.log(error);
          reject(error);
        }
      })
      .catch((err) => {
        console.log("Token pasado, reiniciando sesion", err);
        const newLogin = xmlLogin({
          email: xmlConfig.comfiarUser,
          password: xmlConfig.comfiarPassword,
        });
        newLogin
          .then((nl) => {
            console.log("Obtener id", nl);
            const tryAgain = InvoiceOut(body);
            tryAgain
              .then((resp) => {
                console.log("Tried again", resp);
                resolve(resp);
              })
              .catch((error) => {
                console.log("Error al tratar", error);
                reject(false);
              });
          })
          .catch((error) => {
            console.log("Error", error);
          });
      });
  });
}

function cancelInvoice(body) {
  console.log("Body recibido", body);
  return new Promise((resolve, reject) => {
    const verifiedToken = verifyToken();
    verifiedToken
      .then(async ({ fecha, sesionId }) => {
        let dateparts = fecha.split(" ");
        let date2 = `${dateparts[0]}T${dateparts[1]}`;
        const builder = new xml2js.Builder({
          rootName: "soap:Envelope",
          xmldec: {
            version: "1.0",
            encoding: "UTF-8",
          },
          renderOpts: {
            pretty: false,
            indent: " ",
            newline: "\n",
          },
          headless: true,
        });
        const config = {
          headers: {
            "Content-Type": "text/xml;charset=UTF-8",
            SOAPAction: "http://comfiar.com.ar/webservice/AnularComprobante",
          },
        };
        const jsonBody = {
          $: {
            "xmlns:soap": "http://schemas.xmlsoap.org/soap/envelope/",
            "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            "xmlns:xsd": "http://www.w3.org/2001/XMLSchema",
          },
          "soap:Body": {
            AnularComprobante: {
              $: {
                xmlns: "http://comfiar.com.ar/webservice/",
              },
              token: {
                SesionId: `${sesionId}`,
                FechaVencimiento: `${date2}`,
              },
              usuarioId: `${xmlConfig.comfiarUser}`,
              transaccionId: body.transaccionId,
              cuitId: `${body.nit}`,
              puntoDeVentaId: body.puntoDeVentaId,
              tipoComprobanteId: body.tipoComprobante,
              numeroComprobante: body.numeroComprobante,
              motivoAnulacion: body.motivoAnulacion,
            },
          },
        };
        const xmlBody = builder.buildObject(jsonBody);
        console.log("Body xml", xmlBody);
        try {
          const response = await axios.post(
            `${xmlConfig.xmlUrl}/ws/WSComfiar.asmx`,
            xmlBody,
            config
          );
          xml2js.parseString(response.data, (err, result) => {
            if (err) {
              reject(err);
            } else {
              const {
                "soap:Envelope": {
                  "soap:Body": [body],
                },
              } = result;

              resolve(body);
            }
          });
        } catch (error) {
          console.log(error);
          reject(error);
        }
      })
      .catch((err) => {
        console.log("Token pasado, reiniciando sesion", err);
        const newLogin = xmlLogin({
          email: xmlConfig.comfiarUser,
          password: xmlConfig.comfiarPassword,
        });
        newLogin
          .then((nl) => {
            console.log("Obtener id", nl);
            const tryAgain = cancelInvoice(body);
            tryAgain
              .then((resp) => {
                console.log("Tried again", resp);
                resolve(resp);
              })
              .catch((error) => {
                console.log("Error al tratar", error);
                reject(false);
              });
          })
          .catch((error) => {
            console.log("Error", error);
          });
      });
  });
}

module.exports = {
  xmlLogin,
  getLastId,
  authorizeInvoice,
  InvoiceOut,
  cancelInvoice,
};
