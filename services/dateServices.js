function dateString() {
  var d = new Date();
  // Adjusting for the timezone offset (assuming 4 hours in this case)
  d.setHours(d.getHours() - 4);

  // Check if adjusted hour is negative and adjust date accordingly
  if (d.getHours() < 0) {
    d.setDate(d.getDate() - 1);
  }

  // Function to add leading zeros
  function pad(number) {
    if (number < 10) {
      return "0" + number;
    }
    return number;
  }

  var dformat =
    [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join("/") +
    " " +
    [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(":");

  console.log(dformat);
  return dformat;
}

module.exports = dateString;
