const dbConnection = require("../server");
const { client } = require("../postgressConn");

function registerContact(data) {
  var queryContact = `insert into Contactos_Cliente 
    (idCliente, nombre, correo, telefono) values 
    (
        '${data.idCliente}',
        '${data.nombre}',
        '${data.correo}',
        '${data.telefono}')`;
  return new Promise((resolve, reject) => {
    const responseObject = {};
    setTimeout(async () => {
      const newContact = await dbConnection.executeQuery(queryContact);
      if (newContact.success) {
        responseObject.code = 201;
        responseObject.data = "Sucess";
      } else {
        responseObject.code = 400;
        responseObject.data = "Error";
        responseObject.message = newContact.message;
      }
      resolve(JSON.stringify(responseObject));
    }, 1000);
  });
}

function updateContact(data, params) {
  var queryContact = `update Contactos_Cliente 
    set idCliente='${data.idCliente}', 
    nombre='${data.nombre}', 
    correo='${data.correo}',
    telefono='${data.telefono}'
    where idContactoCliente=${params.id}`;
  return new Promise((resolve, reject) => {
    const responseObject = {};
    setTimeout(async () => {
      const newContact = await dbConnection.executeQuery(queryContact);
      if (newContact.success) {
        responseObject.code = 201;
        responseObject.data = "Sucess";
      } else {
        responseObject.code = 400;
        responseObject.data = "Error";
        responseObject.message = newContact.message;
      }
      resolve(JSON.stringify(responseObject));
    }, 1000);
  });
}

function getMainContact(params) {
  const responseObject = {};
  var mainQuery = `select * from Contactos_Cliente where idCliente=${params.id} order by idCliente asc`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const contacts = await dbConnection.executeQuery(mainQuery);
      if (contacts.success) {
        responseObject.code = 201;
        responseObject.data = contacts.data;
      } else {
        responseObject.code = 400;
        responseObject.data = "Error";
        responseObject.message = contacts.message;
      }
      resolve(JSON.stringify(responseObject));
    }, 1000);
  });
}

//POSTGRES

function registerContactPos(data) {
  var queryContact = `insert into Contactos_Cliente 
    ("idCliente", nombre, correo, telefono) values 
    (
        '${data.idCliente}',
        '${data.nombre}',
        '${data.correo}',
        '${data.telefono}')`;
  return new Promise((resolve, reject) => {
    const responseObject = {};
    setTimeout(async () => {
      try {
        const newContact = await client.query(queryContact);
        responseObject.code = 201;
        responseObject.data = newContact.rows;
      } catch (err) {
        responseObject.code = 400;
        responseObject.data = "Error";
        responseObject.message = err;
      }
      resolve(JSON.stringify(responseObject));
    }, 100);
  });
}

function updateContactPos(data, params) {
  var queryContact = `update Contactos_Cliente 
    set "idCliente"='${data.idCliente}', 
    nombre='${data.nombre}', 
    correo='${data.correo}',
    telefono='${data.telefono}'
    where "idContactoCliente"=${params.id}`;
  console.log("Query updateo contactos", queryContact);
  return new Promise((resolve, reject) => {
    const responseObject = {};
    setTimeout(async () => {
      try {
        const newContact = await client.query(queryContact);
        responseObject.code = 201;
        responseObject.data = newContact;
      } catch (err) {
        responseObject.code = 400;
        responseObject.data = "Error";
        responseObject.message = err;
      }
      resolve(JSON.stringify(responseObject));
    }, 1000);
  });
}

function getMainContactPos(params) {
  const responseObject = {};
  var mainQuery = `select * from Contactos_Cliente where "idCliente"=${params.id} order by "idCliente" asc`;
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const contacts = await client.query(mainQuery);
        responseObject.code = 201;
        responseObject.data = contacts.rows;
      } catch (err) {
        responseObject.code = 400;
        responseObject.data = "Error";
        responseObject.message = err;
      }
      resolve(JSON.stringify(responseObject));
    }, 1000);
  });
}

module.exports = {
  registerContact,
  getMainContact,
  updateContact,
  registerContactPos,
  updateContactPos,
  getMainContactPos,
};
