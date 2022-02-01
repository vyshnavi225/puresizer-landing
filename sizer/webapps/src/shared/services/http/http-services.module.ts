import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { HttpService } from './http.service';
import { RestService } from './rest.service';
import { AuthTokenInterceptor } from './auth-token.interceptor';
import { ActiveXHRsListService } from './active-xhrs-list.services';

@NgModule({
  imports: [HttpClientModule],
  providers: [
    HttpService,
    RestService,
    ActiveXHRsListService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthTokenInterceptor,
      multi: true
    }
  ]
})
export class HttpServicesModule { }
