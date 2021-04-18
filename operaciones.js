const suma = (a, b) => a + b;
const resta = (a, b) => a - b;
const multiplicacion = (a, b) => a * b;
const division = (a, b) =>
  b != 0 ? a / b : "Pruebe un divisor distinto de cero";

export { suma, resta, multiplicacion, division };
