const express = require("express");
const {
  getProducts,
  getNumberOfProducts,
  getAvailableProducts,
  getProductsWithStock,
} = require("../models/ProductModel");

module.exports = {
  findProduct: (req, res) => {
    const productPromise = getProducts(req.query);
    var responseObject = {};
    productPromise.then((productData) => {
      productResponse = JSON.parse(productData);
      if (productData[0]) {
        responseObject.data = productResponse;
        responseObject.message = "Producto Encontrado";
        responseObject.code = 200;
        res.status(responseObject.code).send(responseObject);
      } else {
        responseObject.data = [];
        responseObject.message = "Producto no encontrado";
        responseObject.code = 200;
        res.status(responseObject.code).send(responseObject);
      }
    });
  },
  getAvailableProduct: (req, res) => {
    const products = getAvailableProducts(req.query.id);
    var responseObject = {};
    products.then((productData) => {
      productResponse = JSON.parse(productData);
      if (productResponse[0][0]) {
        responseObject.data = productResponse;
        responseObject.message = "Producto Encontrado";
        responseObject.code = 200;
        res.status(responseObject.code).send(responseObject);
      } else {
        responseObject.data = [];
        responseObject.message = "Producto no encontrado";
        responseObject.code = 200;
        res.status(responseObject.code).send(responseObject);
      }
    });
  },
  numberOfProducts: (req, res) => {
    const number = getNumberOfProducts();
    number.then((response) => {
      var resp = JSON.parse(response);
      res.status(resp.code).send(resp);
    });
  },
  productsWithStock: (req, res) => {
    const plist = getProductsWithStock(req.query);
    plist.then((response) => {
      var resp = JSON.parse(response);
      res.status(200).send(resp);
    });
  },
};
