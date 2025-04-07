# PortaCloud: Gestor de Portapapeles Multiplataforma con Sincronización en la Nube
Trabajo de Fin de Grado para el Grado en Ingeniería Informática. Universidad de Córdoba (UCO)

![Logo de PortaCloud](frontend/portacloud/public/favicon.ico)


## 📚 Tecnologías utilizadas

- Backend: NodeJS
- Frontend: React
- Control de versiones: Git
- Base de datos: Mongodb (Mongodb Atlas)

## 🌳 Estructura del proyecto
- `backend/`: Contiene el código del servidor.
  - `models/`: Modelos de datos de MongoDB.
  - `routes/`: Rutas de la API.
  - `controllers/`: Lógica de las rutas.
  - `utils/`: Funciones auxiliares.

- `frontend/portacloud/`: Contiene el código del cliente.
  - `app/`: Páginas principales de la aplicación.
  - `components/`: Componentes reutilizables.
  - `context/`: Manejo del estado global.
  
## 🚀Despliegue local

### ⚙️ Backend
```bash
cd backend
node server.js
```
### 🖌️ Frontend
```bash
cd frontend/portacloud
npm run dev
```
Accedemos al frontend desde http://localhost:3000

## 🌍 Despliegue online
### ⚙️ Backend

El backend del proyecto está alojado en Render:

https://portacloud-backend.onrender.com

### 🖌️ Frontend
El frontend del proyecto está alojado en el sitio web Vercel:

https://portacloud.vercel.app

### 📦 Base de datos

La base de datos del proyecto utilizada está alojada en Mongodb Atlas.

https://www.mongodb.com/products/platform/atlas-database
