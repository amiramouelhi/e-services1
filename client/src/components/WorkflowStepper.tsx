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
    <div className="paper-form mb-4 px-6 md:px-12 py-6">
      <div className="flex items-start w-full">
        {STEPS.map((step, i) => {
          const isDone = activeStep > i + 1;
          const isActive = activeStep === i + 1;
          const isLast = i === STEPS.length - 1;
          return (
            <div
              key={step.key}
              className={`flex items-start ${isLast ? "" : "flex-1"} min-w-0`}
            >
              <div className="flex flex-col items-center flex-shrink-0" style={{ minWidth: "70px" }}>
                <div
                  className="rounded-full flex items-center justify-center font-bold transition-all duration-300"
                  style={{
                    width: isActive ? "40px" : "34px",
                    height: isActive ? "40px" : "34px",
                    fontSize: "14px",
                    background: isDone
                      ? "hsl(215 60% 22%)"
                      : isActive
                      ? "hsl(215 60% 22%)"
                      : "hsl(215 25% 90%)",
                    color: isDone || isActive ? "white" : "hsl(215 15% 50%)",
                    boxShadow: isActive
                      ? "0 0 0 4px hsl(215 60% 22% / 0.12), 0 2px 6px hsl(215 60% 22% / 0.25)"
                      : "none",
                  }}
                >
                  {isDone ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`mt-2 text-center transition-colors ${isActive ? "font-bold" : "font-medium"}`}
                  style={{
                    fontSize: "12px",
                    color: isActive
                      ? "hsl(215 60% 22%)"
                      : isDone
                      ? "hsl(215 25% 25%)"
                      : "hsl(215 10% 55%)",
                    maxWidth: "120px",
                  }}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div className="flex-1 mx-1 sm:mx-2" style={{ marginTop: isActive ? "20px" : "17px" }}>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: "hsl(215 25% 90%)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: isDone ? "100%" : "0%",
                        background: "hsl(215 60% 22%)",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowStepper;
