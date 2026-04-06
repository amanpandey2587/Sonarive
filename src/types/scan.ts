export interface ScanFinding {
  condition: string;
  anatomicalLocation: string;
  severity: string;
  confidence: number;
  highlightedArea: string;
}

export interface AnalyzeMedicalScanOutput {
  findings: ScanFinding[];
  summary: string;
}
