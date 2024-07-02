const pool = require("../../../database/conexion");
const bcrypt = require("bcryptjs");

const vistaprueba = async (req, res) => {
  const nombre = req.session.user.nombreusuario;
  const perfil = req.session.user.nombreperfil;
  const idperfil = req.session.user.idperfil;

  const sqlcontrol = `SELECT * FROM (
    SELECT 
      controlgalpon.idcontrolgalpon,
      galpon.nombregalpon,
      controlgalpon.cantidadpollo,
      DATE_FORMAT(controlgalpon.fechaentrada, '%Y-%m-%d') AS fechaentrada,
      DATE_FORMAT(controlgalpon.fecha, '%Y-%m-%d') AS fecha,
      controlgalpon.producto AS nombre_producto,
      controlgalpon.mortalidad,
      controlgalpon.descripcion,
      controlgalpon.estado AS estadocontrolgalpon,
      controlgalpon.idgalpon,
      controlgalpon.idunidad,
      ROW_NUMBER() OVER (PARTITION BY controlgalpon.idgalpon ORDER BY controlgalpon.idcontrolgalpon DESC) AS rn
    FROM controlgalpon
    JOIN galpon ON controlgalpon.idgalpon = galpon.idgalpon
    WHERE controlgalpon.estado = 1
  ) AS t
  WHERE rn = 1;
`;

  const sqlgalpon = `SELECT     
    galpon.idgalpon,
    galpon.nombregalpon,
    galpon.estadogalpon
    FROM galpon
    WHERE estadogalpon = 2;`;

  const sqlunidadali = `SELECT * FROM unidad
WHERE categoria = 'ALIMENTO';`;

  const sqlunidadmedi = `SELECT * FROM unidad
WHERE categoria = 'MEDICAMENTO';`;

  try {
    // Crear un array de promesas para cada consulta SQL
    const [controlResult, galponResult, unidadaliResult, unidadmediResult] = await Promise.all([
      pool.promise().query(sqlcontrol),
      pool.promise().query(sqlgalpon),
      pool.promise().query(sqlunidadali),
      pool.promise().query(sqlunidadmedi),
    ]);

    const control = controlResult[0];
    const galpon = galponResult[0];
    const unidadali = unidadaliResult[0];
    const unidadmedi = unidadmediResult[0];

    console.log("Galpon Activos:", control);
    console.log("Galpon Activos:", galpon);
    console.log("Galpon Activos:", unidadali);
    console.log("Galpon Activos:", unidadmedi);

    // Envía los resultados de ambas consultas a la vista con los nombres pisosActivos y pisosInactivos
    res.render("vistaadmin/lotes/prueba", {
      control: control,
      galpon: galpon,
      unidadali: unidadali,
      unidadmedi: unidadmedi,
      nombre: nombre,
      perfil: perfil,
      idperfil: idperfil
    });
  } catch (err) {
    console.error("Error al ejecutar las consultas SQL:", err);
    res.status(500).send("Error en las consultas SQL");
  }
};

const regiscontrolpollos = async (req, res) => {
  try {
    const {
      idgalpon,
      producto,
      cantidadpollo,
      descripcion,
      fechaentrada,
      mortalidad,
      fecha,
      idunidad,
      estado,
    } = req.body;

    pool.query(
      "INSERT INTO controlgalpon (idgalpon, producto, cantidadpollo, descripcion, fechaentrada, mortalidad, fecha, idunidad, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [idgalpon, producto, cantidadpollo, descripcion, fechaentrada, mortalidad, fecha, idunidad, estado],
      (error, results) => {
        if (error) {
          console.error("Error al registrar el control de galpon:", error);
          res.status(500).json({ message: "Error al registrar el control de galpon" });
        } else {
          console.log("Control de galpon registrado correctamente");
          res.status(200).json({ message: "Control de galpon registrado correctamente" });
        }
      }
    );
  } catch (error) {
    console.error("Error en el registro del control de galpon:", error);
    res.status(500).json({ message: "Error en el registro del control de galpon" });
  }
};

const regiscontrolalimento = async (req, res) => {
  try {
    const {
      idgalpon,
      producto,
      cantidad,
      descripcion,
      fechaentrada,
      fecha,
      idunidad,
      estado,
    } = req.body;

    pool.query(
      "INSERT INTO controlalimento (idgalpon, producto, cantidad, descripcion, fechaentrada, fecha, idunidad, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [idgalpon, producto, cantidad, descripcion, fechaentrada, fecha, idunidad, estado],
      (error, results) => {
        if (error) {
          console.error("Error al registrar el control de alimento:", error);
          res.status(500).json({ message: "Error al registrar el control de alimento" });
        } else {
          console.log("Control de alimento registrado correctamente");
          res.status(200).json({ message: "Control de alimento registrado correctamente" });
        }
      }
    );
  } catch (error) {
    console.error("Error en el registro del control de alimento:", error);
    res.status(500).json({ message: "Error en el registro del control de alimento" });
  }
};

const regiscontrolmedicamento = async (req, res) => {
  try {
    const {
      idgalpon,
      producto,
      cantidad,
      descripcion,
      fechaentrada,
      fecha,
      idunidad,
      estado,
    } = req.body;

    pool.query(
      "INSERT INTO controlmedicamento (idgalpon, producto, cantidad, descripcion, fechaentrada, fecha, idunidad, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [idgalpon, producto, cantidad, descripcion, fechaentrada, fecha, idunidad, estado],
      (error, results) => {
        if (error) {
          console.error("Error al registrar el control de alimento:", error);
          res.status(500).json({ message: "Error al registrar el control de alimento" });
        } else {
          console.log("Control de alimento registrado correctamente");
          res.status(200).json({ message: "Control de alimento registrado correctamente" });
        }
      }
    );
  } catch (error) {
    console.error("Error en el registro del control de medicamento:", error);
    res.status(500).json({ message: "Error en el registro del control de medicamento" });
  }
};

const regiscontroldiagnostico = async (req, res) => {
  try {
    const {
      idgalpon,
      descripcion,
      receta,
      fechaentrada,
      fecha,
      estado,
    } = req.body;

    pool.query(
      "INSERT INTO controldiagnostico (idgalpon, descripcion, receta, fechaentrada, fecha, estado) VALUES (?, ?, ?, ?, ?, ?)",
      [idgalpon, descripcion, receta, fechaentrada, fecha, estado],
      (error, results) => {
        if (error) {
          console.error("Error al registrar el control diagnóstico:", error);
          res.status(500).json({ message: "Error al registrar el control diagnóstico" });
        } else {
          console.log("Control diagnóstico registrado correctamente");
          res.status(200).json({ message: "Control diagnóstico registrado correctamente" });
        }
      }
    );
  } catch (error) {
    console.error("Error en el registro del control diagnóstico:", error);
    res.status(500).json({ message: "Error en el registro del control diagnóstico" });
  }
};


module.exports = { vistaprueba, regiscontrolpollos, regiscontrolalimento, regiscontrolmedicamento, regiscontroldiagnostico };
