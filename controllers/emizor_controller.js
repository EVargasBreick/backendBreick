const { createInvoiceEmizor } = require("../models/emizor_model");

module.exports = {
  sendInvoiceEmizor: (req, res) => {
    const rej = createInvoiceEmizor(req.body);
    rej
      .then((response) => {
        res.status(200).send(response);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  },
};
