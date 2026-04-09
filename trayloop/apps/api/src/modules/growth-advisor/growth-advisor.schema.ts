import { z } from 'zod';

export const analyzeGrowthAdvisorSchema = z.object({
  notes: z.string().trim().max(1200).optional(),
});

export type AnalyzeGrowthAdvisorInput = z.infer<typeof analyzeGrowthAdvisorSchema>;
