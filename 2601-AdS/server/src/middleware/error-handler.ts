import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

/**
 * Global Error Handling Middleware
 * Catch-all for all errors thrown in the application.
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const t = (req as any).t || ((key: string) => key);

  console.error('🔴 Error Details:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    code: err.code,
  });

  // Default error
  let statusCode = err.status || 500;
  let response = {
    error: {
      code: 'INTERNAL_ERROR',
      message: t('common.error'),
      ...(process.env.NODE_ENV === 'development' && { details: err.message }),
    },
  };

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    statusCode = 400;
    response = {
      error: {
        code: 'VALIDATION_ERROR',
        message: t('validation.invalid_input'),
        details: err.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message
        })) as any,
      },
    };
  }

  // Handle Prisma Specific Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (err.code === 'P2002') {
      statusCode = 409;
      response = {
        error: {
          code: 'CONFLICT',
          message: t('common.conflict'),
          details: `Field: ${err.meta?.target}` as any,
        },
      };
    }
    // Record not found
    if (err.code === 'P2025') {
      statusCode = 404;
      response = {
        error: {
          code: 'NOT_FOUND',
          message: t('common.not_found'),
        },
      };
    }
  }

  // Handle known application errors
  if (err.message === 'Email already registered') {
    statusCode = 400;
    response.error = {
      code: 'BAD_REQUEST',
      message: t('auth.email_already_registered'),
    };
  }

  if (err.message === 'Invalid email or password') {
    statusCode = 401;
    response.error = {
      code: 'UNAUTHORIZED',
      message: t('auth.invalid_credentials'),
    };
  }

  const errorMap: Record<string, string> = {
    'Review already exists for this request': 'review.already_exists',
    'Cannot send requests to this provider': 'request.cannot_send_to_provider',
    'Provider is already approved': 'provider.already_approved',
    'Can only review completed requests': 'review.only_completed',
    'Can only complete accepted requests': 'request.only_accepted_can_complete',
    'Only the customer can submit a review': 'review.only_customer',
    'Not authorized to respond to this request': 'request.not_authorized_to_respond',
    'Request already has a response': 'request.already_responded',
    'Provider is already deactivated': 'provider.already_deactivated',
  };

  if (errorMap[err.message]) {
    statusCode = 400;
    response.error = {
      code: 'BAD_REQUEST',
      message: t(errorMap[err.message]),
    };
  }

  res.status(statusCode).json(response);
};
