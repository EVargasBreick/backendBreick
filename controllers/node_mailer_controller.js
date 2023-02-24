const express = require("express");
var nodemailer = require("nodemailer");
module.exports = {
  sendOrderGmail: (req, res) => {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "evargas@breick.com.bo",
        pass: "nxwffbkofdqknfpe",
      },
    });

    var mailOptions = {
      from: "evargas@breick.com.bo",
      to: "eric.vargas.kubber@gmail.com",
      subject: "Pedido creado",
      html: `<h1>El usuario con correo ${req.body.correoUsuario} \nha creado un pedido con codigo ${req.body.codigoPedido}\n en fecha ${req.body.fecha}</h1>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        res.status(500).send(error.message);
      } else {
        res.status(200).json(req.body);
      }
    });
  },
};
