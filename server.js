const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const app = express();
const host = process.env.HOST || "localhost";
const protocol = process.env.PROTOCOL || "http";
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.info(
    `Servidor corriendo en ${protocol}://${host}:${port} | el proceso asociado al servidor es el ${process.pid}`
  );
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const filePath = "./deportes.json";

// Funcion para leer JSON
const readFile = () => {
  return JSON.parse(fs.readFileSync(filePath));
};

// funcion para escribir JSON
const writeFile = (data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Crear un archivo JSON si no existe
if (!fs.existsSync(filePath)) {
  writeFile({ deportes: [] });
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/deportes", (req, res) => {
  const data = readFile();
  res.json(data);
});

app.post("/agregar", (req, res) => {
  const { nombre, precio } = req.body;
  if (!nombre || !precio) {
    return res.status(400).send("Nombre y precio son requeridos");
  }
  const data = readFile();
  data.deportes.push({ nombre, precio });
  writeFile(data);
  res.send("Deporte agregado");
});

// Editar deporte existente
app.put("/editar", (req, res) => {
  const { nombre, precio } = req.body;
  if (!nombre || !precio) {
    return res.status(400).send("Nombre y precio son requeridos");
  }
  const data = readFile();
  const deporte = data.deportes.find((d) => d.nombre === nombre);
  if (!deporte) {
    return res.status(404).send("Deporte no encontrado");
  }
  deporte.precio = precio;
  writeFile(data);
  res.send("Deporte actualizado");
});

// Eliminar deporte
app.delete("/eliminar", (req, res) => {
  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).send("Nombre es requerido");
  }
  const data = readFile();
  const deportes = data.deportes.filter((d) => d.nombre !== nombre);
  if (deportes.length === data.deportes.length) {
    return res.status(404).send("Deporte no encontrado");
  }
  data.deportes = deportes;
  writeFile(data);
  res.send("Deporte eliminado");
});
