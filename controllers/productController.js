const express = require("express");
const getProducts = require("../models/ProductModel");
const app = express();

module.exports = {
  findProduct: (req, res) => {
    const productPromise = getProducts(req.query);
    var responseObject = {};
    productPromise.then((productData) => {
      productResponse = JSON.parse(productData);
      if (productResponse[0][0]) {
        responseObject.data = productResponse;
        responseObject.message = "Producto Encontrado";
        responseObject.code = 200;
        res.status(responseObject.code).send(JSON.stringify(responseObject));
      } else {
        responseObject.data = [];
        responseObject.message = "Producto no encontrado";
        responseObject.code = 200;
        res.status(responseObject.code).send(JSON.stringify(responseObject));
      }
    });
  },
};
