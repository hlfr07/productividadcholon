const pool = require("../../../database/conexion");
const bcrypt = require("bcryptjs");
const util = require("util");

const vistarepormedi= async (req, res) => {
  const nombre = req.session.user.nombreusuario;
  const perfil = req.session.user.nombreperfil;
  const idperfil = req.session.user.idperfil;

  // Consulta para obtener los datos generales de los galpones
  const sqlDatosGalpon = `
    SELECT 
    controlmedicamento.idcontrolmedicamento AS idcontrolmedicamento,
    controlmedicamento.idgalpon AS idgalpon,
    controlmedicamento.producto AS producto,
    controlmedicamento.cantidad AS cantidad,
    controlmedicamento.descripcion AS descripcion,
    controlmedicamento.fechaentrada AS fechaentrada,
    controlmedicamento.fecha AS fecha,
    unidad.nombre_unidad AS nombre_unidad,
    controlmedicamento.estado AS estado,
    galpon.nombregalpon AS nombregalpon
FROM controlmedicamento
JOIN galpon ON controlmedicamento.idgalpon = galpon.idgalpon
JOIN unidad ON controlmedicamento.idunidad = unidad.idunidad
WHERE controlmedicamento.estado = 1
ORDER BY controlmedicamento.fecha DESC;
  `;

  // Consulta para obtener las fechas únicas de controlgalpon
  const sqlFechasControlgalpon = `
    SELECT DISTINCT fecha
    FROM controlmedicamento
    ORDER BY fecha DESC;
  `;

  try {
    // Ejecutar ambas consultas
    const [resultadosGalpon, resultadosFechas] = await Promise.all([
      pool.promise().query(sqlDatosGalpon),
      pool.promise().query(sqlFechasControlgalpon)
    ]);

    const galpon = resultadosGalpon[0];
    const fechas = resultadosFechas[0];

    console.log(fechas);

    // Envía los resultados de ambas consultas a la vista
    res.render('vistaadmin/reportes/reportemedi', {
      galpon,
      nombre,
      perfil,
      fechas,
      idperfil
    });
  } catch (error) {
    console.error('Error en la función vistareporgalpon:', error);
    res.status(500).send('Error en la aplicación');
  }
};

module.exports = { vistarepormedi };
