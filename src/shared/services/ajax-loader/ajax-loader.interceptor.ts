/*
*  Copyright 2018-19, MapleLabs, All Rights Reserved.
*/


import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpEvent, HttpRequest, HttpHandler, HttpInterceptor, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { ActiveAjaxLoadersService, XHR_REQUEST_STATE } from './active-ajax-loaders.service';
import { HTTP_ERROR_CODES } from '../../enums/http-codes.enum';

@Injectable()
export class AjaxLoaderInterceptor implements HttpInterceptor {

    private loaderProp = 'ajax_loader';

    constructor(
        private activeAjaxLoadersService: ActiveAjaxLoadersService
    ) { }

    intercept(request: HttpRequest<any>, httpHandler: HttpHandler): Observable<HttpEvent<any>> {
        // console.log('ajax-loader interceptor');
        const loaderName = request.headers.get(this.loaderProp);
        const newReq: HttpRequest<any> = request.clone({
            headers: request.headers.delete(this.loaderProp)
        });

        this.updateLoaderState(loaderName, XHR_REQUEST_STATE.PROGRESS);

        return httpHandler.handle(newReq).pipe(
            map((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                    // console.log('ajax-loader interceptor success handler');
                    this.updateLoaderState(loaderName, XHR_REQUEST_STATE.SUCCESS, event);
                }
                return event;
            }),
            catchError((errorResponse: HttpErrorResponse) => {
                // console.log('ajax-loader interceptor error handler ');
                const errorMessage = this.getErrorMessage(errorResponse, loaderName);
                switch (errorResponse.status) {
                    case HTTP_ERROR_CODES.INVALID_TOKEN:
                        // data/cookie clean-up if required and logout the user if requried
                        break;
                    default: {
                        // error handler, may be write to a logger
                    }
                }
                this.updateLoaderState(loaderName, XHR_REQUEST_STATE.ERROR, { error: errorMessage });
                return throwError(errorResponse);
            })
        );
    }

    private getErrorMessage(errorResponse: any, loaderName: string): string {
        let errorMessage = `Unknown Error in API call ${loaderName}`;

        const responseErrorBody = errorResponse.error;
        if (responseErrorBody && errorResponse.status !== 0) {
            if (typeof responseErrorBody === 'string' && responseErrorBody.length > 500) {
                // left it to default error message
            } else {
                errorMessage = (responseErrorBody.error || responseErrorBody.message
                    || responseErrorBody.detail || JSON.stringify(responseErrorBody));
            }
        }

        return errorMessage;

    }

    private updateLoaderState(loaderName: any, loaderState: any, data?: any): void {
        if (loaderName) {
            this.activeAjaxLoadersService.updateLoaderState(loaderName, loaderState, data);
        }
    }
}
