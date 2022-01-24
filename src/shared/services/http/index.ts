import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { HttpService } from './http.service';
import { ActiveXHRsListService } from './active-xhrs-list.services';
import { AuthTokenInterceptor } from './auth-token.interceptor';

@NgModule({
    imports: [
        HttpClientModule
    ],
    providers: [
        HttpService,
        ActiveXHRsListService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthTokenInterceptor,
            multi: true
        }
    ]
})
export class HttpServicesModule { }
