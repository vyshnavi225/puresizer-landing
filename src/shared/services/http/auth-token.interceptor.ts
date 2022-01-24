/*
*  Copyright 2017-18, MapleLabs, All Rights Reserved.
*
*/


import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, filter, take, switchMap, map } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/service/authentication.service';
import { HTTP_ERROR_CODES } from 'src/shared/enums/http-codes.enum';

// Interceptor Yet to be setup

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {

    private token: string;

    constructor(
        private authenticationService: AuthenticationService
    ) { }

    intercept(request: HttpRequest<any>, httpHandler: HttpHandler): Observable<HttpEvent<any>> {
        //   console.log('http-token interceptor', this.token);
        const newReq: HttpRequest<any> = this.token ? request.clone({
            headers: request.headers.set('Authorization', this.token)
        }) : request;

        return httpHandler.handle(newReq).pipe(
            map((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                    // console.log('http-token interceptor success handler');
                }
                return event;
            }),
            catchError((errorResponse: HttpErrorResponse) => {
                //   console.log('http-token interceptor error handler ');
                switch (errorResponse.status) {
                    case HTTP_ERROR_CODES.UNAUTHORIZED:
                        // logout the user from the application
                        // clean up user data if any
                        this.authenticationService.redirectToLogin(true);
                        break;
                    case HTTP_ERROR_CODES.REQUEST_TIMEOUT:
                        // logout the user from the application
                        // clean up user data if any
                        /* this.authenticationService.logout(true); */
                        break;
                    default: {

                    }
                }
                return throwError(errorResponse);
            })
        );
    }

}
