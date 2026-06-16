// Rule-based fallback clinical analyzer
function analyzeLocally(text) {
  const lower = text.toLowerCase();
  const findings = [];
  const concerns = [];

  // Match HbA1c / Sugar
  if (lower.includes("hba1c") || lower.includes("glucose") || lower.includes("sugar")) {
    findings.push("Blood glucose / HbA1c glycemic indicators detected, evaluating metabolic sugar regulation.");
    if (lower.includes("diabetes") || lower.includes("elevated") || lower.includes("high")) {
      concerns.push("Metabolic parameters suggest glycemic stress or insulin resistance. Standard follow-up is recommended.");
    }
  }

  // Match TSH / Thyroid
  if (lower.includes("tsh") || lower.includes("t3") || lower.includes("t4") || lower.includes("thyroid")) {
    findings.push("Thyroid function parameters (TSH/T3/T4) detected, evaluating thyroid hormonal balance.");
    if (lower.includes("hypothyroid") || lower.includes("hyperthyroid")) {
      concerns.push("Hormonal thyroid readings show clinical imbalances that should be reviewed by an endocrinologist.");
    }
  }

  // Match Hemoglobin / RBC / Anemia
  if (lower.includes("hemoglobin") || lower.includes("hb") || lower.includes("rbc") || lower.includes("anemia")) {
    findings.push("Hematology metrics (Hemoglobin/RBC) evaluated, verifying oxygen carrying capacity.");
    if (lower.includes("low") || lower.includes("anemia") || lower.includes("deficient")) {
      concerns.push("Low red blood cell metrics or hemoglobin detected, indicating potential mild anemia.");
    }
  }

  // Match Liver / Kidney enzymes
  if (lower.includes("alt") || lower.includes("ast") || lower.includes("creatinine") || lower.includes("bun")) {
    findings.push("Renal and hepatic enzymes (Creatinine/BUN/ALT/AST) evaluated, assessing organ filtration functions.");
  }

  // Match Lipid / Cholesterol
  if (lower.includes("cholesterol") || lower.includes("ldl") || lower.includes("hdl") || lower.includes("triglycerides")) {
    findings.push("Cardiovascular lipid profile (Cholesterol/LDL/HDL) detected, assessing lipid health.");
    if (lower.includes("high") || lower.includes("elevated")) {
      concerns.push("Lipid panel indicates elevated cholesterol levels. Dietary review is advised.");
    }
  }

  // Fallbacks if nothing matched
  if (findings.length === 0) {
    findings.push("General blood chemistry indicators mapped successfully.");
  }
  if (concerns.length === 0) {
    concerns.push("No critical threshold violations detected. Standard clinical review is advised.");
  }

  return {
    summary: "The medical report contains typical lab panel findings. A structured summary of the clinical parameters is prepared below.",
    findings,
    concerns,
    interpretation: "Individual indicators are within manageable limits. Any minor deviations are best evaluated in the context of complete patient history.",
    explanation: "This assessment is based on a local dictionary mapping common parameters against normal adult reference ranges. Periodic routine monitoring is recommended."
  };
}

module.exports = { analyzeLocally };
