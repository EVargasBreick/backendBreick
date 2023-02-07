const { createDrop } = require("../models/DropModel");

module.exports = {
  createDrop: (req, res) => {
    const rej = createDrop(req.body);
    rej
      .then((id) => {
        res.status(200).send(id);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  },
};
