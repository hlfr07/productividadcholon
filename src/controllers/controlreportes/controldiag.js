const pool = require("../../../database/conexion");
const bcrypt = require("bcryptjs");
const util = require("util");

const vistarediag= async (req, res) => {
  const nombre = req.session.user.nombreusuario;
  const perfil = req.session.user.nombreperfil;
  const idperfil = req.session.user.idperfil;

  // Consulta para obtener los datos generales de los galpones
  const sqlDatosGalpon = `
    SELECT 
    controldiagnostico.idcontroldiagnostico AS idcontroldiagnostico,
    controldiagnostico.idgalpon AS idgalpon,
    controldiagnostico.descripcion AS descripcion,
    controldiagnostico.receta AS receta,
    controldiagnostico.fechaentrada AS fechaentrada,
    controldiagnostico.fecha AS fecha,
    controldiagnostico.estado AS estado,
    galpon.nombregalpon AS nombregalpon
FROM controldiagnostico
JOIN galpon ON controldiagnostico.idgalpon = galpon.idgalpon
WHERE controldiagnostico.estado = 1
ORDER BY controldiagnostico.fecha DESC;
  `;

  // Consulta para obtener las fechas únicas de controlgalpon
  const sqlFechasControlgalpon = `
    SELECT DISTINCT fecha
    FROM controldiagnostico
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
    res.render('vistaadmin/reportes/reportediag', {
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

module.exports = { vistarediag };
