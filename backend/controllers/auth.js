const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { username, password } = req.body;
  try {
    const userExists = await User.findOne({ username });
    if (userExists) return res.status(400).json({ message: 'El usuario ya existe' });

    const user = await User.create({ username, password });
    res.status(201).json({ message: 'Usuario registrado', userId: user._id });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
};

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user) {
    return res.status(400).json({ message: "Usuario no encontrado" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Credenciales incorrectas" });
  }

  const token = jwt.sign(
    { userId: user._id, role: user.role }, 
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token, username: user.username, role: user.role }); 
});