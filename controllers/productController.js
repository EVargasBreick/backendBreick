const express = require("express");
const {
  getProducts,
  getNumberOfProducts,
  getAvailableProducts,
  getProductsWithStock,
  getProductsDiscount,
  createProduct,
  getInternalAndBarcode,
  getProdTypes,
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
  productsDiscount: (req, res) => {
    const pdisc = getProductsDiscount(req.query);
    pdisc.then((response) => {
      var resp = JSON.parse(response);
      res.status(200).send(resp);
    });
  },
  createProduct: (req, res) => {
    const created = createProduct(req.body);
    created
      .then((cr) => {
        res.status(200).send(cr);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  },
  getCodes: (req, res) => {
    const ids = getInternalAndBarcode();
    ids
      .then((id) => {
        res.status(200).send(id);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  },
  getProdTypes: (req, res) => {
    const ids = getProdTypes();
    ids
      .then((id) => {
        res.status(200).send(id);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  },
};
