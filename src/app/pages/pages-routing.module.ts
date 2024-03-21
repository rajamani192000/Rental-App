import { AdminModule } from './admin/admin.module';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { NotFoundComponent } from './miscellaneous/not-found/not-found.component';
import { CamHomeComponent } from './camara-rental/cam-home/cam-home.component';
import { PagesComponent } from './pages.component';
const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [
    {
      path: '',
      component: CamHomeComponent,
    },
    {
      path: 'rental',
      loadChildren: () => import('./camara-rental/camara-rental.module')
        .then(m => m.CamaraRentalModule),
    },
    {
      path: 'admin',
      loadChildren: () => import('./admin/admin.module')
        .then(m => m.AdminModule),
    },
    {
      path: 'miscellaneous',
      loadChildren: () => import('./miscellaneous/miscellaneous.module')
        .then(m => m.MiscellaneousModule),
    },
    {
      path: '',
      redirectTo: 'rental',
      pathMatch: 'full',
    },
    {
      path: '**',
      component: NotFoundComponent,
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}
