import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';

const routes: Routes = [
  { path: 'landing', component: LandingComponent },
  // {
  //   path: 'scenario',
  //   component: ScenariosComponent,
  //   data: {
  //     viewName: 'scenario'
  //   }
  // },
  {
    path: '**',
    redirectTo: '/landing'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
