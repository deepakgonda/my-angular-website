/* "Barrel" of Http Interceptors */
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import { AddJsonHeaderInterceptor } from './add-json-header-interceptor';
import { CorrectUrlInterceptor } from './correct-url-interceptor';


/** Http interceptor providers in outside-in order */
export const httpInterceptorProviders = [
  {provide: HTTP_INTERCEPTORS, useClass: CorrectUrlInterceptor, multi: true},
  {provide: HTTP_INTERCEPTORS, useClass: AddJsonHeaderInterceptor, multi: true},
];
