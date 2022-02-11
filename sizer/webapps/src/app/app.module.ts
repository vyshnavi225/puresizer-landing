import { NgModule } from '@angular/core';
import { LocationStrategy } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { HttpServicesModule } from 'src/shared/services/http/http-services.module';
import { RouterConfigModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthenticationService } from './service/authentication.service';
import { LoginComponent } from './login/login.component';
import { ApplicationDataService } from 'src/shared/services/application-data.service';
import { AjaxLoaderModule } from '../shared/services/ajax-loader';
import { SharedServicesModule } from 'src/shared/services';
import { LandingComponent } from './landing/landing.component';
import { CustomLocationStrategyService } from './service/custom-location-strategy.service';
import { APP_BASE_HREF } from '@angular/common';
export const APP_DATA_KEYS = {
//   AUTH_DATA: 'auth_data',
//   USER_INFO: 'user_info',
//   SELECTED_WORKLOAD_DATA: 'selected_workload_data',
//   HAS_UNAUTHORIZED_ERROR: 'has_unauthorized_error',
   BASE_HREF: 'landing'
};

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LandingComponent
  ],
  imports: [
    BrowserModule,
    RouterConfigModule,
    HttpServicesModule,
    AjaxLoaderModule.forRoot(),
    SharedServicesModule.forRoot()
  ],
  providers: [
    AuthenticationService,
    ApplicationDataService,
    { provide: APP_BASE_HREF, useValue: `/${APP_DATA_KEYS.BASE_HREF}/` },
    { provide: LocationStrategy, useClass: CustomLocationStrategyService }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
