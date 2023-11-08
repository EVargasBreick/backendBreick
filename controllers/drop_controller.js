const {
  createDrop,
  createDropPos,
  getDropInfo,
  cancelDrop,
} = require("../models/drop_model");

module.exports = {
  createDrop: (req, res) => {
    const rej = createDropPos(req.body);
    rej
      .then((id) => {
        res.status(200).send(id);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  },
  cancelDrop: (req, res) => {
    const { idBaja, idUsuario, productos } = req.body;
    consosle.log("Test");
    const rej = cancelDrop(idBaja, idUsuario, productos);
    rej
      .then((id) => {
        res.status(200).send(id);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  },
  dropInfo: (req, res) => {
    const { idBaja } = req.query;
    const rej = getDropInfo(idBaja);
    rej
      .then((id) => {
        res.status(200).send(id);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  },
};
