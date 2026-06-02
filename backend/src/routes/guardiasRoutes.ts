import { Router, Request, Response } from 'express'
import prisma from '../prisma'

const router = Router()

router.get('/', async (_req: Request, res: Response) => {
  try {
    const guardias = await prisma.guardia.findMany({
      include: { sede: true }
    })
    res.json(guardias)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener guardias' })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const guardia = await prisma.guardia.findUnique({
      where: { id: Number(req.params.id) },
      include: { sede: true }
    })
    if (!guardia) return res.status(404).json({ error: 'Guardia no encontrado' })
    res.json(guardia)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener guardia' })
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const { nombre, dni, perfil, plantilla, descriptor, sedeId } = req.body as {
      nombre: string
      dni: string
      perfil: string
      plantilla?: string
      descriptor?: number[]
      sedeId?: number
    }
    const guardia = await prisma.guardia.create({
      data: { nombre, dni, perfil, plantilla, descriptor, sedeId }
    })
    res.json(guardia)
  } catch (error) {
    res.status(500).json({ error: 'Error al crear guardia' })
  }
})

router.patch('/:id/descriptor', async (req: Request, res: Response) => {
  try {
    const { descriptor } = req.body as { descriptor: number[] }
    const guardia = await prisma.guardia.update({
      where: { id: Number(req.params.id) },
      data: { descriptor }
    })
    res.json(guardia)
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar descriptor facial' })
  }
})

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const guardia = await prisma.guardia.update({
      where: { id: Number(req.params.id) },
      data: req.body
    })
    res.json(guardia)
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar guardia' })
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.guardia.delete({ where: { id: Number(req.params.id) } })
    res.json({ ok: true })
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar guardia' })
  }
})

export default router