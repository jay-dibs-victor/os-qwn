/**
 * Error handling utilities for API responses
 */

import { getApiBaseUrl } from '../config/env';

export function getApiErrorMessage(error: any, defaultMessage: string): string {
  console.log('[Error Handler] Error object:', error);

  // Check if response exists
  if (!error.response) {
    // Network error or timeout
    if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
      return `Network error. Please check your connection and try again. (API: ${getApiBaseUrl()})`;
    }
    if (error.message?.includes('timeout')) {
      return 'Request timeout. Please try again.';
    }
    return error.message || defaultMessage;
  }

  // Check for JSON error response
  if (error.response?.data) {
    const data = error.response.data;
    
    // Try error field first
    if (data.error) {
      const errorMsg = data.error;
      if (typeof errorMsg === 'string') {
        return errorMsg.replace(/<[^>]*>/g, '').trim();
      }
      return String(errorMsg);
    }

    // Try message field
    if (data.message) {
      return String(data.message).replace(/<[^>]*>/g, '').trim();
    }

    // Try msg field
    if (data.msg) {
      return String(data.msg).replace(/<[^>]*>/g, '').trim();
    }

    // Try status_text field
    if (data.status_text) {
      return String(data.status_text).replace(/<[^>]*>/g, '').trim();
    }
  }

  // Check for status text
  if (error.response?.statusText) {
    return error.response.statusText;
  }

  // Check for status code
  if (error.response?.status) {
    const status = error.response.status;
    if (status === 400) return 'Bad request. Please check your input.';
    if (status === 401) return 'Unauthorized. Please log in again.';
    if (status === 403) return 'Access denied.';
    if (status === 404) return 'Resource not found.';
    if (status === 422) return 'Validation error. Please check your input.';
    if (status === 500) return 'Server error. Please try again later.';
    if (status >= 500) return 'Server error. Please try again later.';
  }

  return defaultMessage;
}

export function isNetworkError(error: any): boolean {
  return error.message === 'Network Error' || error.code === 'ECONNABORTED' || !error.response;
}

export function isValidationError(error: any): boolean {
  return error.response?.status === 422 || error.response?.status === 400;
}

export function isConflictError(error: any): boolean {
  return error.response?.status === 409;
}

export function isUnauthorizedError(error: any): boolean {
  return error.response?.status === 401 || error.response?.status === 403;
}

export function isNotFoundError(error: any): boolean {
  return error.response?.status === 404;
}
