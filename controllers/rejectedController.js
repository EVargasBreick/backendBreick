const {
  logRejectedOrder,
  getRejected,
  revisedRejected,
} = require("../models/RejectedModel");

module.exports = {
  logRejected: (req, res) => {
    const rej = logRejectedOrder(req.body);
    rej
      .then((id) => {
        res.status(200).send(id);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  },
  getRejected: (req, res) => {
    const rej = getRejected();
    rej
      .then((id) => {
        res.status(200).send(id);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  },
  reviseRejected: (req, res) => {
    const rej = revisedRejected(req.query);
    rej
      .then((id) => {
        res.status(200).send(id);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  },
};
