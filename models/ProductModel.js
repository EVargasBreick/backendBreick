const dbConnection = require("../server");

function getProducts(params) {
  console.log("Id producto:", params.id);
  var query;
  if (params.id) {
    query = `select * from Productos where idProducto=${params.id}`;
  } else {
    query = `select * from Productos`;
  }

  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      console.log(query);
      const products = await dbConnection.executeQuery(query);
      resolve(JSON.stringify(products.data));
    }, 1000);
  });
}
module.exports = getProducts;
