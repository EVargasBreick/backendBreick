const dbConnection = require("../server");
const { client } = require("../postgressConn");
function registerClient(data) {
  console.log("Data cliente", data);
  var queryNewClient = `insert into Clientes (razonSocial, 
    nit, correo, direccion, codPostal, telefono, activo, lenguaje, frecuencia, 
    notasAdicionales, idZona, tipoPrecio, usuarioCrea, idVendedor, fechaCrea, tipoDocumento)
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
        '${data.fechaCrea}',
        ${data.tipoDocumento}
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
      usuarioCrea= '${data.usuarioCrea}', idVendedor='${data.idVendedor}', fechaCrea='${data.fechaCrea}',
      tipoDocumento=${data.tipoDoc}
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
    ? `select a.*, b.zona, c.dias from Clientes a, Zonas b, Dias_Frecuencia c where a.razonSocial like ('%${params.search}%') 
    and a.idZona=b.idZona and a.frecuencia=c.idDiasFrec and a.activo=1 union 
    select a.*, b.zona, c.dias from Clientes a, Zonas b, Dias_Frecuencia c where a.nit='${params.search}' 
    and a.idZona=b.idZona and a.frecuencia=c.idDiasFrec and a.activo=1`
    : `select a.*, b.zona, c.dias from Clientes a, Zonas b, Dias_Frecuencia c where a.idZona=b.idZona and a.frecuencia=c.idDiasFrec and a.activo=1`;
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

function getNumberOfClients() {
  const countQuery = `select count(*) as NumeroClientes from clientes`;
  return new Promise((resolve) => {
    setTimeout(async () => {
      const clients = await dbConnection.executeQuery(countQuery);
      resolve(
        JSON.stringify({
          code: 200,
          data: clients.data,
        })
      );
    }, 1000);
  });
}

//A PARTIR DE ACA VAN LAS FUNCIONES PENSADAS PARA POSTGRES

function registerClientPos(data) {
  console.log("Data cliente", data);
  var queryNewClient = `insert into Clientes ("razonSocial", 
    nit, correo, direccion, "codPostal", telefono, activo, lenguaje, frecuencia, 
   "notasAdicionales", "idZona", "tipoPrecio", "usuarioCrea", "idVendedor", "fechaCrea", "tipoDocumento")
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
        '${data.fechaCrea}',
        ${data.tipoDocumento}
    ) returning "idCliente"`;

  return new Promise((resolve, reject) => {
    const responseObject = {};
    setTimeout(async () => {
      console.log("Client query:", queryNewClient);
      try {
        const newClient = await client.query(queryNewClient);
        responseObject.createdId = newClient.rows[0].idCliente;
        responseObject.code = 201;
        responseObject.data = "Sucess";
      } catch (err) {
        console.log("Error al crear cliente", err);
        responseObject.code = 400;
        responseObject.data = err;
      }
      resolve(JSON.stringify(responseObject));
    }, 100);
  });
}

function updateClientPos(data, params) {
  console.log("Data cliente", data);
  var queryNewClient = `update Clientes set "razonSocial"= '${data.razonSocial}', 
      nit='${data.nit}', correo='${data.correo}', direccion='${data.direccion}', 
      "codPostal"='${data.codPostal}', telefono='${data.telefono}', activo= '${data.activo}', 
      lenguaje= '${data.lenguaje}', frecuencia='${data.frecuencia}',
      "notasAdicionales"='${data.notas}', "idZona"='${data.idZona}', "tipoPrecio"= '${data.tipoPrecio}', 
      "usuarioCrea"= '${data.usuarioCrea}', "idVendedor"='${data.idVendedor}', "fechaCrea"='${data.fechaCrea}',
      "tipoDocumento"=${data.tipoDocumento}
      where "idCliente"=${params.id}`;
  return new Promise((resolve, reject) => {
    const responseObject = {};
    setTimeout(async () => {
      console.log("Client:", queryNewClient);
      try {
        const newClient = await client.query(queryNewClient);
        responseObject.code = 201;
        responseObject.data = newClient.rows;
      } catch (err) {
        console.log("Error al editar cliente", err);
        responseObject.code = 400;
        responseObject.data = err;
      }
      resolve(JSON.stringify(responseObject));
    }, 1000);
  });
}

function getClientsPos(params) {
  const { search_record } = params;
  const queryGetClient = params.search
    ? `select a.*, b.zona, c.dias from Clientes a, Zonas b, Dias_Frecuencia c where a."razonSocial" like ('%${params.search}%') 
    and a."idZona"=b."idZona" and a.frecuencia=c."idDiasFrec" and a.activo=1 union 
    select a.*, b.zona, c.dias from Clientes a, Zonas b, Dias_Frecuencia c where a.nit='${params.search}' 
    and a."idZona"=b."idZona" and a.frecuencia=c."idDiasFrec" and a.activo=1`
    : `select a.*, b.zona, c.dias from Clientes a, Zonas b, Dias_Frecuencia c where a."idZona"=b."idZona" and a.frecuencia=c."idDiasFrec" and a.activo=1`;

  const responseObject = {};

  if (search_record) {
    return new Promise(async (resolve, reject) => {
      try {
        const query = `select distinct av."nitCliente" ,z.zona, c."razonSocial", c."idZona", d.departamento 
        FROM almacen_virtual av 
        INNER JOIN clientes c  ON av."nitCliente"  = c.nit and av."idzona"=c."idZona"
        inner join departamentos d on av."idDepto" = d."idDepto"
        inner join zonas z on z."idZona" = av."idzona"
        where ("razonSocial" ilike '%${search_record}%'  or nit like '%${search_record}%') and c.activo =1;`

        const foundClient = await client.query(query);
        responseObject.code = 201;
        responseObject.data = foundClient.rows;
      } catch (err) {
        responseObject.code = 400;
        responseObject.data = "Error";
        responseObject.message = err;
      }
      resolve(JSON.stringify(responseObject));
    });
  }

  return new Promise((resolve, reject) => {
    console.log("Buscando cliente", queryGetClient);
    setTimeout(async () => {
      try {
        const foundClient = await client.query(queryGetClient);
        responseObject.code = 201;
        responseObject.data = foundClient.rows;
        console.log("Found client", foundClient.rows);
      } catch (err) {
        responseObject.code = 400;
        responseObject.data = "Error";
        responseObject.message = err;
      }
      resolve(JSON.stringify(responseObject));
    }, 1000);
  });
}

function getClientByIdPos(params) {
  const queryGetClient = `select * from Clientes where "idCliente"=${params.id}`;
  const responseObject = {};
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const foundClient = await client.query(queryGetClient);
        responseObject.code = 201;
        responseObject.data = foundClient.rows;
      } catch (err) {
        responseObject.code = 400;
        responseObject.data = "Error";
        responseObject.message = err;
      }
      resolve(JSON.stringify(responseObject));
    }, 100);
  });
}

function getFullClientPos(params) {
  const queryGetClient = `select a.*, b.zona as zonaActual, (c.nombre ||' '|| c."apPaterno" || ' ' || c."apMaterno") as NombreVendedor, d.lenguaje as idioma, e.dias 
    from Clientes a, Zonas b, Usuarios c, Lenguajes d, Dias_Frecuencia e
    where a."idCliente"=${params.id} and b."idZona"=(select "idZona" from Clientes where "idCliente"=${params.id}) 
    and c."idUsuario"=(select "idVendedor" from Clientes where "idCliente"=${params.id})
    and d."idLenguaje"=(select lenguaje from Clientes where "idCliente"=${params.id})
    and e."idDiasFrec"=(select frecuencia from Clientes where "idCliente"=${params.id})
    `;
  const responseObject = {};
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const foundClient = await client.query(queryGetClient);
        responseObject.code = 201;
        responseObject.data = foundClient.rows;
      } catch (err) {
        responseObject.code = 400;
        responseObject.data = "Error";
        responseObject.message = err;
      }
      resolve(JSON.stringify(responseObject));
    }, 1000);
  });
}

function getNumberOfClientsPos() {
  const countQuery = `select count(*) as NumeroClientes from clientes`;
  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        const clients = await client.query(countQuery);
        resolve(
          JSON.stringify({
            code: 200,
            data: clients.rows,
          })
        );
      } catch (err) {
        resolve(
          JSON.stringify({
            code: 400,
            data: err,
          })
        );
      }
    }, 1000);
  });
}

function updateTheClientMail(body) {
  const { idClient, mail } = body;
  const queryUpdateMail = `update clientes set correo='${mail}' where "idCliente"=${idClient}`;
  return new Promise(async (resolve, reject) => {
    try {
      const updatedMail = await client.query(queryUpdateMail);
      resolve(
        JSON.stringify({
          code: 200,
          data: body,
        })
      );
    } catch (err) {
      reject(
        JSON.stringify({
          code: 400,
          data: "Error al actualizar el mail",
        })
      );
    }
  });
}

module.exports = {
  registerClient,
  getClients,
  getClientById,
  getFullClient,
  updateClient,
  getNumberOfClients,
  registerClientPos,
  updateClientPos,
  getClientsPos,
  getClientByIdPos,
  getFullClientPos,
  getNumberOfClientsPos,
  updateTheClientMail
};
