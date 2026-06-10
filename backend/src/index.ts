import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import { prisma } from './lib/prisma'
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

async function ensureAdmin() {
  const count = await prisma.admin.count()
  if (count > 0) return

  const email = process.env.ADMIN_EMAIL ?? 'admin@saudemais.com'
  const password = process.env.ADMIN_PASSWORD ?? 'admin123'
  const passwordHash = await bcrypt.hash(password, 10)
  await prisma.admin.create({ data: { email, passwordHash } })
  console.log(`Admin padrão criado: ${email}`)
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  ensureAdmin().catch(console.error)
})
