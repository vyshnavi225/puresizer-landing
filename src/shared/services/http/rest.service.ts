import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';

@Injectable()
export class RestService {

    protected baseUrl: string = 'rest_url';
    protected queryName: string = 'REST_SERVICE_NAME_PREFIX';
    protected headers: {} = {};
    protected ajaxLoaderEnabled: boolean = false;

    constructor(private httpService: HttpService) { }

    private getDefaultConfig(requestMethod: any, queryParams: any, queryPrefix: any, loaderId: any, config: any = {}): any {
        const headers = this.ajaxLoaderEnabled ? {
            ...this.headers,
            ...config.headers,
            ajax_loader: loaderId ? loaderId : `${queryPrefix}_${this.queryName}`
        } : { ...this.headers, ...config.headers };

        return {
            ...config,
            method: requestMethod,
            params: queryParams,
            headers
        };
    }

    private hasDynamicPathParams(url: string): boolean {
        const pattern = /{{.*?}}/;
        const result = url.match(pattern);
        return result && result.length !== 0;
    }

    private getComputedtedUrl(url: string, pathParams: any): string {
        if (!pathParams) {
            throw new Error('Path Parameters required');
        }
        const pattern = /{{.*?}}/g;
        const result: string[] = url.match(pattern);
        result.forEach(match => {
            // replacing curly braces '{'  & '}'
            const propName = match.replace(/{|}/g, '');
            const isOptionalParam = propName.indexOf('?') !== -1;
            // replacing curly braces '?'
            const _propName = propName.replace('?', '');
            if (pathParams[_propName] === undefined) {
                if (!isOptionalParam) {
                    const message = `MPL - Rest Service: ${_propName} is required in pathParam config`;
                    throw new Error(message);
                }
                url = url.replace(match, '');
            } else {
                url = url.replace(match, pathParams[_propName]);
            }
            // replacing trailing '/'
            url = url.replace(/\/$/, '');
        });
        return url;
    }

    getUrl(pathParams, reqMethod?: string): string {
        if (pathParams) {
            let url = pathParams.url || this.baseUrl;
            if (this.hasDynamicPathParams(url)) {
                return this.getComputedtedUrl(url, pathParams);
            } else if (pathParams.props && pathParams.props.length) {
                pathParams.props.forEach(propName => {
                    url += '/' + pathParams[propName];
                });
                return url;
            } else if (pathParams.id !== undefined) {
                return `${url}/${pathParams.id}`;
            } else {
                return url;
            }
        } else if (this.hasDynamicPathParams(this.baseUrl)) {
            return this.getComputedtedUrl(this.baseUrl, {});
        } else {
            return this.baseUrl;
        }
    }

    get(pathParams?, queryParams?, loaderId?, customConfig?): Observable<any> {
        const config: any = this.getDefaultConfig('GET', queryParams, 'GET', loaderId, customConfig);
        config.url = this.getUrl(pathParams);
        return this.httpService.processRequest(config);
    }

    query(pathParams?, queryParams?, loaderId?, customConfig?: any): Observable<any> {
        const config: any = this.getDefaultConfig('GET', queryParams, 'QUERY', loaderId, customConfig);
        config.url = this.getUrl(pathParams);
        return this.httpService.processRequest(config);
    }

    post(pathParams?, queryParams?, payload?, loaderId?, customConfig?: any): Observable<any> {
        const config: any = this.getDefaultConfig('POST', queryParams, 'POST', loaderId, customConfig);
        config.url = this.getUrl(pathParams);
        config.body = payload;
        return this.httpService.processRequest(config);
    }

    put(pathParams?, queryParams?, payload?, loaderId?, customConfig?: any): Observable<any> {
        const config: any = this.getDefaultConfig('PUT', queryParams, 'PUT', loaderId, customConfig);
        config.url = this.getUrl(pathParams);
        config.body = payload;
        return this.httpService.processRequest(config);
    }

    save(pathParams?, queryParams?, payload?, loaderId?): Observable<any> {
        const config: any = this.getDefaultConfig('POST', queryParams, 'CREATE', loaderId);
        config.url = this.getUrl(pathParams, config.method);
        config.body = payload;
        return this.httpService.processRequest(config);
    }
    update(pathParams?, queryParams?, payload?, loaderId?): Observable<any> {
        const config: any = this.getDefaultConfig('PUT', queryParams, 'UPDATE', loaderId);
        config.url = this.getUrl(pathParams, config.method);
        config.body = payload;
        return this.httpService.processRequest(config);
    }

    delete(pathParams?, queryParams?, payload?, loaderId?, customConfig?: any): Observable<any> {
        const config: any = this.getDefaultConfig('DELETE', queryParams, 'DELETE', loaderId, customConfig);
        config.url = this.getUrl(pathParams);
        config.body = payload;
        return this.httpService.processRequest(config);
    }

}
