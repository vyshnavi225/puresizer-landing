import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest, HttpResponse, HttpParams, HttpHandler } from '@angular/common/http';

import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/finally';
import { ActiveXHRsListService } from './active-xhrs-list.services';

@Injectable()
export class HttpService {

  private defaultHeaders: {} = {};

  constructor(private httpClient: HttpClient, private activeXHRsListService: ActiveXHRsListService) { }

  private getNonNullAndNonUndefinedValues(srcDict: { [key: string]: string }): ({ [key: string]: string }) {
    if (!srcDict) {
      return srcDict;
    }

    return Object.keys(srcDict).reduce((data, prop) => {
      const val = srcDict[prop];
      if (val !== undefined && val !== null) {
        data[prop] = val;
      }
      return data;
    }, {});
  }

  private getHeaders(headersConfig: any): HttpHeaders {
    // deleting headers with no value
    const updatedHeadersObj: any = this.getNonNullAndNonUndefinedValues(headersConfig);
    let httpHeaders = new HttpHeaders({ headers: updatedHeadersObj });
    Object.keys(updatedHeadersObj).forEach(headerName => {
      httpHeaders = httpHeaders.append(headerName, updatedHeadersObj[headerName]);
    });
    return httpHeaders;
  }

  private getParams(paramsConfig = {}): HttpParams {
    let httpParams = new HttpParams();
    Object.keys(paramsConfig).forEach((key) => {
      httpParams = httpParams.append(key, paramsConfig[key]);
    });
    return httpParams;
  }

  private removedNullUndefinedData(data: any): void {
    if (!data) {
      return;
    }
    Object.keys(data).forEach(dataProp => {
      if (data[dataProp] === null || data[dataProp] === undefined) {
        delete data[dataProp];
      }
    });
  }

  processRequest(config): Observable<any> {
    config.headers = {
      ...this.defaultHeaders,
      ...(config.headers || {})
    };
    this.removedNullUndefinedData(config);
    this.removedNullUndefinedData(config.headerName);

    config.headers = this.getHeaders(config.headers);
    config.params = this.getParams(config.params);

    return new Observable((observer) => {
      let subscription = this.httpClient.request(config.method, config.url, config)
        .catch((errorResponse: HttpResponse<any>) => {
          this.logErrors(errorResponse);
          observer.error(errorResponse);
          observer.complete();
          return Observable.throw(errorResponse);
        })
        .finally(() => {
          this.activeXHRsListService.delete(subscription);
        })
        .subscribe((response) => {
          observer.next(response);
          observer.complete();
        });
      subscription = this.activeXHRsListService.add(subscription);
      return subscription;
    });
  }

  cancelAllRequest(): void {
    this.activeXHRsListService.cancelAll();
  }

  cancelRequest(subscription: any): void {
    this.activeXHRsListService.delete(subscription);
  }


  private logErrors(errorResponse: any): void {
    // In a real world app, you might use a remote logging infrastructure
    // console.warn('Global Error Handler for AJAX Calls');
  }

}
