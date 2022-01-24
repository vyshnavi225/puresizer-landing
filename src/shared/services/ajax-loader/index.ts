/*
*  Copyright 2018-19, MapleLabs, All Rights Reserved.
*/


import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AjaxLoaderInterceptor } from './ajax-loader.interceptor';
import { AjaxLoaderComponent } from './ajax-loader-component/ajax-loader.component';

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule
    ],
    declarations: [
        AjaxLoaderComponent,
    ],
    exports: [
        AjaxLoaderComponent,
    ]
})
export class AjaxLoaderModule {
    static forRoot(): ModuleWithProviders<AjaxLoaderModule> {
        return {
            ngModule: AjaxLoaderModule,
            providers: [
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: AjaxLoaderInterceptor,
                    multi: true
                }
            ]
        };
    }
}
