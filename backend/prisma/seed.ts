import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  const existing = await prisma.admin.findUnique({ where: { email } })
  if (existing) {
    console.log(`Admin já existe: ${email}`)
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)
  await prisma.admin.create({ data: { email, passwordHash } })
  console.log(`Admin criado: ${email}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
