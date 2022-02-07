import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpServicesModule } from 'src/shared/services/http/http-services.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthenticationService } from './service/authentication.service';
import { LoginComponent } from './login/login.component';
import { ApplicationDataService, APP_DATA_KEYS } from 'src/shared/services/application-data.service';
import { AjaxLoaderModule } from '../shared/services/ajax-loader';
import { SharedServicesModule } from 'src/shared/services';
import { LandingComponent } from './landing/landing.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LandingComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpServicesModule,
    AjaxLoaderModule.forRoot(),
    SharedServicesModule.forRoot()
    
  ],
  providers: [
    AuthenticationService,
    ApplicationDataService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
