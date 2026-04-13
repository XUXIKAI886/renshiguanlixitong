import { z } from 'zod';

interface MongoDuplicateKeyError {
  code: number;
  keyPattern?: Record<string, number>;
}

export const getZodIssueDetails = (error: z.ZodError) =>
  error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));

export const isMongoDuplicateKeyError = (
  error: unknown
): error is MongoDuplicateKeyError =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  error.code === 11000;

export const getErrorMessage = (
  error: unknown,
  fallback = 'Unknown error'
) => (error instanceof Error ? error.message : fallback);
