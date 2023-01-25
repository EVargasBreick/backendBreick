const { registerPack, getPacks } = require("../models/PackModel");

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
      .then((res) => {
        res.status(200).send(JSON.stringify(res.data));
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  },
};
