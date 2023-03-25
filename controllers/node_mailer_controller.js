const express = require("express");
var nodemailer = require("nodemailer");
const { google } = require("googleapis");
const path = require("path");
module.exports = {
  sendOrderGmail: (req, res) => {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.NODEMAILER_CLIENTID,
      process.env.NODEMAILER_CLIENT_SECRET,
      process.env.REDIRECT_URI
    );

    oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

    async function sendMail() {
      const accessToken = await oAuth2Client.getAccessToken();
      const mailBody = `<!DOCTYPE html>
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
        
          footer {
            background-color: #6a4593;
            color: white;
            text-align: center;
            padding: 10px;
          }
          
        </style>
      </head>
      <body>
        <header>
        <img src="cid:image1">
          <h1>${req.body.header}</h1>
        </header>
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td align="center" style="background-color: #f1f1f1; padding: 35px;">
            <p style="font-family: Arial, sans-serif; font-size: 22px; color: #333;">El usuario con correo ${req.body.correoUsuario}\nha creado un ${req.body.tipo} con codigo ${req.body.codigoPedido}\n en fecha ${req.body.fecha}</p>
          </td>
        </tr>
      </table>
         
      
        <footer>
          <p>2023 Incadex S.R.L.</p>
        </footer>
      </body>
    </html>`;

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
        to: req.body.email,
        subject: `${req.body.tipo} creado`,
        html: `<!DOCTYPE html>
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
          
            footer {
              background-color: #6a4593;
              color: white;
              text-align: center;
              padding: 10px;
            }
            
          </style>
        </head>
        <body>
          <header>
          <img src="cid:breicklogo" style="width: 100px;">
            <h1>${req.body.header}</h1>
          </header>
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td align="center" style="background-color: #f1f1f1; padding: 35px;">
              <p style="font-family: Arial, sans-serif; font-size: 22px; color: #333;">El usuario con correo ${req.body.correoUsuario}\nha creado un ${req.body.tipo} con codigo ${req.body.codigoPedido}\n en fecha ${req.body.fecha}</p>
            </td>
          </tr>
        </table>
           
        
          <footer>
            <p>2023 Incadex S.R.L.</p>
          </footer>
        </body>
      </html>`,
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
          console.log(error);
          res.status(500).send(error.message);
        } else {
          res.status(200).json(req.body);
        }
      });
    }
    sendMail();
  },
};
