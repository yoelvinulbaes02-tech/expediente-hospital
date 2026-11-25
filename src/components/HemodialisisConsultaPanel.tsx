'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Activity,
  Archive,
  ChevronDown,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  X,
} from 'lucide-react'
import {
  etiquetaRolClinico,
  normalizarTextoClinico,
  type OutpatientHemodialysisItem,
} from '@/lib/consultas-auth'
import {
  actualizarHemodialisisConsulta,
  archivarReactivarHemodialisisConsulta,
  crearHemodialisisConsulta,
} from '@/app/dashboard/consultas/actions'

type PacienteResumen = {
  id: string
  firstName: string
  lastName: string
  expedienteNumber: string
  age: number | null
  sex: string
  phone: string | null
}

function fmtFechaHora(iso?: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function CamposFormularioHd({
  item,
  prefill,
}: {
  item?: OutpatientHemodialysisItem
  prefill?: {
    patientId: string
    firstName: string
    lastName: string
    expedienteNumber: string
    age: string
    sex: string
    phone: string
  }
}) {
  const inp =
    'w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
  const lbl = 'block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5'

  return (
    <div className="space-y-4">
      {item && <input type="hidden" name="id" value={item.id} />}
      {!item && prefill?.patientId && <input type="hidden" name="patientId" value={prefill.patientId} />}

      {/* 1. DATOS GENERALES Y DIAGNÓSTICO PRINCIPAL */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 bg-slate-50/60 dark:bg-slate-900/40 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-cyan-800 dark:text-cyan-300">
          Datos Generales y Diagnóstico Principal
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          <div>
            <label className={lbl}>Nombres *</label>
            <input name="firstName" required defaultValue={item?.firstName ?? prefill?.firstName ?? ''} className={inp} />
          </div>
          <div>
            <label className={lbl}>Apellidos *</label>
            <input name="lastName" required defaultValue={item?.lastName ?? prefill?.lastName ?? ''} className={inp} />
          </div>
          <div>
            <label className={lbl}>No. Expediente</label>
            <input name="expedienteNumber" defaultValue={item?.expedienteNumber ?? prefill?.expedienteNumber ?? ''} className={`${inp} tabular-nums`} />
          </div>
          <div>
            <label className={lbl}>Edad</label>
            <input name="age" type="number" defaultValue={item?.age ?? prefill?.age ?? ''} className={`${inp} tabular-nums`} />
          </div>
          <div>
            <label className={lbl}>Sexo</label>
            <select name="sex" defaultValue={item?.sex ?? prefill?.sex ?? 'Femenino'} className={inp}>
              <option value="Femenino">Femenino</option>
              <option value="Masculino">Masculino</option>
            </select>
          </div>
          <div>
            <label className={lbl}>Teléfono</label>
            <input name="phone" defaultValue={item?.phone ?? prefill?.phone ?? ''} className={`${inp} tabular-nums`} />
          </div>
          <div>
            <label className={lbl}>Cédula</label>
            <input name="cedula" defaultValue={item?.cedula ?? ''} className={`${inp} tabular-nums`} />
          </div>
          <div>
            <label className={lbl}>Tipificación</label>
            <input name="bloodType" defaultValue={item?.bloodType ?? ''} placeholder="Ej. O+, Pendiente" className={inp} />
          </div>
        </div>
        <div>
          <label className={lbl}>Diagnóstico y Tiempo en Hemodiálisis</label>
          <textarea
            name="diagnosisAndTime"
            rows={2}
            defaultValue={item?.diagnosisAndTime ?? ''}
            placeholder="Ej. Enfermedad Renal Crónica en Hemodiálisis (15 años), Glomeruloesclerosis focal y segmentaria, Hipertensión Arterial (1 año y 6 meses)"
            className={inp}
          />
        </div>
      </div>

      {/* 2. ANTECEDENTES */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 bg-slate-50/60 dark:bg-slate-900/40 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
          Antecedentes
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          <div>
            <label className={lbl}>Medicamentos</label>
            <input name="medications" defaultValue={item?.medications ?? ''} placeholder="Ej. Calcitriol, Losartán..." className={inp} />
          </div>
          <div>
            <label className={lbl}>Alergias</label>
            <input name="allergies" defaultValue={item?.allergies ?? ''} placeholder="Ej. Levofloxacina / Negado" className={inp} />
          </div>
          <div>
            <label className={lbl}>Reacción</label>
            <input name="allergyReaction" defaultValue={item?.allergyReaction ?? ''} placeholder="Ej. Negado / Rash..." className={inp} />
          </div>
          <div>
            <label className={lbl}>Transfusiones</label>
            <input name="transfusions" defaultValue={item?.transfusions ?? ''} placeholder="Ej. Politransfundida (última hace 1 mes y medio)" className={inp} />
          </div>
          <div>
            <label className={lbl}>Referido de otro centro</label>
            <input name="referredFromCenter" defaultValue={item?.referredFromCenter ?? ''} placeholder="Nombre del centro o N/A" className={inp} />
          </div>
          <div>
            <label className={lbl}>Ingresado por primera vez en este centro</label>
            <input name="firstTimeInCenter" defaultValue={item?.firstTimeInCenter ?? ''} placeholder="Sí / No / N/A" className={inp} />
          </div>
          <div>
            <label className={lbl}>Recibió otra modalidad de diálisis</label>
            <input name="otherDialysisModality" defaultValue={item?.otherDialysisModality ?? ''} placeholder="Ej. Diálisis peritoneal / N/A" className={inp} />
          </div>
          <div>
            <label className={lbl}>Patológicos</label>
            <input name="pathologicalHistory" defaultValue={item?.pathologicalHistory ?? ''} placeholder="HTA, DM2..." className={inp} />
          </div>
          <div>
            <label className={lbl}>Quirúrgicos</label>
            <input name="surgicalHistory" defaultValue={item?.surgicalHistory ?? ''} placeholder="Negados o detalle" className={inp} />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className={lbl}>Familiares</label>
            <input name="familyHistory" defaultValue={item?.familyHistory ?? ''} placeholder="Antecedentes heredofamiliares" className={inp} />
          </div>
        </div>
      </div>

      {/* 3. HÁBITOS TÓXICOS */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 bg-slate-50/60 dark:bg-slate-900/40 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
          Hábitos Tóxicos
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          <div>
            <label className={lbl}>Café</label>
            <input name="habitCoffee" defaultValue={item?.habitCoffee ?? ''} placeholder="Ej. 1 taza diaria" className={inp} />
          </div>
          <div>
            <label className={lbl}>Tabaco</label>
            <input name="habitTobacco" defaultValue={item?.habitTobacco ?? ''} placeholder="Negado / Frecuencia" className={inp} />
          </div>
          <div>
            <label className={lbl}>Alcohol</label>
            <input name="habitAlcohol" defaultValue={item?.habitAlcohol ?? ''} placeholder="Negado / Ocasional" className={inp} />
          </div>
          <div>
            <label className={lbl}>Drogas</label>
            <input name="habitDrugs" defaultValue={item?.habitDrugs ?? ''} placeholder="Negado" className={inp} />
          </div>
          <div>
            <label className={lbl}>Otros</label>
            <input name="habitOther" defaultValue={item?.habitOther ?? ''} placeholder="Otros hábitos" className={inp} />
          </div>
        </div>
      </div>

      {/* 4. LABORATORIOS Y PRUEBAS VIRALES */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 bg-slate-50/60 dark:bg-slate-900/40 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
          Laboratorios y Pruebas Virales
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div>
            <label className={lbl}>VIH</label>
            <input name="viralHiv" defaultValue={item?.viralHiv ?? ''} placeholder="Negativo / Reactivo" className={inp} />
          </div>
          <div>
            <label className={lbl}>HBsAg</label>
            <input name="viralHbsag" defaultValue={item?.viralHbsag ?? ''} placeholder="Negativo / Positivo" className={inp} />
          </div>
          <div>
            <label className={lbl}>HVC</label>
            <input name="viralHvc" defaultValue={item?.viralHvc ?? ''} placeholder="Negativo / Positivo" className={inp} />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          <div>
            <label className={lbl}>HGB</label>
            <input name="labHgb" defaultValue={item?.labHgb ?? ''} placeholder="10.3" className={`${inp} tabular-nums`} />
          </div>
          <div>
            <label className={lbl}>HCT</label>
            <input name="labHct" defaultValue={item?.labHct ?? ''} placeholder="31.3" className={`${inp} tabular-nums`} />
          </div>
          <div>
            <label className={lbl}>Urea</label>
            <input name="labUrea" defaultValue={item?.labUrea ?? ''} placeholder="169" className={`${inp} tabular-nums`} />
          </div>
          <div>
            <label className={lbl}>Cr</label>
            <input name="labCr" defaultValue={item?.labCr ?? ''} placeholder="9.57" className={`${inp} tabular-nums`} />
          </div>
          <div>
            <label className={lbl}>K</label>
            <input name="labK" defaultValue={item?.labK ?? ''} placeholder="5.3" className={`${inp} tabular-nums`} />
          </div>
          <div>
            <label className={lbl}>Tipificación (Lab)</label>
            <input name="labBloodType" defaultValue={item?.labBloodType ?? ''} placeholder="Pendiente / O+" className={inp} />
          </div>
          <div>
            <label className={lbl}>Otros labs</label>
            <input name="labOther" defaultValue={item?.labOther ?? ''} placeholder="Ca, P, PTH..." className={inp} />
          </div>
        </div>
      </div>

      {/* 5. ESTUDIOS IMÁGENES Y 6. ACCESOS VASCULARES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 bg-slate-50/60 dark:bg-slate-900/40 space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Estudios Imágenes
          </p>
          <div>
            <label className={lbl}>Sonografía</label>
            <input name="imagingSonography" defaultValue={item?.imagingSonography ?? ''} placeholder="N/A o hallazgos" className={inp} />
          </div>
          <div>
            <label className={lbl}>Tomografía</label>
            <input name="imagingCt" defaultValue={item?.imagingCt ?? ''} placeholder="N/A o hallazgos" className={inp} />
          </div>
          <div>
            <label className={lbl}>Otros estudios</label>
            <input name="imagingOther" defaultValue={item?.imagingOther ?? ''} placeholder="Rx tórax, eco..." className={inp} />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 bg-slate-50/60 dark:bg-slate-900/40 space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Accesos Vasculares
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className={lbl}>Fístula Arteriovenosa</label>
              <input name="accessAvFistula" defaultValue={item?.accessAvFistula ?? ''} placeholder="Ej. Izquierda / Funcional / N/A" className={inp} />
            </div>
            <div>
              <label className={lbl}>Injerto</label>
              <input name="accessGraft" defaultValue={item?.accessGraft ?? ''} placeholder="N/A o localización" className={inp} />
            </div>
            <div>
              <label className={lbl}>Catéter T.</label>
              <input name="accessTunneledCatheter" defaultValue={item?.accessTunneledCatheter ?? ''} placeholder="N/A o yugular derecho..." className={inp} />
            </div>
            <div>
              <label className={lbl}>FAVI</label>
              <input name="accessFavi" defaultValue={item?.accessFavi ?? ''} placeholder="Estado de FAVI" className={inp} />
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className={lbl}>Notas Clínicas Adicionales</label>
        <textarea name="clinicalNotes" rows={2} defaultValue={item?.clinicalNotes ?? ''} placeholder="Observaciones de seguimiento en hemodiálisis..." className={inp} />
      </div>
    </div>
  )
}

export function HemodialisisConsultaPanel({
  records,
  pacientes,
  puedeRegistrar,
  suscripcionBloqueada,
}: {
  records: OutpatientHemodialysisItem[]
  pacientes: PacienteResumen[]
  puedeRegistrar: boolean
  suscripcionBloqueada: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [busqueda, setBusqueda] = useState('')
  const [verArchivados, setVerArchivados] = useState(false)
  const [mostrarNuevo, setMostrarNuevo] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [prefill, setPrefill] = useState({
    patientId: '',
    firstName: '',
    lastName: '',
    expedienteNumber: '',
    age: '',
    sex: 'Femenino',
    phone: '',
  })
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const puedeEditar = puedeRegistrar && !suscripcionBloqueada

  const handleSelectPaciente = (pid: string) => {
    const p = pacientes.find((x) => x.id === pid)
    if (!p) {
      setPrefill({
        patientId: '',
        firstName: '',
        lastName: '',
        expedienteNumber: '',
        age: '',
        sex: 'Femenino',
        phone: '',
      })
      return
    }
    setPrefill({
      patientId: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      expedienteNumber: p.expedienteNumber,
      age: p.age !== null ? String(p.age) : '',
      sex: p.sex || 'Femenino',
      phone: p.phone ?? '',
    })
  }

  const filtrados = useMemo(() => {
    const tokens = normalizarTextoClinico(busqueda).split(/\s+/).filter(Boolean)
    return records.filter((r) => {
      if (r.isActive === verArchivados) return false
      if (tokens.length === 0) return true
      const txt = normalizarTextoClinico(
        [
          r.firstName,
          r.lastName,
          r.expedienteNumber,
          r.cedula,
          r.phone,
          r.diagnosisAndTime,
          r.referredFromCenter,
          r.accessAvFistula,
          r.accessTunneledCatheter,
        ]
          .filter(Boolean)
          .join(' ')
      )
      return tokens.every((t) => txt.includes(t))
    })
  }, [records, verArchivados, busqueda])

  const activosCount = records.filter((r) => r.isActive).length
  const archivadosCount = records.filter((r) => !r.isActive).length

  const handleCrear = (formData: FormData) => {
    setMensaje(null)
    startTransition(async () => {
      const res = await crearHemodialisisConsulta(formData)
      if (!res.ok) {
        setMensaje({ tipo: 'error', texto: res.error ?? 'Error al guardar expediente.' })
        return
      }
      setMostrarNuevo(false)
      handleSelectPaciente('')
      setMensaje({ tipo: 'ok', texto: 'Expediente de Hemodiálisis registrado correctamente.' })
      router.refresh()
    })
  }

  const handleActualizar = (formData: FormData) => {
    setMensaje(null)
    startTransition(async () => {
      const res = await actualizarHemodialisisConsulta(formData)
      if (!res.ok) {
        setMensaje({ tipo: 'error', texto: res.error ?? 'Error al actualizar expediente.' })
        return
      }
      setEditId(null)
      setMensaje({ tipo: 'ok', texto: 'Expediente de Hemodiálisis actualizado.' })
      router.refresh()
    })
  }

  const handleArchivarReactivar = (id: string, isActive: boolean) => {
    setMensaje(null)
    const fd = new FormData()
    fd.set('id', id)
    fd.set('isActive', String(isActive))
    startTransition(async () => {
      const res = await archivarReactivarHemodialisisConsulta(fd)
      if (!res.ok) {
        setMensaje({ tipo: 'error', texto: res.error ?? 'Error al cambiar el estado.' })
        return
      }
      setMensaje({
        tipo: 'ok',
        texto: isActive ? 'Expediente reactivado.' : 'Expediente archivado.',
      })
      router.refresh()
    })
  }

  return (
    <div className="space-y-5">
      {/* CABECERA HEMODIÁLISIS CONSULTA EXTERNA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-700" />
            <span>Hemodiálisis Ambulatoria (Enfermedad Renal Crónica en Hemodiálisis)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Fichas completas con datos generales, antecedentes, hábitos tóxicos, laboratorios/virales, imágenes y accesos vasculares.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar paciente, expediente, acceso..."
              className="w-full pl-8 pr-8 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-600"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setVerArchivados((v) => !v)}
            className={`px-3 py-2 rounded-lg border text-xs font-bold cursor-pointer whitespace-nowrap ${
              verArchivados
                ? 'bg-slate-800 text-white border-slate-900'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
            }`}
          >
            {verArchivados ? `Viendo Archivados (${archivadosCount})` : `Ver Archivados (${archivadosCount})`}
          </button>

          {puedeEditar && (
            <button
              type="button"
              onClick={() => setMostrarNuevo((v) => !v)}
              className="inline-flex items-center gap-1.5 bg-cyan-700 hover:bg-cyan-800 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{mostrarNuevo ? 'Cerrar' : 'Nuevo Expediente HD'}</span>
            </button>
          )}
        </div>
      </div>

      {mensaje && (
        <div
          className={`px-4 py-2.5 rounded-lg border text-xs flex justify-between items-center gap-2 ${
            mensaje.tipo === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-200'
              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800 dark:text-red-200'
          }`}
        >
          <span className="font-semibold">{mensaje.texto}</span>
          <button type="button" onClick={() => setMensaje(null)} className="cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* FORMULARIO CREAR EXPEDIENTE */}
      {mostrarNuevo && puedeEditar && (
        <form
          action={handleCrear}
          className="bg-white dark:bg-slate-800 border border-cyan-200 dark:border-cyan-800 rounded-xl p-4 sm:p-5 space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Nuevo Expediente de Enfermedad Renal Crónica en Hemodiálisis
            </h4>
            <div className="sm:w-72">
              <select
                value={prefill.patientId}
                onChange={(e) => handleSelectPaciente(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="">Copiar datos desde paciente existente...</option>
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} · Exp: {p.expedienteNumber}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <CamposFormularioHd key={prefill.patientId || 'manual'} prefill={prefill} />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setMostrarNuevo(false)}
              className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-1.5 bg-cyan-700 hover:bg-cyan-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              {isPending ? 'Guardando...' : 'Guardar Expediente HD'}
            </button>
          </div>
        </form>
      )}

      {/* LISTADO DE EXPEDIENTES RETRAÍBLES */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <span className="font-bold uppercase tracking-wider">
            {verArchivados ? 'Expedientes Archivados' : 'Expedientes Activos en Hemodiálisis'} ({filtrados.length} de {verArchivados ? archivadosCount : activosCount})
          </span>
        </div>

        {filtrados.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center text-xs text-slate-400">
            No hay expedientes de Hemodiálisis registrados en esta vista.
          </div>
        ) : (
          filtrados.map((item) => {
            const editando = editId === item.id
            return (
              <details
                key={item.id}
                className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
              >
                <summary className="list-none cursor-pointer px-4 py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-2 hover:bg-slate-50/70 dark:hover:bg-slate-700/30 [&::-webkit-details-marker]:hidden">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <ChevronDown className="w-4 h-4 text-slate-500 transition-transform group-open:rotate-0 -rotate-90 mt-1 shrink-0" />
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {item.firstName} {item.lastName}
                        </span>
                        {item.expedienteNumber && (
                          <span className="text-[11px] font-semibold text-slate-500 tabular-nums">
                            Exp: {item.expedienteNumber}
                          </span>
                        )}
                        {item.age !== null && (
                          <span className="text-[11px] text-slate-500 tabular-nums">
                            · {item.age} años {item.sex ? `· ${item.sex}` : ''}
                          </span>
                        )}
                        {item.bloodType && (
                          <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400">
                            · Grupo: {item.bloodType}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium line-clamp-1">
                        {item.diagnosisAndTime || 'Enfermedad Renal Crónica en Hemodiálisis'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs shrink-0 pl-6 lg:pl-0 tabular-nums">
                    {item.labHgb && (
                      <span className="text-amber-800 dark:text-amber-300 font-semibold">
                        HGB {item.labHgb}
                      </span>
                    )}
                    {item.labCr && (
                      <span className="text-amber-800 dark:text-amber-300 font-semibold">
                        Cr {item.labCr}
                      </span>
                    )}
                    {item.labK && (
                      <span className="text-amber-800 dark:text-amber-300 font-semibold">
                        K {item.labK}
                      </span>
                    )}
                    {(item.accessAvFistula || item.accessTunneledCatheter) && (
                      <span className="text-cyan-800 dark:text-cyan-300 font-semibold">
                        Acceso: {item.accessAvFistula || item.accessTunneledCatheter}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400">
                      {item.updatedByName ? `Modif.: ${item.updatedByName}` : `Reg.: ${item.createdByName}`}
                      {item.updatedAt ? ` · ${fmtFechaHora(item.updatedAt)}` : ` · ${fmtFechaHora(item.createdAt)}`}
                    </span>
                  </div>
                </summary>

                <div className="border-t border-slate-200 dark:border-slate-700 p-4 space-y-4 bg-slate-50/40 dark:bg-slate-900/30">
                  {editando ? (
                    <form action={handleActualizar} className="space-y-4">
                      <CamposFormularioHd item={item} />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditId(null)}
                          className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold text-slate-600 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={isPending}
                          className="px-4 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                        >
                          {isPending ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-[11px] text-slate-500 tabular-nums">
                          Registrado por {item.createdByName} ({etiquetaRolClinico(item.createdByRole)}) · {fmtFechaHora(item.createdAt)}
                          {item.updatedByName && item.updatedAt
                            ? ` · Modificado por ${item.updatedByName}${
                                item.updatedByRole ? ` (${etiquetaRolClinico(item.updatedByRole)})` : ''
                              } · ${fmtFechaHora(item.updatedAt)}`
                            : ''}
                        </p>

                        {puedeEditar && (
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setEditId(item.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer"
                            >
                              <Pencil className="w-3 h-3" />
                              <span>Modificar Ficha</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleArchivarReactivar(item.id, !item.isActive)}
                              disabled={isPending}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer"
                            >
                              {item.isActive ? (
                                <>
                                  <Archive className="w-3 h-3" />
                                  <span>Archivar</span>
                                </>
                              ) : (
                                <>
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Reactivar</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* DIAGNÓSTICO */}
                      <div className="rounded-lg border border-cyan-200 dark:border-cyan-800 bg-white dark:bg-slate-800 p-3 text-xs">
                        <span className="block text-[10px] font-bold uppercase text-cyan-700 dark:text-cyan-400 mb-0.5">
                          Diagnóstico y Tiempo en Hemodiálisis
                        </span>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {item.diagnosisAndTime || 'Sin especificar'}
                        </p>
                      </div>

                      {/* DATOS GENERALES */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                        <div><span className="text-[10px] font-bold text-slate-400 block">Teléfono</span><span className="tabular-nums">{item.phone || '—'}</span></div>
                        <div><span className="text-[10px] font-bold text-slate-400 block">Cédula</span><span className="tabular-nums">{item.cedula || '—'}</span></div>
                        <div><span className="text-[10px] font-bold text-slate-400 block">No. Expediente</span><span className="tabular-nums">{item.expedienteNumber || '—'}</span></div>
                        <div><span className="text-[10px] font-bold text-slate-400 block">Tipificación</span><span className="font-bold text-rose-700 dark:text-rose-400">{item.bloodType || item.labBloodType || 'Pendiente'}</span></div>
                      </div>

                      {/* ANTECEDENTES */}
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-2 text-xs">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-1">
                          Antecedentes
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          <p><strong>Medicamentos:</strong> {item.medications || 'N/A'}</p>
                          <p><strong>Alergias:</strong> {item.allergies || 'Negado'}</p>
                          <p><strong>Reacción:</strong> {item.allergyReaction || 'Negado'}</p>
                          <p><strong>Transfusiones:</strong> {item.transfusions || 'Negado'}</p>
                          <p><strong>Referido de otro centro:</strong> {item.referredFromCenter || 'N/A'}</p>
                          <p><strong>1ra vez en este centro:</strong> {item.firstTimeInCenter || 'N/A'}</p>
                          <p><strong>Otra modalidad de diálisis:</strong> {item.otherDialysisModality || 'N/A'}</p>
                          <p><strong>Patológicos:</strong> {item.pathologicalHistory || '—'}</p>
                          <p><strong>Quirúrgicos:</strong> {item.surgicalHistory || '—'}</p>
                          <p className="sm:col-span-2 lg:col-span-3"><strong>Familiares:</strong> {item.familyHistory || '—'}</p>
                        </div>
                      </div>

                      {/* HÁBITOS TÓXICOS */}
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-2 text-xs">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-1">
                          Hábitos Tóxicos
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          <p><strong>Café:</strong> {item.habitCoffee || 'Negado'}</p>
                          <p><strong>Tabaco:</strong> {item.habitTobacco || 'Negado'}</p>
                          <p><strong>Alcohol:</strong> {item.habitAlcohol || 'Negado'}</p>
                          <p><strong>Drogas:</strong> {item.habitDrugs || 'Negado'}</p>
                          <p><strong>Otros:</strong> {item.habitOther || '—'}</p>
                        </div>
                      </div>

                      {/* LABORATORIOS Y PRUEBAS VIRALES */}
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-2 text-xs">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-1">
                          Laboratorios y Pruebas Virales
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pb-2 border-b border-slate-100 dark:border-slate-700">
                          <p><strong>VIH:</strong> {item.viralHiv || 'Pendiente'}</p>
                          <p><strong>HBsAg:</strong> {item.viralHbsag || 'Pendiente'}</p>
                          <p><strong>HVC:</strong> {item.viralHvc || 'Pendiente'}</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 tabular-nums">
                          <div className="bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded">
                            <span className="text-[10px] font-bold text-slate-500 block">HGB</span>
                            <strong>{item.labHgb || '—'}</strong>
                          </div>
                          <div className="bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded">
                            <span className="text-[10px] font-bold text-slate-500 block">HCT</span>
                            <strong>{item.labHct || '—'}</strong>
                          </div>
                          <div className="bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded">
                            <span className="text-[10px] font-bold text-slate-500 block">Urea</span>
                            <strong>{item.labUrea || '—'}</strong>
                          </div>
                          <div className="bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded">
                            <span className="text-[10px] font-bold text-slate-500 block">Cr</span>
                            <strong>{item.labCr || '—'}</strong>
                          </div>
                          <div className="bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded">
                            <span className="text-[10px] font-bold text-slate-500 block">K</span>
                            <strong>{item.labK || '—'}</strong>
                          </div>
                          <div className="bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded">
                            <span className="text-[10px] font-bold text-slate-500 block">Tipificación</span>
                            <strong>{item.labBloodType || item.bloodType || 'Pendiente'}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 block">Otros</span>
                            <span>{item.labOther || '—'}</span>
                          </div>
                        </div>
                      </div>

                      {/* ESTUDIOS IMÁGENES & ACCESOS VASCULARES */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-1.5">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-1">
                            Estudios Imágenes
                          </p>
                          <p><strong>Sonografía:</strong> {item.imagingSonography || 'N/A'}</p>
                          <p><strong>Tomografía:</strong> {item.imagingCt || 'N/A'}</p>
                          <p><strong>Otros:</strong> {item.imagingOther || '—'}</p>
                        </div>

                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-1.5">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-1">
                            Accesos Vasculares
                          </p>
                          <p><strong>Fístula Arteriovenosa:</strong> {item.accessAvFistula || 'N/A'}</p>
                          <p><strong>Injerto:</strong> {item.accessGraft || 'N/A'}</p>
                          <p><strong>Catéter T.:</strong> {item.accessTunneledCatheter || 'N/A'}</p>
                          <p><strong>FAVI:</strong> {item.accessFavi || 'N/A'}</p>
                        </div>
                      </div>

                      {item.clinicalNotes && (
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-xs whitespace-pre-wrap">
                          <strong className="text-slate-600 dark:text-slate-300">Notas clínicas: </strong>
                          {item.clinicalNotes}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </details>
            )
          })
        )}
      </div>
    </div>
  )
}
