'use client'

interface Step {
  label: string
  index: number
}

const STEPS: Step[] = [
  { label: 'Empresa', index: 0 },
  { label: 'Questionário', index: 1 },
  { label: 'Evidências', index: 2 },
]

interface Props {
  currentStep: number
  empresaSalva: boolean
}

export function DiagnosticoStepper({ currentStep, empresaSalva }: Props) {
  return (
    <nav className="flex items-center gap-0 mb-8">
      {STEPS.map((step, i) => {
        const isActive = step.index === currentStep
        const isCompleted = step.index < currentStep
        const isDisabled = step.index > 0 && !empresaSalva

        return (
          <div key={step.index} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors
                  ${isCompleted ? 'bg-blue-600 text-white' : ''}
                  ${isActive ? 'bg-blue-600 text-white ring-4 ring-blue-100' : ''}
                  ${!isActive && !isCompleted ? 'bg-gray-100 text-gray-400' : ''}
                  ${isDisabled ? 'opacity-50' : ''}
                `}
              >
                {isCompleted ? '✓' : step.index + 1}
              </div>
              <span
                className={`text-xs font-medium ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-gray-700' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mb-5 transition-colors ${
                  isCompleted ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
