import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LandingComponent} from './landing.component';

const routes: Routes = [
    {
        path: '',
        component: LandingComponent,
        data: { viewName: 'landing'},
    },
];

export const LandingRouting: ModuleWithProviders<any> = RouterModule.forChild(routes);

