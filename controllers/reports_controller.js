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
  traspasosAgencyReport,
  GroupedProductReport,
  GroupedSalesByProdSellerReport,
  SalesByDayReport,
  MonthlyGoalReport,
  GetRemainingGoal,
  GetSamplesReport,
  GetProductInSamplesReport,
  getTransferProductsByStore,
  getSimpleTransferReport,
  getDailyDiscountsReport,
  getCanceledInvoices,
  getPastSalesByProductReport,
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
    const { startDate, endDate, startHour, endHour } = req.query;
    try {
      const personData = await SalesBySalespersonReport(
        startDate,
        endDate,
        startHour,
        endHour
      );
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
  traspasosAgenciasReport: async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
      const reportData = await traspasosAgencyReport(startDate, endDate);
      res.status(200).json(reportData);
    } catch (err) {
      res
        .status(500)
        .json({ error: err || "An error occurred while fetching markdowns." });
    }
  },
  groupedProdReport: async (req, res) => {
    console.log("Lo que llego aca", req.query);
    const {
      idAgencia,
      startDate,
      endDate,
      selectedClient,
      selectedSalesman,
      criteria,
    } = req.query;
    try {
      const repData = await GroupedProductReport(
        idAgencia,
        startDate,
        endDate,
        selectedClient,
        selectedSalesman,
        criteria
      );
      res.status(200).json(repData);
    } catch (err) {
      console.log("ERROR ACA", err);
      res
        .status(500)
        .json({ error: err || "An error occurred while fetching reports." });
    }
  },
  groupedSalesProdSeller: async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
      const repData = await GroupedSalesByProdSellerReport(startDate, endDate);
      res.status(200).json(repData);
    } catch (err) {
      res
        .status(500)
        .json({ error: err || "An error occurred while fetching reports." });
    }
  },
  salesByDay: async (req, res) => {
    const { month, year } = req.query;
    try {
      const repData = await SalesByDayReport(month, year);
      res.status(200).json(repData);
    } catch (err) {
      res
        .status(500)
        .json({ error: err || "An error occurred while fetching reports." });
    }
  },
  monthlyGoals: async (req, res) => {
    const { month, year } = req.query;
    try {
      const repData = await MonthlyGoalReport(month, year);
      res.status(200).json(repData);
    } catch (err) {
      res
        .status(500)
        .json({ error: err || "An error occurred while fetching reports." });
    }
  },
  remaingingDayGoal: async (req, res) => {
    console.log("ENTRANDO ACA");
    const { idUsuario, fecha } = req.query;
    try {
      const repData = await GetRemainingGoal(fecha, idUsuario);
      res.status(200).json(repData);
    } catch (err) {
      res
        .status(500)
        .json({ error: err || "An error occurred while fetching reports." });
    }
  },
  samplesReport: async (req, res) => {
    console.log("ENTRANDO ACA", req.query);
    const { startDate, endDate, idAgencia, tipo } = req.query;
    try {
      const repData = await GetSamplesReport(
        startDate,
        endDate,
        idAgencia,
        tipo
      );
      res.status(200).json(repData);
    } catch (err) {
      console.log("Error al obtener el reporte", err);
      res
        .status(500)
        .json({ error: err || "An error occurred while fetching reports." });
    }
  },
  samplesProdReport: async (req, res) => {
    console.log("ENTRANDO ACA", req.query);
    const { startDate, endDate, idAgencia, tipo } = req.query;
    try {
      const repData = await GetProductInSamplesReport(
        startDate,
        endDate,
        idAgencia,
        tipo
      );
      res.status(200).json(repData);
    } catch (err) {
      console.log("Error al obtener el reporte", err);
      res
        .status(500)
        .json({ error: err || "An error occurred while fetching reports." });
    }
  },
  transferProductsReport: async (req, res) => {
    console.log("ENTRANDO ACA", req.query);
    const { idAgencia, startDate, endDate } = req.query;
    try {
      const repData = await getTransferProductsByStore(
        idAgencia,
        startDate,
        endDate
      );
      res.status(200).send(repData);
    } catch (err) {
      console.log("Error al obtener el reporte", err);
      res
        .status(500)
        .json({ error: err || "An error occurred while fetching reports." });
    }
  },
  simpleTransferReport: async (req, res) => {
    console.log("ENTRANDO ACA", req.query);
    const { idAgencia, startDate, endDate } = req.query;
    try {
      const repData = await getSimpleTransferReport(
        idAgencia,
        startDate,
        endDate
      );
      res.status(200).send(repData);
    } catch (err) {
      console.log("Error al obtener el reporte", err);
      res
        .status(500)
        .json({ error: err || "An error occurred while fetching reports." });
    }
  },
  dailyDiscountReport: async (req, res) => {
    console.log("ENTRANDO ACA", req.query);
    const { date } = req.query;
    try {
      const repData = await getDailyDiscountsReport(date);
      res.status(200).send(repData);
    } catch (err) {
      console.log("Error al obtener el reporte", err);
      res
        .status(500)
        .json({ error: err || "An error occurred while fetching reports." });
    }
  },
  canceledInvoices: async (req, res) => {
    const { idAgencia, fromDate, toDate } = req.query;
    try {
      const repData = await getCanceledInvoices(idAgencia, fromDate, toDate);
      res.status(200).send(repData);
    } catch (err) {
      console.log("Error al obtener el reporte", err);
      res
        .status(500)
        .json({ error: err || "An error occurred while fetching reports." });
    }
  },
  pastSalesByProduct: async (req, res) => {
    const { fromDate, toDate } = req.query;
    try {
      const repData = await getPastSalesByProductReport(fromDate, toDate);
      res.status(200).send(repData);
    } catch (err) {
      console.log("Error al obtener el reporte", err);
      res
        .status(500)
        .json({ error: err || "An error occurred while fetching reports." });
    }
  },
};
