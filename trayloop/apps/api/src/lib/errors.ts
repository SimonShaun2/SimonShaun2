export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: string = 'INTERNAL_ERROR',
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`, 'NOT_FOUND');
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message, 'VALIDATION_ERROR');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, message, 'FORBIDDEN');
  }
}

export class FeatureNotIncludedError extends AppError {
  constructor(input: {
    featureKey: string;
    currentPlan: string;
    requiredPlan: string | null;
    upgradeToPlan: string | null;
  }) {
    super(
      403,
      'This feature is not included in your current plan.',
      'FEATURE_NOT_INCLUDED',
      {
        featureKey: input.featureKey,
        currentPlan: input.currentPlan,
        requiredPlan: input.requiredPlan,
        upgradeToPlan: input.upgradeToPlan,
      },
    );
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests') {
    super(429, message, 'RATE_LIMITED');
  }
}

export class NotImplementedError extends AppError {
  constructor(message = 'Not implemented') {
    super(501, message, 'NOT_IMPLEMENTED');
  }
}
