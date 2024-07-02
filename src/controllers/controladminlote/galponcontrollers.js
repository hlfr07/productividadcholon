
const pool = require("../../../database/conexion")
const vistagalpon = async (req, res) => {
  const nombre = req.session.user.nombreusuario;
  const perfil = req.session.user.nombreperfil;
  const idperfil = req.session.user.idperfil;

  // Consulta SQL
  const sqlActivo = `SELECT 
  galpon.idgalpon,
  galpon.nombregalpon,
  galpon.estadogalpon,
  CASE
      WHEN galpon.estadogalpon = 1 THEN 'Disponible'
      WHEN galpon.estadogalpon = 2 THEN 'Ocupado'
      WHEN galpon.estadogalpon = 0 THEN 'Mantenimiento'
      ELSE 'Desconocido'
    END AS disponibilidad
  FROM galpon
  WHERE estadogalpon = 1 OR estadogalpon= 2;
  `

  const sqlInactivo = `SELECT 
galpon.idgalpon,
galpon.nombregalpon,
galpon.estadogalpon,
CASE
      WHEN galpon.estadogalpon = 1 THEN 'Disponible'
      WHEN galpon.estadogalpon = 2 THEN 'Ocupado'
      WHEN galpon.estadogalpon = 0 THEN 'Mantenimiento'
      ELSE 'Desconocido'
    END AS disponibilidad
FROM galpon
WHERE estadogalpon = 0;`;

  // Ejecuta ambas consultas
  try {
    const [galpon, galponInactivos] = await Promise.all([
      pool.promise().query(sqlActivo),
      pool.promise().query(sqlInactivo)
    ]);

    console.log(idperfil);

    // Envía los resultados
    res.render("vistaadmin/lotes/galpon", {
      galpon: galpon[0],
      galponInactivos: galponInactivos[0],
      nombre: nombre,
      perfil: perfil,
      idperfil: idperfil,
    });
  } catch (err) {
    console.error("Error al ejecutar las consultas SQL:", err);
    res.status(500).send("Error en las consultas SQL");
  }
};
const regiscontrol = async (req, res) => {
  try {
    const { idgalpon, cantidadpollo, fechallegada, producto, mortalidadpollos, descripcion } = req.body;
    const estadocontrolgalpon = 1;
    const idunidad = 1;

    // Inserta el control galpon en la base de datos
    pool.query(
      "INSERT INTO controlgalpon (idgalpon, producto, cantidadpollo, descripcion, fechaentrada, mortalidad, fecha, idunidad, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [idgalpon, producto, cantidadpollo, descripcion, fechallegada, mortalidadpollos, fechallegada, idunidad, estadocontrolgalpon],
      (error, results) => {
        if (error) {
          console.error("Error al registrar el control galpon:", error);
          res.status(500).json({ message: "Error al registrar el control galpon" });
        } else {
          // Obtiene el ID 
          const idControlGalpon = results.insertId;

          console.log("Control Galpon registrado correctamente con ID:", idControlGalpon);

          // Actualiza el estado 
          pool.query(
            "UPDATE galpon SET estadogalpon = 2 WHERE idgalpon = ?",
            [idgalpon],
            (updateError) => {
              if (updateError) {
                console.error("Error al actualizar el estado del galpon:", updateError);
                res.status(500).json({ message: "Error al actualizar el estado del galpon" });
              } else {
                console.log("Estado del galpon actualizado correctamente a 2");
                res.status(200).json({ message: "Control Galpon registrado, estado del galpon actualizado y stock en la tabla de productos actualizado correctamente", idControlGalpon });
              }
            }
          );
        }
      }
    );
  } catch (error) {
    console.error("Error en el registro del control galpon:", error);
    res.status(500).json({ message: "Error en el registro del control galpon" });
  }
};


const regisgalpon = async (req, res) => {
  try {
    const { nombregalpon } = req.body;
    const estadogalpon = 1;

    pool.query(
      "INSERT INTO galpon (nombregalpon,estadogalpon ) VALUES (?,?)",
      [nombregalpon, estadogalpon],
      (error, results) => {
        if (error) {
          console.error("Error al registrar el usuario:", error);
          res.status(500).json({ message: "Error al registrar el usuario" });
        } else {
          console.log("Usuario registrado correctamente");
          res.status(200).json({ message: "Usuario registrado correctamente" });
        }
      }
    );
  } catch (error) {
    console.error("Error en el registro de usuario:", error);
    res.status(500).json({ message: "Error en el registro de usuario" });
  }
};

const vistagalponid = async (req, res) => {
  // Obtén el ID 
  const idgalpon = req.params.id;

  const sql = 'SELECT * FROM galpon WHERE idgalpon = ?';

  pool.query(sql, [idgalpon], (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta SQL:', err);
      res.status(500).json({ error: 'Error en la consulta SQL' });
      return;
    }
    console.log(results);

    if (results.length === 0) {
      res.status(404).json({ error: 'Galpon no encontrado' });
      return;
    }

    // Envía los resultados
    res.json(results[0]);
  });
};

const updategalponPUT = async (req, res) => {
  // Obtén el ID
  const idgalponobtenido = req.params.id;
  const { nombregalpon1 } = req.body;

  console.log(nombregalpon1);
  const sql = 'UPDATE galpon SET nombregalpon=?, estadogalpon = 1 WHERE idgalpon = ?';

  pool.query(sql, [nombregalpon1, idgalponobtenido], (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta SQL:', err);
      res.status(500).json({ error: 'Error en la consulta SQL' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: 'Galpon no encontrado' });
      return;
    }

    res.status(200).json({ mensaje: 'Categoria actualizado con éxito' });

  });
};


const deletegalpon = async (req, res) => {

  const idgalpon = req.params.id;

  const sql = 'UPDATE galpon SET estadogalpon = 0 WHERE idgalpon = ?';

  pool.query(sql, [idgalpon], (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta SQL:', err);
      res.status(500).json({ error: 'Error en la consulta SQL' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.status(200).json({ mensaje: 'Usuario eliminado con éxito' });


  });
};
const actgalpon = async (req, res) => {

  const idgalpon = req.params.id;

  const sql = 'UPDATE galpon SET estadogalpon = 1 WHERE idgalpon = ?';

  pool.query(sql, [idgalpon], (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta SQL:', err);
      res.status(500).json({ error: 'Error en la consulta SQL' });
      return;
    }

    if (results.affectedRows > 0) {
      res.status(200).json({ mensaje: 'Usuario restablecido con éxito' });
    } else {
      res.status(404).json({ error: 'Usuario no encontrado o no se realizó ninguna actualización' });
    }


  });
};

const patchcontrolgalpon = async (req, res) => {
  try {

    const idControlGalpon = req.params.id;

    const sql = 'UPDATE controlgalpon SET filtro = ? WHERE idControlGalpon = ?';

    pool.query(sql, [idControlGalpon, idControlGalpon], (error, results) => {
      if (error) {
        console.error('Error al ejecutar la consulta SQL:', error);
        res.status(500).json({ error: 'Error en la consulta SQL' });
        return;
      }

      if (results.affectedRows > 0) {
        res.status(200).json({ mensaje: 'Control Galpon actualizado con éxito' });
      } else {
        res.status(404).json({ error: 'Control Galpon no encontrado o no se realizó ninguna actualización' });
      }
    });
  } catch (error) {
    console.error('Error en el controlador de actualización:', error);
    res.status(500).json({ error: 'Error en el controlador de actualización' });
  }
};

module.exports = { vistagalpon, regisgalpon, vistagalponid, updategalponPUT, deletegalpon, actgalpon, regiscontrol, patchcontrolgalpon };