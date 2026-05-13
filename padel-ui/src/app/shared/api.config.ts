import { InjectionToken } from '@angular/core';
import { environment } from '../../environments/environment';

export const API_BASE_URL = new InjectionToken<string>('api.baseUrl', {
  factory: () => environment.apiUrl
});
