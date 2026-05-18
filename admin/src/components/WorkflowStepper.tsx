export type AutorisationStatut =
  | "EN_COURS_EXAMEN"
  | "EN_COURS_TRAITEMENT"
  | "EN_ATTENTE_PAIEMENT"
  | "PAIEMENT_RECU"
  | "AUTORISE";

const STEPS = [
  { key: "EN_COURS_EXAMEN",     label: "Demande déposée" },
  { key: "EN_COURS_TRAITEMENT", label: "En cours de traitement" },
  { key: "EN_ATTENTE_PAIEMENT", label: "En attente de paiement" },
  { key: "AUTORISE",            label: "Autorisé" },
];

const STATUT_TO_STEP: Record<string, number> = {
  EN_COURS_EXAMEN:     1,
  EN_COURS_TRAITEMENT: 2,
  EN_ATTENTE_PAIEMENT: 3,
  PAIEMENT_RECU:       3, // legacy — treat same as EN_ATTENTE_PAIEMENT
  AUTORISE:            4,
};

interface WorkflowStepperProps {
  statut: AutorisationStatut;
}

const WorkflowStepper = ({ statut }: WorkflowStepperProps) => {
  const activeStep = STATUT_TO_STEP[statut] ?? 1;

  return (
    <div className="paper-form mb-2 px-4 md:px-6 py-3">
      <div className="flex items-center justify-between" dir="ltr">
        {STEPS.map((step, i) => (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                  activeStep > i + 1
                    ? "bg-green-500 text-white"
                    : activeStep === i + 1
                    ? "text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
                style={activeStep === i + 1 ? { background: "hsl(215 60% 22%)" } : undefined}
              >
                {activeStep > i + 1 ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className="font-medium mt-1 hidden sm:block text-center"
                style={{ fontSize: "12px", color: "hsl(var(--foreground))", maxWidth: "120px" }}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  activeStep > i + 1 ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkflowStepper;
