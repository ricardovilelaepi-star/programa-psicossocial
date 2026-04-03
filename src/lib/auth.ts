import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'segredo-temporario-dev'

interface TokenPayload {
  userId: string
  empresaId?: string
  papel: string
}

interface AuthUser {
  userId: string
  empresaId: string
  papel: string
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}

// Retorna userId + empresaId ativa (cookie empresaAtiva tem prioridade sobre JWT)
export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  // Prioridade: cookie empresaAtiva > empresaId do JWT
  const empresaAtiva = cookieStore.get('empresaAtiva')?.value
  const empresaId = empresaAtiva || payload.empresaId

  if (!empresaId) return null

  return {
    userId: payload.userId,
    empresaId,
    papel: payload.papel,
  }
}

// Retorna apenas userId sem exigir empresa selecionada
export async function getAuthUserId(): Promise<{ userId: string; papel: string } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  return {
    userId: payload.userId,
    papel: payload.papel,
  }
}
