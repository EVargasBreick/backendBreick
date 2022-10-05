const dbConnection = require("../server");

function registerClient(data) {
  console.log("Data cliente", data);
  var queryNewClient = `insert into Clientes (razonSocial, 
    nit, correo, direccion, codPostal, telefono, activo, lenguaje, frecuencia, 
    notasAdicionales, idZona, tipoPrecio, usuarioCrea, idVendedor, fechaCrea)
    values (
        '${data.razonSocial}',
        '${data.nit}',
        '${data.correo}',
        '${data.direccion}',
        '${data.codPostal}',
        '${data.telefono}',
        '${data.activo}',
        '${data.lenguaje}',
        '${data.frecuencia}',
        '${data.notas}',
        '${data.idZona}',
        '${data.tipoPrecio}',
        '${data.usuarioCrea}',
        '${data.idVendedor}',
        '${data.fechaCrea}'
    )`;

  return new Promise((resolve, reject) => {
    const responseObject = {};
    setTimeout(async () => {
      console.log("Client:", queryNewClient);
      const newClient = await dbConnection.executeQuery(queryNewClient);
      if (newClient.success) {
        const idCreado = await dbConnection.executeQuery(
          `select IDENT_CURRENT('dbo.Clientes') as 'idCreado'`
        );
        responseObject.createdId = idCreado.data[0][0].idCreado;
        responseObject.code = 201;
        responseObject.data = "Sucess";
      } else {
        responseObject.code = 400;
        responseObject.data = "Error";
        responseObject.message = newClient.message;
        console.log("Error en la data", newClient.message);
      }
      resolve(JSON.stringify(responseObject));
    }, 1000);
  });
}

function updateClient(data, params) {
  console.log("Data cliente", data);
  var queryNewClient = `update Clientes set razonSocial= '${data.razonSocial}', 
      nit='${data.nit}', correo='${data.correo}', direccion='${data.direccion}', 
      codPostal='${data.codPostal}', telefono='${data.telefono}', activo= '${data.activo}', 
      lenguaje= '${data.lenguaje}', frecuencia='${data.frecuencia}',
      notasAdicionales='${data.notas}', idZona='${data.idZona}', tipoPrecio= '${data.tipoPrecio}', 
      usuarioCrea= '${data.usuarioCrea}', idVendedor='${data.idVendedor}', fechaCrea='${data.fechaCrea}'
      where idCliente=${params.id}`;

  return new Promise((resolve, reject) => {
    const responseObject = {};
    setTimeout(async () => {
      console.log("Client:", queryNewClient);
      const newClient = await dbConnection.executeQuery(queryNewClient);
      if (newClient.success) {
        responseObject.code = 201;
        responseObject.data = "Sucess";
      } else {
        responseObject.code = 400;
        responseObject.data = "Error";
        responseObject.message = newClient.message;
        console.log("Error en la data", newClient.message);
      }
      resolve(JSON.stringify(responseObject));
    }, 1000);
  });
}

function getClients(params) {
  const queryGetClient = params.search
    ? `select * from Clientes where razonSocial like ('%${params.search}%') union
    select * from Clientes where nit='${params.search}'`
    : `select * from Clientes`;
  const responseObject = {};
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const foundClient = await dbConnection.executeQuery(queryGetClient);
      if (foundClient.success) {
        responseObject.code = 201;
        responseObject.data = foundClient.data;
      } else {
        responseObject.code = 400;
        responseObject.data = "Error";
        responseObject.message = foundClient.message;
      }
      resolve(JSON.stringify(responseObject));
    }, 1000);
  });
}

function getClientById(params) {
  const queryGetClient = `select * from Clientes where idCliente=${params.id}`;
  const responseObject = {};
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const foundClient = await dbConnection.executeQuery(queryGetClient);
      if (foundClient.success) {
        responseObject.code = 201;
        responseObject.data = foundClient.data;
      } else {
        responseObject.code = 400;
        responseObject.data = "Error";
        responseObject.message = foundClient.message;
      }
      resolve(JSON.stringify(responseObject));
    }, 1000);
  });
}

function getFullClient(params) {
  const queryGetClient = `select a.*, b.zona as zonaActual, (c.nombre +' '+ c.apPaterno + ' ' + c.apMaterno) as NombreVendedor, d.lenguaje as idioma, e.dias 
    from Clientes a, Zonas b, Usuarios c, Lenguajes d, Dias_Frecuencia e
    where a.idCliente=${params.id} and b.idZona=(select idZona from Clientes where idCliente=${params.id}) 
    and c.idUsuario=(select idVendedor from Clientes where idCliente=${params.id})
    and d.idLenguaje=(select lenguaje from Clientes where idCliente=${params.id})
    and e.idDiasFrec=(select frecuencia from Clientes where idCliente=${params.id})
    
    `;
  const responseObject = {};
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const foundClient = await dbConnection.executeQuery(queryGetClient);
      if (foundClient.success) {
        responseObject.code = 201;
        responseObject.data = foundClient.data;
      } else {
        responseObject.code = 400;
        responseObject.data = "Error";
        responseObject.message = foundClient.message;
      }
      resolve(JSON.stringify(responseObject));
    }, 1000);
  });
}

module.exports = {
  registerClient,
  getClients,
  getClientById,
  getFullClient,
  updateClient,
};
