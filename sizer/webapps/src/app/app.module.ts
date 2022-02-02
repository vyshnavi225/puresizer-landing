import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpServicesModule } from 'src/shared/services/http/http-services.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthenticationService } from './service/authentication.service';
import { LoginComponent } from './login/login.component';
import { ApplicationDataService } from 'src/shared/services/application-data.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpServicesModule
  ],
  providers: [
    AuthenticationService,
    ApplicationDataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
