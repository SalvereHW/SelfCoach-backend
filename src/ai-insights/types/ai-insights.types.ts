export interface GenerationLimitCheck {
  canGenerate: boolean;
  nextAvailableTime?: Date;
  remainingGenerations: number;
}
