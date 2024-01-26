const toFixedDecimals = (value) => {
  if (typeof value === "number") {
    return Number(value).toFixed(2);
  } else {
    return "0.00";
  }
};

module.exports = { toFixedDecimals };
