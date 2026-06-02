import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt'; // ✨ IMPORTAMOS BCRYPT

const router = Router();
const prisma = new PrismaClient();

// ─── 1. RUTA DE LOGIN (SEGURA) ───
router.post('/login-admin', async (req, res) => {
  const { usuario, password } = req.body;

  try {
    const admin = await prisma.administrador.findUnique({
      where: { usuario: usuario }
    });

    // Validamos si el usuario existe
    if (!admin) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    // ✨ LA MAGIA: Bcrypt compara el texto plano con el Hash de la BD
    const passwordValida = await bcrypt.compare(password, admin.password);
    
    if (!passwordValida) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    if (!admin.activo) {
      return res.status(403).json({ error: 'Usuario inactivo' });
    }

    res.json({
      mensaje: 'Login exitoso',
      usuario: { id: admin.id, nombre: admin.nombre, rol: admin.rol }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// ─── 2. RUTA TEMPORAL PARA CREAR UN ADMIN CON HASH ───
// TODO: Borrar esta ruta cuando ya tengas un módulo de "Crear Usuarios" en tu Frontend
router.post('/crear-admin-seguro', async (req, res) => {
  const { usuario, password, nombre } = req.body;

  try {
    // Encriptamos la contraseña dándole 10 "vueltas" de seguridad
    const passwordHasheada = await bcrypt.hash(password, 10);

    const nuevoAdmin = await prisma.administrador.create({
      data: {
        usuario: usuario,
        password: passwordHasheada, // Guardamos el hash, NUNCA el texto plano
        nombre: nombre,
        rol: 'ADMIN'
      }
    });

    res.json({ mensaje: 'Admin creado con éxito', admin: nuevoAdmin.usuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear administrador' });
  }
});

export default router;