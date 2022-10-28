function dateString() {
  var d = new Date();
  const dformat =
    [
      d.getDate() < 10 ? "0" + d.getDate() : d.getDate(),
      d.getMonth() + 1 < 10 ? "0" + (d.getMonth() + 1) : d.getMonth() + 1,
      d.getFullYear(),
    ].join("/") +
    " " +
    [
      d.getHours() < 10 ? "0" + d.getHours() : d.getHours(),
      d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes(),
      d.getSeconds() < 10 ? "0" + d.getSeconds() : d.getSeconds(),
    ].join(":");
  console.log("Hora enviada", dformat);
  return dformat;
}

module.exports = dateString;
