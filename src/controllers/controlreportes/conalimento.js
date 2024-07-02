const pool = require("../../../database/conexion");
const bcrypt = require("bcryptjs");
const util = require("util");

const vistareporali = async (req, res) => {
  const nombre = req.session.user.nombreusuario;
  const perfil = req.session.user.nombreperfil;

  // Consulta para obtener los datos generales de los galpones
  const sqlDatosGalpon = `
    SELECT 
    controlalimento.idcontrolalimento AS idcontrolalimento,
    controlalimento.idgalpon AS idgalpon,
    controlalimento.producto AS producto,
    controlalimento.cantidad AS cantidad,
    controlalimento.descripcion AS descripcion,
    controlalimento.fechaentrada AS fechaentrada,
    controlalimento.fecha AS fecha,
    unidad.nombre_unidad AS nombre_unidad,
    controlalimento.estado AS estado,
    galpon.nombregalpon AS nombregalpon
FROM controlalimento
JOIN galpon ON controlalimento.idgalpon = galpon.idgalpon
JOIN unidad ON controlalimento.idunidad = unidad.idunidad
WHERE controlalimento.estado = 1
ORDER BY controlalimento.fecha DESC;
  `;

  // Consulta para obtener las fechas únicas de controlgalpon
  const sqlFechasControlgalpon = `
    SELECT DISTINCT fecha
    FROM controlalimento
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
    res.render('vistaadmin/reportes/reporalimento', {
      galpon,
      nombre,
      perfil,
      fechas
    });
  } catch (error) {
    console.error('Error en la función vistareporgalpon:', error);
    res.status(500).send('Error en la aplicación');
  }
};

module.exports = { vistareporali };
