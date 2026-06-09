import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.routes'
import activitiesRoutes from './routes/activities.routes'
import adminRoutes from './routes/admin.routes'

const app = express()
const PORT = process.env.PORT ?? 3000

app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*' }))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/auth', authRoutes)
app.use('/activities', activitiesRoutes)
app.use('/admin', adminRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
