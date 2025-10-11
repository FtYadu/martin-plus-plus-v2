export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleApiError(error: any): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error.response) {
    // API error response
    return new AppError(
      error.response.data?.error?.message || 'API request failed',
      error.response.data?.error?.code || 'API_ERROR',
      error.response.status
    );
  }

  if (error.request) {
    // Network error
    return new AppError(
      'Network error. Please check your connection.',
      'NETWORK_ERROR'
    );
  }

  // Unknown error
  return new AppError(
    error.message || 'An unexpected error occurred',
    'UNKNOWN_ERROR'
  );
}

export function getErrorMessage(error: any): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}