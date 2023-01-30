const { registerPack, getPacks, addIdToPack } = require("../models/PackModel");

module.exports = {
  registerPack: (req, res) => {
    const ids = registerPack(req.body);
    ids
      .then((id) => {
        res.status(200).send(id);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  },
  getPacks: (req, res) => {
    const list = getPacks();
    list
      .then((resp) => {
        res.status(200).send(resp);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  },
  updatePackId: (req, res) => {
    const list = addIdToPack(req.query);
    list
      .then((resp) => {
        res.status(200).send(resp);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  },
};
