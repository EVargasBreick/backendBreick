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
  getProdOrigin,
  getNumberOfProductsPos,
  getProductsWithStockPos,
  getProductsDiscountPos,
  createProductPos,
  getInternalAndBarcodePos,
  getProdTypesPos,
  getProdOriginPos,
  getAvailableProductsPos,
  getProductsPos,
  getAllProducts,
} = require("../models/product_model");

module.exports = {
  findProduct: (req, res) => {
    const productPromise = getProductsPos(req.query);
    var responseObject = {};
    productPromise.then((productData) => {
      productResponse = JSON.parse(productData);

      if (productData.length > 0) {
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
    const products = getAvailableProductsPos(req.query.id);
    var responseObject = {};
    products.then((productData) => {
      productResponse = JSON.parse(productData);

      if (productResponse[0]) {
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
    const number = getNumberOfProductsPos();
    number.then((response) => {
      var resp = JSON.parse(response);
      res.status(resp.code).send(resp);
    });
  },
  productsWithStock: (req, res) => {
    const plist = getProductsWithStockPos(req.query);
    plist.then((response) => {
      var resp = JSON.parse(response);
      res.status(200).send(resp);
    });
  },
  productsDiscount: (req, res) => {
    const pdisc = getProductsDiscountPos(req.query);
    pdisc.then((response) => {
      var resp = JSON.parse(response);
      res.status(200).send(resp);
    });
  },
  createProduct: (req, res) => {
    const created = createProductPos(req.body);
    created
      .then((cr) => {
        res.status(200).send(cr);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  },
  getCodes: (req, res) => {
    const ids = getInternalAndBarcodePos();
    ids
      .then((id) => {
        res.status(200).send(id);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  },
  getProdTypes: (req, res) => {
    const ids = getProdTypesPos();
    ids
      .then((id) => {
        res.status(200).send(id);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  },
  getProdOrigin: (req, res) => {
    const ids = getProdOriginPos();
    ids
      .then((id) => {
        res.status(200).send(id);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  },
  geAllProducts: async (req, res) => {
    try {
      const markdowns = await getAllProducts();
      res.status(200).json(markdowns);
    } catch (err) {
      res.status(500).json({ error: err || 'An error occurred while fetching products.' });
    }
  }
};
