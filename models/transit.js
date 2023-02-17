const { client } = require("../postgressConn");

function registerClientPos(data) {
    console.log("Data cliente", data);
    var queryNewClient = `insert into Clientes ("razonSocial", 
      nit, correo, direccion, "codPostal", telefono, activo, lenguaje, frecuencia, 
     "notasAdicionales", "idZona", "tipoPrecio", "usuarioCrea", idVendedor, "fechaCrea", "tipoDocumento")
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
        console.log("Client:", queryNewClient);
        try {
            const newClient = await client.query(queryNewClient);
            responseObject.createdId = newClient.rows[0].idCliente;
            responseObject.code = 201;
            responseObject.data = "Sucess";
        } catch (err) {
            responseObject.code = 400;
            responseObject.data = err;
           
        } finally {
            await client.end()
        }
        resolve(JSON.stringify(responseObject));
      }, 1000);
    });
  }



  