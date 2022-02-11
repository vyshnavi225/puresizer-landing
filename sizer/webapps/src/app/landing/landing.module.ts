import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingComponent } from '../landing/landing.component';
import { LandingRouting } from './landing.route';

@NgModule({
  declarations: [LandingComponent],
  imports: [
    LandingRouting,
    CommonModule,
  ],
  providers: []
})
export class LandingModule { }