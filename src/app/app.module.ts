import { APP_BASE_HREF } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ApplicationDataService, APP_DATA_KEYS } from 'src/shared/services/application-data.service';
import { HttpServicesModule } from 'src/shared/services/http/http-services.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingComponent } from './landing/landing.component';
import { AuthenticationService } from './service/authentication.service';

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpServicesModule,
  ],
  providers: [
    AuthenticationService,
    ApplicationDataService,
    { provide: APP_BASE_HREF, useValue: `/${APP_DATA_KEYS.BASE_HREF}/` },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
