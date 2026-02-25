import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken, COOKIE_NAME } from '@/lib/auth'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const GENERIC_ERROR = 'Email ou senha incorretos'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 })
    }

    const { email, password } = parsed.data

    const usuario = await prisma.usuario.findUnique({
      where: { email },
      select: { id: true, senhaHash: true, empresaId: true, role: true },
    })

    if (!usuario) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 })
    }

    const senhaValida = await bcrypt.compare(password, usuario.senhaHash)
    if (!senhaValida) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 })
    }

    const token = await signToken({
      userId: usuario.id,
      empresaId: usuario.empresaId,
      role: usuario.role,
    })

    const response = NextResponse.json({ ok: true })
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8h
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
