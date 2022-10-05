const dbConnection = require("../server");

function getDays() {
  let rolQuery = "select * from Dias_Frecuencia";

  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const dias = await dbConnection.executeQuery(rolQuery);
      resolve(JSON.stringify(dias.data));
    }, 1000);
  });
}
module.exports = getDays;
