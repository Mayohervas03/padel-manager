export function extractErrorMessage(error: any): string {
  if (!error) {
    return 'Something went wrong. Please try again or contact support if the problem persists.';
  }

  let body = error.error;

  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return body;
    }
  }

  if (body?.data && typeof body.data === 'object') {
    const messages = Object.values(body.data)
      .filter((v): v is string => typeof v === 'string');
    if (messages.length > 0) {
      return messages.join('. ');
    }
  }

  if (body?.message) {
    return body.message;
  }

  if (error.message) {
    return error.message;
  }

  return 'Something went wrong. Please try again or contact support if the problem persists.';
}
