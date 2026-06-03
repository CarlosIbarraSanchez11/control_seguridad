import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Obtener los ambientes de una Sede específica
router.get('/sede/:sedeId', async (req, res) => {
  try {
    const ambientes = await prisma.ambiente.findMany({
      where: { sedeId: Number(req.params.sedeId) }
    });
    res.json(ambientes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ambientes' });
  }
});

// Crear un nuevo ambiente
router.post('/', async (req, res) => {
  const { nombre, sedeId } = req.body;
  try {
    const nuevoAmbiente = await prisma.ambiente.create({
      data: { nombre, sedeId: Number(sedeId) }
    });
    res.json(nuevoAmbiente);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear ambiente' });
  }
});

// Eliminar un ambiente
router.delete('/:id', async (req, res) => {
  try {
    await prisma.ambiente.delete({
      where: { id: Number(req.params.id) }
    });
    res.json({ mensaje: 'Ambiente eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar ambiente' });
  }
});

export default router;