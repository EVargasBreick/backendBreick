const { createDrop, createDropPos } = require("../models/drop_model");

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
};
