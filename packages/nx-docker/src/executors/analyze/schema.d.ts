export interface AnalyzeExecutorSchema {
  ci: boolean;
  highestUserWastedRatio?: number;
  highestUserWastedBytes?: number;
  lowestEfficiencyRatio?: number;
  ignoreError: boolean;
  source: string;
  image: string;
  dockerSocket?: string;
}
