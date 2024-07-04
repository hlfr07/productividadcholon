const mysql = require('mysql2'); // o 'mysql' si prefieres
/*
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  port: 3306,
  database: 'cholonjanina'
});
*/

const pool = mysql.createPool({
  host: 'b6xjmi7j0ue8hwkunxuy-mysql.services.clever-cloud.com',
  user: 'upfmpx4fksb0n2rb',
  password: 'DCOz8a8lnV98o3Wgpeof',
  port: 3306,
  database: 'b6xjmi7j0ue8hwkunxuy' 
});


// Exporta el pool para que pueda ser utilizado desde otros módulos
module.exports = pool;