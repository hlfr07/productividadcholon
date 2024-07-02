const pool = require("../../../database/conexion");
const bcrypt = require("bcryptjs");
const util = require("util");

const vistareporgalpon = async (req, res) => {
  const nombre = req.session.user.nombreusuario;
  const perfil = req.session.user.nombreperfil;

  // Consulta para obtener los datos generales de los galpones
  const sqlDatosGalpon = `
    SELECT 
      controlgalpon.idcontrolgalpon,
      controlgalpon.fechaentrada,
      galpon.nombregalpon,
      controlgalpon.cantidadpollo,
      controlgalpon.fecha AS fecha,
      controlgalpon.producto,
      controlgalpon.mortalidad,
      controlgalpon.descripcion
    FROM controlgalpon
    JOIN galpon ON controlgalpon.idgalpon = galpon.idgalpon
    WHERE controlgalpon.estado = 1
    ORDER BY controlgalpon.fecha DESC;
  `;

  // Consulta para obtener las fechas únicas de controlgalpon
  const sqlFechasControlgalpon = `
    SELECT DISTINCT fecha
    FROM controlgalpon
    ORDER BY fecha ASC;
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
    res.render('vistaadmin/reportes/reporgalpon', {
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

module.exports = { vistareporgalpon };
