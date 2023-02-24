const {
  logRejectedOrder,
  getRejected,
  revisedRejected,
  logRejectedOrderPos,
  getRejectedPos,
  revisedRejectedPos,
} = require("../models/rejected_model.js");

module.exports = {
  logRejected: (req, res) => {
    const rej = logRejectedOrderPos(req.body);
    rej
      .then((id) => {
        res.status(200).send(id);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  },
  getRejected: (req, res) => {
    const rej = getRejectedPos();
    rej
      .then((id) => {
        res.status(200).send(id);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  },
  reviseRejected: (req, res) => {
    const rej = revisedRejectedPos(req.query);
    rej
      .then((id) => {
        res.status(200).send(id);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  },
};
