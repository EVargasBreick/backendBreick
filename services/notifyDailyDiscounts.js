const { client } = require("../postgressConn");
const dateString = require("./dateServices");
var nodemailer = require("nodemailer");
const { google } = require("googleapis");
const path = require("path");

async function logDiscounts() {
  try {
    const date = dateString();
    const dateSplitted = date.split(" ");
    const dateOnly = dateSplitted[0];
    //
    const query = `select usuario , concat("nombre",' ',"apPaterno") as nombre_completo, count(descuento), sum(v."descuentoCalculado")  from ventas v 
    inner join usuarios u on u."idUsuario"=v."idUsuarioCrea" 
    inner join facturas f on f."idFactura"=v."idFactura" 
    where descuento>0  and f.estado='0'
    and f."fechaHora" like '%${dateOnly}%'
    group by ( usuario,concat("nombre",' ',"apPaterno")) 
    order by sum(v."descuentoCalculado") desc`;
    const fullData = await client.query(query);
    fullData.rows.length > 0 && sendDiscountsMail(fullData.rows, dateOnly);
  } catch (error) {
    console.log("Error al enviar la info de descuentos", error);
  }
}

const htmlStructure = async (data, dateOnly) => {
  const rowsHtml = data
    .map((entry) => {
      return `<tr>
    <td>${entry.nombre_completo}</td>
    <td>${entry.usuario}</td>
    <td>${entry.count}</td>
    <td>${entry.sum?.toFixed(2)}</td>
  </tr>`;
    })
    .join("");

  const currentYear = new Date().getFullYear();

  const html = `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>My Page</title>
        <style>
          header {
            background-color: #6a4593;
            color: white;
            text-align: center;
            padding: 10px;
          }
        
          body {
            background-color: #6a4593;
            color: white;
            text-align: center;
            padding: 10px;
          }
        

          footer {
            background-color: #6a4593;
            color: white;
            text-align: center;
            padding: 10px;
          }

          th, td {
            padding: 8px;
            text-align: center; /* Center the content of cells */
          }
    
          th {
            background-color: #6a4593;
            color: white;
          }
    
          tr:nth-child(even) {
            background-color: #f2f2f2;
          }
          
        </style>
      </head>
      <body>
        <header>
        <img src="cid:breicklogo" style="width: 100px;">
          <h2>Reporte diario de descuentos para ${dateOnly}</h2>
        </header>
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Usuario</th>
            <th>Cantidad de ventas con descuento</th>
            <th>Total descuentos en Bs.</th>
          </tr>
        </thead>
       <tbody>
          ${rowsHtml}
       </tbody>
      </table>
        <footer>
          <p>${currentYear} Incadex S.R.L.</p>
        </footer>
      </body>
    </html>`;

  return html;
};

async function sendDiscountsMail(data, dateOnly) {
  try {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.NODEMAILER_CLIENTID,
      process.env.NODEMAILER_CLIENT_SECRET,
      process.env.REDIRECT_URI
    );
    oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
    const accessToken = await oAuth2Client.getAccessToken();

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.INFOMAIL,
        clientId: process.env.NODEMAILER_CLIENTID,
        clientSecret: process.env.NODEMAILER_CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });
    var mailOptions = {
      from: `Sistema de Ventas Breick <${process.env.INFOMAIL}>`,
      to: "evargas@breick.com.bo",
      subject: `Reporte diario de descuentos`,
      html: await htmlStructure(data, dateOnly),
      attachments: [
        {
          filename: "BreickSimple.png",
          path: path.join(__dirname, "../assets/BreickSimple.png"),
          cid: "breicklogo",
        },
      ],
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("Error al enviar el mail", error);
      } else {
        console.log("Mail enviado correctamente");
      }
    });
  } catch (error) {
    console.log("ERROR FATAL AL ENVIAR EL EMAIL", error);
    return Promise.reject(error);
  }
}

/* <td align="center" style="background-color: #f1f1f1; padding: 35px;">
          
          </td> */
module.exports = logDiscounts;