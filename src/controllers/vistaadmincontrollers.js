const pool = require("../../database/conexion");
const bcrypt = require("bcryptjs");

const vistaadmin = async (req, res) => {
  const idusuario = req.session.user.idusuario;
  const idperfil = req.session.user.idperfil;
  const nombre = req.session.user.nombreusuario;
  let perfil = "";

  switch (idperfil) {
    case 1:
      perfil = "SUPERADMIN";
      req.session.user.nombreperfil = "SUPERADMIN";
      break;
    case 2:
      perfil = "GERENTE GENERAL";
      req.session.user.nombreperfil = "GERENTE GENERAL";
      break;
    case 3:
      perfil = "GERENTE DE OPERACIONES AVICOLA";
      req.session.user.nombreperfil = "GERENTE DE OPERACIONES AVICOLA";
      break;
    case 4:
      perfil = "OPERADOR DE GALPON";
      req.session.user.nombreperfil = "OPERADOR DE GALPON";
      break;
    default:
      perfil = "INTRUSO";
      req.session.user.nombreperfil = "INTRUSO";
  }

  try {
    // Consulta SQL para obtener los últimos registros generales
    const queryUltimosRegistros = `
      WITH ultimos_registros AS (
        SELECT cg.idcontrolgalpon,
               cg.idgalpon,
               cg.producto,
               cg.cantidadpollo,
               cg.descripcion,
               cg.fechaentrada,
               cg.mortalidad,
               cg.fecha,
               cg.idunidad,
               cg.estado,
               ROW_NUMBER() OVER(PARTITION BY cg.idgalpon ORDER BY cg.fecha DESC) AS rn
        FROM controlgalpon cg
        JOIN galpon g ON cg.idgalpon = g.idgalpon
        WHERE g.estadogalpon = 2
          AND cg.estado = 1
      )
      SELECT ur.idcontrolgalpon,
             ur.idgalpon,
             ur.producto,
             ur.cantidadpollo,
             ur.descripcion,
             ur.fechaentrada,
             ur.mortalidad,
             ur.fecha,
             ur.idunidad,
             ur.estado
      FROM ultimos_registros ur
      WHERE ur.rn = 1;
    `;

    // Consulta SQL para obtener los últimos registros con descripción "Nuevo registro!"
    const queryUltimosRegistrosNuevo = `
      WITH ultimos_registros AS (
    SELECT 
        cg.idcontrolgalpon,
        cg.idgalpon,
        cg.producto,
        cg.cantidadpollo,
        cg.descripcion,
        cg.fechaentrada,
        cg.mortalidad,
        cg.fecha,
        cg.idunidad,
        cg.estado,
        g.nombregalpon AS nombre_galpon, -- Agregar el nombre del galpón
        ROW_NUMBER() OVER(PARTITION BY cg.idgalpon ORDER BY cg.fecha DESC) AS rn
    FROM 
        controlgalpon cg
        JOIN galpon g ON cg.idgalpon = g.idgalpon
    WHERE 
        g.estadogalpon = 2
        AND cg.estado = 1
        AND cg.descripcion LIKE '%Nuevo registro!%' -- Condición adicional para descripción
)
SELECT 
    ur.idcontrolgalpon,
    ur.idgalpon,
    ur.nombre_galpon, -- Seleccionar el nombre del galpón
    ur.producto,
    ur.cantidadpollo,
    ur.descripcion,
    ur.fechaentrada,
    ur.mortalidad,
    ur.fecha,
    ur.idunidad,
    ur.estado
FROM 
    ultimos_registros ur
WHERE 
    ur.rn = 1;
    `;

    // Ejecutar la primera consulta SQL
    pool.query(queryUltimosRegistros, (err1, result1) => {
      if (err1) {
        console.error("Error al ejecutar la consulta de últimos registros generales:", err1);
        return res.status(500).send("Error en la consulta de últimos registros generales");
      }

      // Ejecutar la segunda consulta SQL
      pool.query(queryUltimosRegistrosNuevo, (err2, result2) => {
        if (err2) {
          console.error("Error al ejecutar la consulta de últimos registros con descripción 'Nuevo registro!':", err2);
          return res.status(500).send("Error en la consulta de últimos registros con descripción 'Nuevo registro!'");
        }

        // Calcular mortalidad por idgalpon
        const mortalidadPorIdGalpon = {};

        // Iterar sobre los resultados de result1 (queryUltimosRegistros)
        result2.forEach(r1 => {
          const idgalpon = r1.idgalpon;
          const cantidadInicial = r1.cantidadpollo;

          // Encontrar el registro correspondiente en result2 (queryUltimosRegistrosNuevo)
          const r2 = result1.find(r => r.idgalpon === idgalpon);
          if (r2) {
            const cantidadFinal = r2.cantidadpollo;
            const mortalidad = ((cantidadInicial - cantidadFinal) * 100) / cantidadInicial;
            // Almacenar los datos en el objeto mortalidadPorIdGalpon
            mortalidadPorIdGalpon[idgalpon] = {
              idgalpon,
              nombre_galpon: r1.nombre_galpon,
              mortalidad,
              cantidadInicial,
              cantidadFinal
            };
            // Almacenar mortalidad por idgalpon en el objeto
            // mortalidadPorIdGalpon[idgalpon] = mortalidad;
          }
        });

        console.log(mortalidadPorIdGalpon);

        // Renderizar la vista con los resultados de ambas consultas
        res.render("vistaadmin/vistaadmin", {
          idusuario,
          idperfil,
          nombre,
          perfil,
          resultadosGenerales: result1, // Resultados de la primera consulta
          resultadosNuevoRegistro: result2, // Resultados de la segunda consulta
          mortalidadPorIdGalpon,
        });
      });
    });
  } catch (err) {
    console.error("Error al ejecutar las consultas SQL:", err);
    res.status(500).send("Error en las consultas SQL");
  }
};

module.exports = { vistaadmin };

