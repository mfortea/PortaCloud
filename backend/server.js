require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./routes/auth");

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Middlewares
app.use(express.json());
app.use(cors());

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI);

// Rutas
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));

// WebSockets: Notificar cambios en dispositivos
io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado");
  
  socket.on("updateDevices", async (userId) => {
    const devices = await Device.find({ userId }).select("-_id browser os lastActive");
    io.emit(`devicesUpdated-${userId}`, devices);
  });

  socket.on("disconnect", () => console.log("Cliente desconectado"));
});
