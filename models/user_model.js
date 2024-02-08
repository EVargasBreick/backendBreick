//const { updateUser } = require("../controllers/user_controller");
const { client } = require("../postgressConn");
const dbConnection = require("../server");
const dateString = require("../services/dateServices");

function findUserByName(nombre) {
  var queryAll = `select * from Usuarios where nombre='${nombre}'`;
  var queryFind = "select * from Usuarios";
  var query = nombre === undefined ? queryFind : queryAll;
  var responseObject = {};
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      console.log("Query:", query);
      const clients = await dbConnection.executeQuery(query);
      console.log("Respuestita", clients.data);
      if (JSON.stringify(clients.data).length < 5) {
        (responseObject.code = 404),
          (responseObject.message = "Not Found"),
          (responseObject.data = "Not found");
      } else {
        (responseObject.code = 200),
          (responseObject.data = clients.data),
          (responseObject.message = "success");
      }
      resolve(JSON.stringify(responseObject));
    }, 1000);
  });
}
function findUserById(id) {
  var queryAll = `select * from Usuarios where idUsuario='${id}'`;
  var queryFind = "select * from Usuarios";
  var query = id === undefined ? queryFind : queryAll;
  var responseObject = {};
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      console.log("Query:", query);
      const clients = await dbConnection.executeQuery(query);
      console.log("Respuestita", clients.data);
      if (JSON.stringify(clients.data).length < 5) {
        (responseObject.code = 404),
          (responseObject.message = "Not Found"),
          (responseObject.data = "Not found");
      } else {
        (responseObject.code = 200),
          (responseObject.data = clients.data),
          (responseObject.message = "success");
      }
      resolve(JSON.stringify(responseObject));
    }, 1000);
  });
}
function createNewUser(data) {
  console.log("Body:", data);
  var addUserQuery = `insert into Usuarios (
    nombre, 
    apPaterno, 
    apMaterno,
    cedula,
    correo,
    acceso,
    rol,
    usuario,
    password,
    fultimoa,
    fcreacion,
    factualizacion,
    usuarioCrea,
    idioma,
    idAlmacen, idDepto, tipoUsuario) values 
    (
      '${data.nombre}',
      '${data.apPaterno}',
      '${data.apMaterno}',
      '${data.cedula}',
      '${data.correo}',
      ${data.acceso},
      ${data.rol},
      '${data.usuario}',
      '${data.password}',
      '${data.fultimoa}',
      '${data.fcreacion}',
      '${data.factualizacion}',
      ${data.usuariocrea},
      ${data.idioma},
      '${data.idAlmacen}',
      ${data.idDepto},
      ${data.tipoUsuario}
    )`;
  return new Promise((resolve, reject) => {
    const responseObject = {};
    setTimeout(async () => {
      console.log(addUserQuery);
      const newUser = await dbConnection.executeQuery(addUserQuery);
      console.log(newUser);
      if (newUser.success) {
        const idCreado = await dbConnection.executeQuery(
          `select IDENT_CURRENT('dbo.Usuarios') as 'idCreado'`
        );
        console.log("Id Creado:", idCreado.data[0][0].idCreado);
        const horarioQuery = `insert into Horarios_acceso (idUsuario, horaEntrada, horaSalida, turno) values (${idCreado.data[0][0].idCreado},'09:00', '22:00', 'completo')`;
        const workTime = await dbConnection.executeQuery(horarioQuery);
        if (workTime.success) {
          responseObject.code = 201;
          responseObject.data = "Sucess";
        } else {
          const queryDelete = `delete from Usuarios where idUsuario=${idCreado.data[0][0].idCreado}`;
          const deleted = await dbConnection.executeQuery(queryDelete);
          if (deleted.success) {
            responseObject.code = 400;
            responseObject.data = "Error";
            responseObject.message = workTime.message;
            console.log("Error en la data", workTime.message);
          }
        }
      } else {
        responseObject.code = 400;
        responseObject.data = "Error";
        responseObject.message = newUser.message;
        console.log("Error en la data", newUser.message);
      }
      resolve(JSON.stringify(responseObject));
    }, 1000);
  });
}
function findUserBasic() {
  var queryFind =
    "select idUsuario, nombre + ' ' + apPaterno + ' ' + apMaterno as nombre from Usuarios ORDER by nombre";
  var responseObject = {};
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const clients = await dbConnection.executeQuery(queryFind);
      console.log("Respuestita", clients.data);
      if (JSON.stringify(clients.data).length < 5) {
        (responseObject.code = 404),
          (responseObject.message = "Not Found"),
          (responseObject.data = "Not found");
      } else {
        (responseObject.code = 200),
          (responseObject.data = clients.data),
          (responseObject.message = "success");
      }
      resolve(JSON.stringify(responseObject));
    }, 1000);
  });
}

//POSTGRES

function findUserByNamePos(nombre) {
  var queryAll = `select * from Usuarios where nombre='${nombre}'`;
  var queryFind = "select * from Usuarios";

  var query = nombre === undefined ? queryFind : queryAll;
  var responseObject = {};
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      console.log("Query:", query);
      const clients = await client.query(query);
      console.log("Respuestita", clients.rows);
      if (JSON.stringify(clients.rows).length < 1) {
        (responseObject.code = 404),
          (responseObject.message = "Not Found"),
          (responseObject.data = "Not found");
      } else {
        (responseObject.code = 200),
          (responseObject.data = clients.rows),
          (responseObject.message = "success");
      }
      resolve(JSON.stringify(responseObject));
    }, 100);
  });
}

function findUserByIdPos(id) {
  var queryAll = `select * from Usuarios where "idUsuario"='${id}'`;
  var queryFind = "select * from Usuarios";
  var query = id === undefined ? queryFind : queryAll;
  var responseObject = {};
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      console.log("Query:", query);
      const clients = await client.query(query);
      console.log("Respuestita", clients.rows);
      if (JSON.stringify(clients.rows).length < 1) {
        (responseObject.code = 404),
          (responseObject.message = "Not Found"),
          (responseObject.data = "Not found");
      } else {
        (responseObject.code = 200),
          (responseObject.data = clients.rows),
          (responseObject.message = "success");
      }
      resolve(JSON.stringify(responseObject));
    }, 100);
  });
}

function createNewUserPos(data) {
  console.log("Body:", data);
  var addUserQuery = `insert into Usuarios (
    nombre, 
    "apPaterno", 
    "apMaterno",
    cedula,
    correo,
    acceso,
    rol,
    usuario,
    password,
    fultimoa,
    fcreacion,
    factualizacion,
    "usuarioCrea",
    idioma,
    "idAlmacen", "idDepto", "tipoUsuario") values 
    (
      '${data.nombre}',
      '${data.apPaterno}',
      '${data.apMaterno}',
      '${data.cedula}',
      '${data.correo}',
      ${data.acceso},
      ${data.rol},
      '${data.usuario}',
      '${data.password}',
      '${data.fultimoa}',
      '${data.fcreacion}',
      '${data.factualizacion}',
      ${data.usuariocrea},
      ${data.idioma},
      '${data.idAlmacen}',
      ${data.idDepto},
      ${data.tipoUsuario}
    ) returning "idUsuario"`;
  return new Promise((resolve, reject) => {
    const responseObject = {};
    setTimeout(async () => {
      console.log(addUserQuery);
      try {
        const newUser = await client.query(addUserQuery);
        const idCreado = newUser.rows[0].idUsuario;
        const horarioQuery = `insert into Horarios_acceso ("idUsuario", "horaEntrada", "horaSalida", turno) values (${idCreado},'09:00', '22:00', 'completo')`;
        try {
          const workTime = await client.query(horarioQuery);
          responseObject.code = 201;
          responseObject.data = "Sucess";
        } catch (err) {
          const queryDelete = `delete from Usuarios where idUsuario=${idCreado}`;
          const deleted = await dbConnection.executeQuery(queryDelete);
          if (deleted.success) {
            responseObject.code = 400;
            responseObject.data = "Error";
            responseObject.message = err;
          }
        }
      } catch (err) {
        responseObject.code = 400;
        responseObject.data = "Error";
        responseObject.message = err;
      }
      resolve(JSON.stringify(responseObject));
    }, 100);
  });
}

function findUserBasicPos() {
  var queryFind = `select "idUsuario", nombre || ' ' || "apPaterno" || ' ' || "apMaterno" as nombre, usuario from Usuarios ORDER by nombre`;
  var responseObject = {};
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const clients = await client.query(queryFind);
      if (JSON.stringify(clients.rows).length < 1) {
        (responseObject.code = 404),
          (responseObject.message = "Not Found"),
          (responseObject.data = "Not found");
      } else {
        (responseObject.code = 200),
          (responseObject.data = clients.rows),
          (responseObject.message = "success");
      }
      resolve(JSON.stringify(responseObject));
    }, 1000);
  });
}

async function changePassword(data) {
  const { idUser, originalPassword, newPassword } = data;

  const checkPassword = `select password from Usuarios where "idUsuario"=${idUser}`;
  const queryChange = `update Usuarios set password='${newPassword}' where "idUsuario"=${idUser}`;
  try {
    const isPasswordCorrect = await client.query(checkPassword);
    if (isPasswordCorrect.rows[0].password === originalPassword) {
      const data = await client.query(queryChange);
      return "Contraseña actualizada";
    }
    throw "Contraseña Actual incorrecta";
  } catch (err) {
    throw err;
  }
}

async function findUser(params, queryParams) {
  const { search } = params;
  const { roles } = queryParams;
  let query = `
  SELECT nombre, "apPaterno",  "apMaterno", cedula , correo , rol , "idAlmacen", "idUsuario"  
  FROM usuarios u
  WHERE lower(nombre)  LIKE lower('%${search}%') 
     OR lower("apPaterno")  LIKE lower('%${search}%')
     or lower("apMaterno") like lower('%${search}%')
     or lower(concat(nombre, ' ', "apPaterno", ' ', "apMaterno")) like lower('%${search}%')
     or lower(cedula) like lower('%${search}%')
    `;
  const rols = roles?.split(",");

  if (rols && rols.length > 0) {
    query += `AND (`;
    rols.forEach((rol, index) => {
      if (index === 0) {
        query += `rol = ${Number(rol)} `;
      } else {
        query += `OR rol = ${Number(rol)} `;
      }
    });
    query += `)`;
  }

  query += ` limit 1;`;

  console.log("TCL: findUser -> query", query);
  try {
    const data = await client.query(query);
    return data.rows;
  } catch (err) {
    throw err;
  }
}

async function getAllUsers(queryParams) {
  // roles are send like  /?roles=1,2,3
  const { roles } = queryParams;
  let query = `
  SELECT "idUsuario", nombre, "apPaterno", "apMaterno", cedula, correo, acceso, rol, usuario, "idAlmacen","idDepto","tipoUsuario"
  FROM usuarios u
  `;
  const rols = roles?.split(",");

  if (rols && rols.length > 0) {
    rols.forEach((rol, index) => {
      if (index === 0) {
        query += `WHERE rol = ${Number(rol)} `;
      } else {
        query += `OR rol = ${Number(rol)} `;
      }
    });
  }

  query += `ORDER BY nombre`;

  try {
    const data = await client.query(query);
    return data.rows;
  } catch (err) {
    throw err;
  }
}

async function updateAlmacen(userId, data) {
  const { idAlmacen } = data;
  const query = `
  update usuarios
  set "idAlmacen" = '${idAlmacen}'
  where  "idUsuario" = ${userId}
  `;

  try {
    const data = await client.query(query);
    return data.rows;
  } catch (err) {
    throw err;
  }
}

async function updateAllUser(idUser, data) {
  const {
    nombre,
    apPaterno,
    apMaterno,
    cedula,
    correo,
    acceso,
    idDepto,
    rol,
    idioma,
    usuario,
  } = data;
  const query = `
  update usuarios
  set "nombre" = '${nombre}'
  , "apPaterno" = '${apPaterno}'
  , "apMaterno" = '${apMaterno}'
  , "cedula" = '${cedula}'
  , "correo" = '${correo}'
  , "acceso" = ${acceso}
  , "rol" = ${rol}
  , "usuario" = '${usuario}'
  , "idioma" = ${idioma}
  , "idDepto" = ${idDepto}
  where  "idUsuario" = ${idUser}
  `;
  try {
    const data = await client.query(query);
    return data.rows;
  } catch (err) {
    throw err;
  }
}

async function insertAndUpdateUserGoals(body) {
  const queryList = [];
  return new Promise(async (resolve, reject) => {
    try {
      for (const entry of body) {
        const foundQuery = `select * from metas_diarias where "idUsuario"=${entry.idUsuario} and fecha='${entry.fechaHora}'`;
        console.log("Query", foundQuery);
        const found = await client.query(foundQuery);
        if (found.rows.length > 0) {
          const updateQuery = `update metas_diarias set meta='${entry.meta}', notas='${entry.obs}' where "idUsuario"=${entry.idUsuario} and fecha='${entry.fechaHora}'`;
          console.log("Query up", updateQuery);
          const updated = client.query(updateQuery);
          queryList.push(updated);
        } else {
          const insertQuery = `insert into metas_diarias (fecha, "idUsuario",meta,notas) values ('${entry.fechaHora}',${entry.idUsuario},${entry.meta},'${entry.obs}')`;
          console.log("Query ins", insertQuery);
          const inserted = client.query(insertQuery);
          queryList.push(inserted);
        }
      }
      await Promise.all(queryList);
      resolve({ data: queryList });
    } catch (err) {
      console.log("ERROR", err);
      reject({ error: err });
    }
  });
}

async function getWeeklyGoals(startDate, endDate) {
  const getQuery = `select * from metas_diarias where to_date("fecha",'DD/MM/YYYY') between 
  to_date('${startDate}','DD/MM/YYYY') and to_date('${endDate}','DD/MM/YYYY')`;
  return new Promise(async (resolve, reject) => {
    try {
      const weekData = await client.query(getQuery);
      resolve(weekData.rows);
    } catch (err) {
      console.log("Error", err);
      reject(err);
    }
  });
}

module.exports = {
  updateAllUser,
  findUserByName,
  findUserById,
  createNewUser,
  findUserBasic,
  findUserByNamePos,
  findUserByIdPos,
  createNewUserPos,
  findUserBasicPos,
  changePassword,
  findUser,
  getAllUsers,
  updateAlmacen,
  insertAndUpdateUserGoals,
  getWeeklyGoals,
};
