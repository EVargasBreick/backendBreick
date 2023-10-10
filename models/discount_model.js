const { client } = require("../postgressConn");

function getSeasonDiscount(currentDate, tipo) {
  var queryList = `select * from descuento_estacional de 
    inner join lista_descuento_estacional lde on lde."idDescEst"=de."idDescEst"
    where "tipoUsuario"=${tipo} and activo=1 and
    to_date('${currentDate}', 'DD/MM/YYYY') >= to_date("fechaInicio", 'DD/,MM/YYYY')and 
    to_date('${currentDate}', 'DD/MM/YYYY')<= to_date("fechaFin", 'DD/MM/YYYY')`;
  return new Promise((resolve) => {
    console.log("Query", queryList);
    setTimeout(async () => {
      try {
        const discountList = await client.query(queryList);
        resolve({
          code: 200,
          data: discountList.rows,
        });
      } catch (err) {}
    }, 100);
  });
}

function currentSeasonDiscount(startDate, endDate) {
  var queryList = `
  select * from descuento_estacional de inner join lista_descuento_estacional lde on lde."idDescEst" =de."idDescEst"
  	inner join tipos_producto tp on tp."idTiposProducto" = de."tipoProducto"
	where ((to_date("fechaInicio",'DD/MM/YYYY') between to_date('${startDate}','YYYY-MM-DD') and to_date('${endDate}','YYYY-MM-DD'))
or (to_date("fechaFin",'DD/MM/YYYY') between to_date('${startDate}','YYYY-MM-DD') and to_date('${endDate}','YYYY-MM-DD'))) and activo=1`;
  return new Promise((resolve) => {
    console.log("Query efectuado", queryList);
    setTimeout(async () => {
      try {
        const discountList = await client.query(queryList);
        resolve({
          code: 200,
          data: discountList.rows,
        });
      } catch (err) {}
    }, 100);
  });
}

function registerSeasonalDiscount(body) {
  console.log("Body", body);
  var querySeasonal = `insert into descuento_estacional ("fechaInicio","fechaFin","tipoProducto",activo)
  values ('${body.seasonDiscount.fechaInicio}','${body.seasonDiscount.fechaFin}',${body.seasonDiscount.tipoProducto}, 1) returning "idDescEst"`;
  console.log("QUERYSEASONAL", querySeasonal);
  return new Promise(async (resolve, reject) => {
    try {
      const discountList = await client.query(querySeasonal);
      console.log("Discount list", discountList);
      const id = discountList.rows[0].idDescEst;
      console.log("Id", id);
      const responseArray = [];
      const insertPromises = [];
      for (const listItem of body.discountList) {
        const queryList = `insert into lista_descuento_estacional ("idDescEst","tipoUsuario","descuento","montoMinimo","montoMaximo",categoria)
        values (${id}, ${listItem.tipoUsuario},${listItem.descuento},${listItem.montoMinimo},${listItem.montoMaximo},'${listItem.categoria}')`;

        const added = client.query(queryList);
        insertPromises.push(added);
      }
      await Promise.all(insertPromises);
      resolve({ data: responseArray });
    } catch (err) {
      console.log("ERROR", err);
      client.query("ROLLBACK");
      reject({
        message: "Error al registrar el descuento",
        error: err,
      });
    }
  });
}

async function disableSeasonalDiscount(id) {
  const query = `update descuento_estacional set activo=0 where "idDescEst"=${id}`;
  return new Promise(async (resolve, reject) => {
    try {
      const disabled = await client.query(query);
      resolve(disabled.rows[0]);
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  getSeasonDiscount,
  currentSeasonDiscount,
  registerSeasonalDiscount,
  disableSeasonalDiscount,
};
