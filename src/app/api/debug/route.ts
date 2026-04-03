import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Nao autenticado' })

  const empresa = await prisma.empresa.findUnique({
    where: { id: auth.empresaId }
  })

  const usuario = await prisma.usuario.findUnique({
    where: { id: auth.userId }
  })

  return NextResponse.json({
    tokenData: auth,
    empresaExiste: !!empresa,
    empresaId: empresa?.id,
    usuarioExiste: !!usuario,
    usuarioEmpresaId: usuario?.empresaId
  })
}
