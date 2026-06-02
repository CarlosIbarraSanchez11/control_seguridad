import { Router, Request, Response } from 'express'
import prisma from '../prisma'

const router = Router()

router.get('/', async (_req: Request, res: Response) => {
  try {
    const sedes = await prisma.sede.findMany()
    res.json(sedes)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener sedes' })
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const { nombre, lat, lng, radio } = req.body as {
      nombre: string
      lat: number
      lng: number
      radio: number
    }
    const sede = await prisma.sede.create({
      data: { nombre, lat, lng, radio }
    })
    res.json(sede)
  } catch (error) {
    res.status(500).json({ error: 'Error al crear sede' })
  }
})

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const sede = await prisma.sede.update({
      where: { id: Number(req.params.id) },
      data: req.body
    })
    res.json(sede)
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar sede' })
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.sede.delete({ where: { id: Number(req.params.id) } })
    res.json({ ok: true })
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar sede' })
  }
})

export default router