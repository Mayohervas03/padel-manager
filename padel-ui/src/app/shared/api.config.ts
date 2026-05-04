import { InjectionToken } from '@angular/core';

export const API_BASE_URL = new InjectionToken<string>('api.baseUrl', {
  factory: () => 'http://localhost:8080/api'
});
