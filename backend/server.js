require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const savedRoutes = require('./routes/savedRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const passport = require('./config/passportConfig');
const imageRoutes = require('./routes/imageRoutes');
const cleanOrphanFiles = require("./utils/cleaner");
const path = require("path");

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
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/saved', savedRoutes);
app.use('/device', deviceRoutes);
app.use('/images', imageRoutes);
app.use("/device/temp_image", express.static(path.join(__dirname, "temp_uploads")));

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
