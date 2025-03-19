require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./routes/auth");
const savedRoutes = require("./routes/saved");
const adminRoutes = require("./routes/admin");
const passport = require('./config/passportConfig');
const cleanOrphanFiles = require("./utils/cleaner");

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
app.use(passport.initialize())

// Middlewares
app.use(express.json());
app.use(cors());

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI);

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/saved", savedRoutes);
app.use("/api/admin", adminRoutes);
app.use("/uploads", express.static("uploads"));

cleanOrphanFiles();

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
