const express = require("express");
const pool = require("../../database/conexion");
const session = require("express-session");
const bcrypt = require("bcryptjs");

const {
  vistaregiadmin,
  registrarUsuarios,
} = require("../controllers/registraradmincontrollers");
const { vistalogin } = require("../controllers/logincontrollers");
const { vistaadmin } = require("../controllers/vistaadmincontrollers");
const {
  vistasegperfil,
} = require("../controllers/controladmin/segperfilcontrollers");
const {
  vistasegusuarios,
  vistausuariosid,
  updateusuariosPUT,
  deleteUsuarios,
  actusuario,
} = require("../controllers/controladmin/segusuariocontrollers");
const {
  vistasegreguser,
  segreguser,
} = require("../controllers/controladmin/segregusercontrollers");
const {
  vistasegpasword,
  vistapasswordid,
  updatepasswordPUT,
} = require("../controllers/controladmin/segpasswordcontrollers");

const {
  vistagalpon,
  regisgalpon,
  vistagalponid,
  updategalponPUT,
  deletegalpon,
  actgalpon,
  regiscontrol,
  patchcontrolgalpon,
} = require("../controllers/controladminlote/galponcontrollers");

const {
  vistaprueba,
  regiscontrolpollos,
  regiscontrolalimento,
  regiscontrolmedicamento,
  regiscontroldiagnostico,
} = require("../controllers/controladminlote/pruebacontrollers");
const {
  vistareporusuarios,
} = require("../controllers/controlreportes/usuariocontroller");
const {
  vistareporgalpon,
} = require("../controllers/controlreportes/galponcontroller");
const { vistareporali } = require("../controllers/controlreportes/conalimento");
const { vistarepormedi } = require("../controllers/controlreportes/controlmedi");
const { vistarediag } = require("../controllers/controlreportes/controldiag");

const router = express.Router();

//PARA PROTEGER LAS RUTAS SI NO ESTA LOGEADO LML
function protegerRutas(req, res, next) {
  const datosdelaSessiondeUsuario = req.session.user; // Obtener los datos del usuario de la sesión

  if (!datosdelaSessiondeUsuario) {
    // Si el usuario no ha iniciado sesión, redirigir a la página de login
    return res.redirect("/login");
  }

  const idperfil = datosdelaSessiondeUsuario.idperfil; // Corregir el acceso al campo 'cargo' en lugar de 'idperfil'
  const idusuario = datosdelaSessiondeUsuario.idusuario;
  if (
    (idperfil === 1 && req.path.startsWith("/admin")) ||
    (idperfil === 2 && req.path.startsWith("/admin")) ||
    (idperfil === 3 && req.path.startsWith("/admin")) ||
    (idperfil === 4 && req.path.startsWith("/admin"))
  ) {
    req.idperfil = idperfil;
    req.idusuario = idusuario; // Agregar el ID del usuario // Agregar el ID del usuario al objeto de solicitud (req)
    next(); // Permitir el acceso
  } else {
    // Perfil no autorizado para acceder a esta ruta
    res.redirect("/login");
  }
}

//GUARDA SESION DE USUARIO
// Configurar express-session
router.use(
  session({
    secret: "secreto",
    resave: false,
    saveUninitialized: true,
  })
);

//ADMIN
router.get("/registro", vistaregiadmin);
router.post("/registro", registrarUsuarios);

//ADMINSEGURIDADGPERFIL
router.get("/admin/perfiles", protegerRutas, vistasegperfil);

//ADMINSEGURIDADUSUARIO
router.get("/admin/usuarios", protegerRutas, vistasegusuarios);
router.get("/admin/usuarios/:id", protegerRutas, vistausuariosid);
router.put("/admin/usuarios/:id", protegerRutas, updateusuariosPUT);
router.delete("/admin/usuarios/:id", protegerRutas, deleteUsuarios);
router.delete("/admin/borrausuario/:id", protegerRutas, actusuario);
//ADMINSEGREGISTRARUSUARIO
router.get("/admin/reguser", protegerRutas, vistasegreguser);
router.post("/admin/reguser", protegerRutas, segreguser);
//ADMINSEGPASSWORD
router.get("/admin/password", protegerRutas, vistasegpasword);
router.get("/admin/password/:id", protegerRutas, vistapasswordid);
router.put("/admin/password/:id", protegerRutas, updatepasswordPUT);

//GALPON
router.get("/admin/galpon", protegerRutas, vistagalpon);
router.post("/admin/galpon", protegerRutas, regisgalpon);
router.get("/galpon/:id", vistagalponid);
router.put("/admin/galpon/:id", protegerRutas, updategalponPUT);
router.delete("/admin/galpon/:id", protegerRutas, deletegalpon);
router.delete("/admin/borragalpon/:id", protegerRutas, actgalpon);
router.post("/admin/controlgalpon", protegerRutas, regiscontrol);
router.patch("/admin/controlgalpon/:id", patchcontrolgalpon);

//prueba
router.get("/admin/prueba", protegerRutas, vistaprueba);
router.post("/admin/controlpollos", protegerRutas, regiscontrolpollos);
router.post("/admin/controlalimento", protegerRutas, regiscontrolalimento);
router.post("/admin/controlmedicamento", protegerRutas, regiscontrolmedicamento);
router.post("/admin/controldiagnostico", protegerRutas, regiscontroldiagnostico);
//REPORTES
router.get("/admin/reportes_usuarios", protegerRutas, vistareporusuarios);
router.get("/admin/reportes_galpon", protegerRutas, vistareporgalpon);
router.get("/admin/reportes_alimento", protegerRutas, vistareporali);
router.get("/admin/reportes_medicamento", protegerRutas, vistarepormedi);
router.get("/admin/reportes_diagnostico", protegerRutas, vistarediag);


//LOGIN
router.get("/", vistalogin);
router.get("/login", vistalogin);
//POST DE LOGIN PARA COMPARA LOS DATOOS DE LOGIN
router.post("/login", async (req, res) => {
  try {
    const { correo, password } = req.body;

    // Busca el usuario en la base de datos por nombre de usuario
    pool.query(
      "SELECT * FROM usuario WHERE correo = ?",
      [correo],
      async (error, results) => {
        console.log(results);
        if (error) {
          console.error("Error en el servidor:", error);
          res.render("login", { message: "Error al buscar Usuario" });
        } else if (results.length === 0) {
          // El usuario no existe
          res.render("login", { message: "Correo no encontrado" });
        } else if (results[0].estado === 0) {
          // El usuario no existe
          res.render("login", { message: "Este correo esta Inactivo" });
        } else {
          // Compara la contraseña proporcionada con la almacenada en la base de datos
          const resultadodetablausuario = results[0];
          const contrasenaValida = await bcrypt.compare(
            password,
            resultadodetablausuario.password
          );

          if (contrasenaValida) {
            req.session.user = {
              idperfil: resultadodetablausuario.idperfil,
              nombreperfil: resultadodetablausuario.perfil,
              idusuario: resultadodetablausuario.idusuario,
              nombreusuario: resultadodetablausuario.nombre,
            };
            console.log(
              resultadodetablausuario.idperfil,
              resultadodetablausuario.perfil,
              resultadodetablausuario.idusuario,
              resultadodetablausuario.nombre
            );
            switch (resultadodetablausuario.idperfil) {
              case 1: // Cambiado de "1" a 1
                res.redirect("/admin/");
                break;
              case 2: // Cambiado de "2" a 2
                res.redirect("/admin/");
                break;
              case 3: // Cambiado de "3" a 3
                res.redirect("/admin/");
                break;
              default:
                res.redirect("/admin/");
            }
          } else {
            // Contraseña incorrecta
            res.render("login", { message: "Contraseña Incorrecta" });
          }
        }
      }
    );
  } catch (error) {
    console.error("Error en el inicio de sesión:", error);
    res.status(500).json({ message: "Error en el inicio de sesión" });
  }
});

//VISTA DEL ADMIN DESPUES LOGEADO
router.get("/admin", protegerRutas, vistaadmin);

//PARA CERRAR SESION
router.get("/salir", (req, res) => {
  // Eliminar la sesión del usuario
  req.session.destroy((error) => {
    if (error) {
      console.error(error);
      return res.status(500).send("Internal Server Error");
    }

    // Redirigir al usuario a la página de inicio de sesión
    res.redirect("/login");
  });
});

module.exports = router;
