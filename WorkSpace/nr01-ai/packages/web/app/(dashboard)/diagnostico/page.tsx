import { DiagnosticoStepper } from '@/components/diagnostico/DiagnosticoStepper'
import { EmpresaForm } from '@/components/diagnostico/EmpresaForm'

export default function DiagnosticoPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Diagnóstico NR-01</h1>
      <p className="text-sm text-gray-500 mb-8">
        Preencha os dados da empresa para iniciar o diagnóstico de riscos psicossociais.
      </p>

      <DiagnosticoStepper currentStep={0} empresaSalva={false} />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Dados da Empresa</h2>
        <EmpresaForm />
      </div>
    </div>
  )
}
