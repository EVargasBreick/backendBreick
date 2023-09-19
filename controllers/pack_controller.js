const {
  registerPack,
  getPacks,
  addIdToPack,
  registerPackPos,
  getPacksPos,
  addIdToPackPos,
  updatePack,
} = require("../models/pack_model");

module.exports = {
  registerPack: (req, res) => {
    const ids = registerPackPos(req.body);
    ids
      .then((id) => {
        res.status(200).send(id);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  },
  getPacks: (req, res) => {
    const list = getPacksPos();
    list
      .then((resp) => {
        res.status(200).send(resp);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  },
  updatePackId: (req, res) => {
    const list = addIdToPackPos(req.query);
    list
      .then((resp) => {
        res.status(200).send(resp);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  },
  update_pack: (req, res) => {
    const { productos = [], total = 0 } = req.body
    const updatedPack = updatePack(productos, total)
    updatedPack
      .then((resp) => {
        res.status(200).send(resp);
      }
      ).catch((err) => {
        res.status(500).send(err);
      })
  }
};
