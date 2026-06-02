import { Router, Request, Response } from 'express'
import prisma from '../prisma'

const router = Router()

router.get('/', async (_req: Request, res: Response) => {
  try {
    const turnos = await prisma.turno.findMany({
      include: { guardia: true, sede: true }
    })
    res.json(turnos)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener turnos' })
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const { emplazamiento, horaInicio, horaFin, diasSemana, semana, sedeId, guardiaId } = req.body as {
      emplazamiento: string
      horaInicio: string
      horaFin: string
      diasSemana: object
      semana?: string
      sedeId: number
      guardiaId: number
    }
    const turno = await prisma.turno.create({
      data: { emplazamiento, horaInicio, horaFin, diasSemana, semana, sedeId, guardiaId }
    })
    res.json(turno)
  } catch (error) {
    res.status(500).json({ error: 'Error al crear turno' })
  }
})

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const turno = await prisma.turno.update({
      where: { id: Number(req.params.id) },
      data: req.body
    })
    res.json(turno)
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar turno' })
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.turno.delete({ where: { id: Number(req.params.id) } })
    res.json({ ok: true })
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar turno' })
  }
})

export default router