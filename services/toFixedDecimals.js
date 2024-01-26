const toFixedDecimals = (value) => {
  const numericValue = Number(value);

  if (!isNaN(numericValue)) {
    return numericValue.toFixed(2);
  } else {
    return "0.00";
  }
};

module.exports = { toFixedDecimals };
