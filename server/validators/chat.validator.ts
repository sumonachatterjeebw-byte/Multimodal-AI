import { z } from 'zod';

export const chatRequestSchema = z.object({
  sessionId: z.string().optional(),
  message: z.string().min(1, 'Message text is required'),
  assetIds: z.array(z.string()).default([]),
  depth: z.enum(['Quick Summary', 'Detailed Synthesis', 'Deep Technical Audit']).default('Detailed Synthesis'),
  persona: z.enum(['Executive Leader', 'Domain Expert / Auditor', 'General Public']).default('Domain Expert / Auditor'),
  tone: z.enum(['Strictly Analytical', 'Action-Oriented', 'Bullet-Point Structured']).default('Strictly Analytical')
});

export const reportRequestSchema = z.object({
  assetIds: z.array(z.string()).min(1, 'At least one asset must be selected'),
  depth: z.enum(['Quick Summary', 'Detailed Synthesis', 'Deep Technical Audit']).default('Detailed Synthesis'),
  persona: z.enum(['Executive Leader', 'Domain Expert / Auditor', 'General Public']).default('Domain Expert / Auditor'),
  tone: z.enum(['Strictly Analytical', 'Action-Oriented', 'Bullet-Point Structured']).default('Strictly Analytical')
});
