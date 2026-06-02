import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import sedesRouter from './routes/sedesRoutes'
import guardiasRouter from './routes/guardiasRoutes'
import turnosRouter from './routes/turnosRoutes'
import marcacionesRouter from './routes/marcacionesRoutes'
import authRouter from './routes/authRoutes' // ✨ NUEVO: Importamos el router de autenticación

dotenv.config()

const app = express()

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

// Rutas
app.use('/api/sedes', sedesRouter)
app.use('/api/guardias', guardiasRouter)
app.use('/api/turnos', turnosRouter)
app.use('/api/marcaciones', marcacionesRouter)
app.use('/api/auth', authRouter) // ✨ NUEVO: Registramos la ruta para el login

// Ruta de prueba
app.get('/', (_req: Request, res: Response) => {
  res.json({ mensaje: '🚀 Backend control_seguridad funcionando' })
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`)
})