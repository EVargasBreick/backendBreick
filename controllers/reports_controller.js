const express = require("express");
const sessionParams = require("../server");
const session = require("express-session");
const app = express();
const {
  GeneralSalesReport,
  ProductsSalesReport,
  ClosingReport,
  FirstAndLast,
  GeneralSalesReportPos,
  ProductsSalesReportPos,
  ClosingReportPos,
  FirstAndLastPos,
  mainPageReportPos,
  GeneralMarkdownsReport,
  GroupedProductsOrderReport,
  SalesByStoreReport,
  SalesBySalespersonReport,
  virtualStockReport,
} = require("../models/reports_model.js");
app.use(session(sessionParams));

module.exports = {
  generalSalesReport: (req, res) => {
    const data = GeneralSalesReportPos(req.query);
    data
      .then((dt) => {
        res.status(200).send(dt);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  },
  productSalesReport: (req, res) => {
    const data = ProductsSalesReportPos(req.query);
    data
      .then((dt) => {
        res.status(200).send(dt);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  },
  closingDayReport: (req, res) => {
    const data = ClosingReportPos(req.query);
    data
      .then((dt) => {
        res.status(200).send(dt);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  },
  firstAndLast: (req, res) => {
    const data = FirstAndLastPos(req.query);
    data
      .then((dt) => {
        res.status(200).send(dt);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  },
  mainReport: (req, res) => {
    const data = mainPageReportPos();
    data
      .then((dt) => {
        res.status(200).send(dt);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  },
  markdownsReport: async (req, res) => {
    const { idAgencia, startDate, endDate, idBaja } = req.query;
    try {
      const markdowns = await GeneralMarkdownsReport(
        idAgencia,
        startDate,
        endDate,
        idBaja
      );
      res.status(200).json(markdowns);
    } catch (err) {
      res
        .status(500)
        .json({ error: err || "An error occurred while fetching markdowns." });
    }
  },
  orderGroupedProductsReport: async (req, res) => {
    console.log("Req query", req.query);
    const {
      idAgencia,
      startDate,
      endDate,
      estado,
      usuario,
      tipo,
      facturado,
      notas,
    } = req.query;
    try {
      const markdowns = await GroupedProductsOrderReport(
        idAgencia,
        startDate,
        endDate,
        estado,
        usuario,
        tipo,
        facturado,
        notas
      );
      res.status(200).json(markdowns);
    } catch (err) {
      res
        .status(500)
        .json({ error: err || "An error occurred while fetching the report." });
    }
  },
  salesByStoreReport: async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
      const storeData = await SalesByStoreReport(startDate, endDate);
      res.status(200).json(storeData);
    } catch (err) {
      res
        .status(500)
        .json({ error: err || "An error occurred while fetching markdowns." });
    }
  },
  salesBySalespersonReport: async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
      const personData = await SalesBySalespersonReport(startDate, endDate);
      res.status(200).json(personData);
    } catch (err) {
      res
        .status(500)
        .json({ error: err || "An error occurred while fetching markdowns." });
    }
  },
  virtualStockReport: async (req, res) => {
    try {
      const reportData = await virtualStockReport(req.query);
      res.status(200).json(reportData);
    } catch (err) {
      res
        .status(500)
        .json({ error: err || "An error occurred while fetching markdowns." });
    }
  },
};
