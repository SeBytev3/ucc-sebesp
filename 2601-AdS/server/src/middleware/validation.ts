import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

/**
 * Generic validation middleware for Zod schemas
 */
export function validate(schema: z.ZodObject<any, any>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Update request with coerced/transformed data
      req.body = parsed.body;
      req.query = parsed.query;
      req.params = parsed.params;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details,
          },
        });
        return;
      }

      next(error);
    }
  };
}
