import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '',
    component: LandingComponent,
  },
  {
    path: '**',
    redirectTo: ''
  }
];

export const RouterConfigModule: ModuleWithProviders<any> = RouterModule.forRoot(routes, {
  useHash: false
});
