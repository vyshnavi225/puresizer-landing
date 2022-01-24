/*
*  Copyright 2018-19, MapleLabs, All Rights Reserved.
*/


import { NgModule, ModuleWithProviders } from '@angular/core';

// Third party services
// import { CookieService } from 'ngx-cookie-service';

// Application Services
import { ApplicationDataService } from './application-data.service';


@NgModule({
})
export class SharedServicesModule {
    static forRoot(): ModuleWithProviders<SharedServicesModule> {
        return {
            ngModule: SharedServicesModule,
            providers: [
                // Third party services
                // CookieService,

                // Application services
                ApplicationDataService
            ]
        };
    }
}
