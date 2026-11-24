import { NextRequest, NextResponse } from 'next/server'
import { persistirConsultaClinica, type PayloadConsultaClinica } from '@/lib/consultas-persist'

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PayloadConsultaClinica
    const res = await persistirConsultaClinica({
      ...body,
      accion: 'guardar',
    })

    if (!res.ok) {
      return NextResponse.json(res, { status: 400 })
    }

    return NextResponse.json(res)
  } catch (err: unknown) {
    return NextResponse.json(
      { ok: false, error: (err as Error)?.message || 'Error en guardado automático.' },
      { status: 500 }
    )
  }
}
