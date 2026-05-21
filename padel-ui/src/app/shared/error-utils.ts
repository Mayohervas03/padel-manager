/**
 * Extrae un mensaje legible de un error HTTP del backend.
 * Maneja tanto respuestas string simples como objetos ApiResponse con errores de validacion.
 * Tambien intenta parsear strings JSON (cuando Angular recibe text/plain en error).
 */
export function extractErrorMessage(error: any): string {
  if (!error) {
    return 'An error has occurred. Please try again.';
  }

  let body = error.error;

  // Si el body es un string que parece JSON, intentamos parsearlo
  // (pasa cuando el request usa responseType: 'text' y el backend devuelve JSON)
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      // No es JSON valido, lo devolvemos tal cual
      return body;
    }
  }

  // Formato ApiResponse: { success: false, message: "Errores de validacion", data: { campo: "mensaje" } }
  if (body?.data && typeof body.data === 'object') {
    const messages = Object.values(body.data)
      .filter((v): v is string => typeof v === 'string');
    if (messages.length > 0) {
      return messages.join('. ');
    }
  }

  // ErrorResponse: { message: "..." }
  if (body?.message) {
    return body.message;
  }

  // Fallback directo de Angular
  if (error.message) {
    return error.message;
  }

  return 'An error has occurred. Please try again.';
}
