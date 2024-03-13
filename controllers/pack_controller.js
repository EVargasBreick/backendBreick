const {
  registerPack,
  getPacks,
  addIdToPack,
  registerPackPos,
  getPacksPos,
  addIdToPackPos,
  updatePack,
  changePackStatus,
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
    const { productos = [], total = 0, nombrePack = '' } = req.body;
    const updatedPack = updatePack(productos, total, nombrePack);
    updatedPack
      .then((resp) => {
        res.status(200).send(resp);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  },
  change_status: (req, res) => {
    const { idPack, estado } = req.body;
    const updatedPack = changePackStatus(idPack, estado);
    updatedPack
      .then((resp) => {
        res.status(200).send(resp);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  },
};
