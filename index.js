import express from "express";
import fs from "fs";
const app = express();

import { suma, resta, multiplicacion, division } from "./operaciones.js";

/* -----------------------------------RUTA PRINCIPAL-------------------------------- */
app.get("/", (req, res) => {
  let mensaje = "Hola";
  let horaActual = new Date().getHours();
  function obtenerMensaje() {
    return horaActual >= 6 && horaActual < 13
      ? "Buenos Dias!"
      : horaActual >= 13 && horaActual < 20
      ? "Buenas Tardes!"
      : horaActual >= 20 || horaActual < 6
      ? "Buenas Noches!"
      : mensaje;
  }

  res.send(`<h1>${obtenerMensaje()}</h1>`);
});

/* -----------------------------------RUTA RANDOM-------------------------------- */
app.get("/random", (req, res) => {
  let obj = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
    10: 0,
    11: 0,
    12: 0,
    13: 0,
    14: 0,
    15: 0,
    16: 0,
    17: 0,
    18: 0,
    19: 0,
    20: 0,
  };

  for (let i = 0; i < 10000; i++) {
    obj[`${Math.floor(Math.random() * 20 + 1)}`]++;
  }

  res.json(obj);
});

/* -----------------------------------RUTA INFO------------------------------- */
app.get("/info", (req, res) => {
  (async () => {
    let info = {
      contenidoStr: "",
      contenidoObj: "",
      size: 0,
    };

    try {
      let datos = await fs.promises.readFile("./package.json", "utf-8");
      let tamanio = await fs.promises.stat("./package.json", "utf-8");
      info.contenidoStr = JSON.stringify(JSON.parse(datos));
      info.contenidoObj = JSON.parse(datos);
      info.size = tamanio.size + " kB";
      console.log(info);

      await fs.promises.writeFile("./info.txt", JSON.stringify(info, null, 1));

      res.json(info);
    } catch (error) {
      console.log(`Error en operación asincrónica de fs: ${error}`);
    }
  })();
});

/* -----------------------------------RUTA OPERACIONES------------------------------- */
app.get("/operaciones/", (req, res) => {
  //NOTA: Siempre que haya caracteres en un query, typeof de dicho query es string. Si está vacío, es undefined.
  //EJ: console.log(req.query) = {num1: '1'}
  //typeof req.query.num1 = string.
  let queryParams = req.query;
  let number1 = queryParams.num1;
  let number2 = queryParams.num2;
  let operacion = queryParams.operacion;

  function validarOperacion() {
    let failureObj = {
      error: {
        num1: { valor: "default", tipo: "string" },
        num2: { valor: "default", tipo: "string" },
        operacion: { valor: "default", tipo: "string" },
      },
    };

    let esValido = true;

    failureObj.error.num1.valor = number1;

    failureObj.error.num1.tipo = typeof number1;
    failureObj.error.num2.valor = number2;
    failureObj.error.num2.tipo = typeof number2;
    failureObj.error.operacion.valor = operacion;
    failureObj.error.operacion.tipo = typeof operacion;

    let operacionesAComparar = ["suma", "resta", "multiplicacion", "division"];

    if (isNaN(number1)) {
      esValido = false;
    } else {
      //Si se ingresa un número, cambiamos el tipo artificialmente, para que no diga siempre string
      failureObj.error.num1.tipo = "number";
    }

    if (isNaN(number2)) {
      esValido = false;
    } else {
      failureObj.error.num2.tipo = "number";
    }

    if (number1 == undefined) {
      //Si el query no se incluye en el path pedido, no aparecera en el objeto error.
      //EJ: req.query = {num2: '2', operacion: 'suma'}, error.num1.valor
      //no aparecera en el objeto error, pero error.num1.tipo si.
      //Agregamos el valor 'undefined' artificialmente
      failureObj.error.num1.valor = "undefined";
      esValido = false;
    }

    if (number2 == undefined) {
      failureObj.error.num2.valor = "undefined";
      esValido = false;
    }

    if (operacion == undefined) {
      failureObj.error.operacion.valor = "undefined";
      esValido = false;
    }

    if (!operacionesAComparar.includes(operacion)) {
      esValido = false;
    }

    return esValido ? null : failureObj;
  }

  function realizarOperacion() {
    let successObj = {
      success: {
        num1: { valor: "a", tipo: "string" },
        num2: { valor: "b", tipo: "string" },
        operacion: { valor: "suma", tipo: "string" },
        resultado: 0,
      },
    };

    successObj.success.num1.valor = number1;
    successObj.success.num1.tipo = "number";
    successObj.success.num2.valor = number2;
    successObj.success.num2.tipo = "number";
    successObj.success.operacion.valor = operacion;
    successObj.success.operacion.tipo = typeof operacion;

    switch (operacion) {
      case "suma":
        successObj.success.resultado = suma(Number(number1), Number(number2));
        break;
      case "resta":
        successObj.success.resultado = resta(Number(number1), Number(number2));
        break;
      case "multiplicacion":
        successObj.success.resultado = multiplicacion(
          Number(number1),
          Number(number2)
        );
        break;
      case "division":
        successObj.success.resultado = division(
          Number(number1),
          Number(number2)
        );
        break;
    }

    return successObj.success;
  }

  let resultado = validarOperacion();

  if (resultado == null) {
    res.json(realizarOperacion());
  } else {
    res.json(resultado);
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Servidor andando en puerto ${port}`);
});
