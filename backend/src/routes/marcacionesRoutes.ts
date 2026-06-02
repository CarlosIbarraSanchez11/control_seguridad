import { Router, Request, Response } from 'express'
import prisma from '../prisma'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
  try {
    const { guardiaId, sedeId } = req.query
    const marcaciones = await prisma.marcacion.findMany({
      where: {
        ...(guardiaId && { guardiaId: Number(guardiaId) }),
        ...(sedeId && { sedeId: Number(sedeId) })
      },
      include: { guardia: true, sede: true },
      orderBy: { creadoEn: 'desc' }
    })
    res.json(marcaciones)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener marcaciones' })
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const { tipo, lat, lng, distancia, dentroRango, guardiaId, sedeId, turnoId } = req.body as {
      tipo: 'ENTRADA' | 'SALIDA'
      lat: number
      lng: number
      distancia: number
      dentroRango: boolean
      guardiaId: number
      sedeId: number
      turnoId?: number
    }
    const marcacion = await prisma.marcacion.create({
      data: { tipo, lat, lng, distancia, dentroRango, guardiaId, sedeId, turnoId }
    })
    res.json(marcacion)
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar marcación' })
  }
})

export default router