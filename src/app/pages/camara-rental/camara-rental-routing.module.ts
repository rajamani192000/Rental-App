import { CannonLongLensComponent } from './cannon-long-lens/cannon-long-lens.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CamHomeComponent } from './cam-home/cam-home.component';
import { ProductListComponent } from './product-list/product-list.component';
import { CamaraDetailsComponent } from './camara-details/camara-details.component';
import { CamaraRentalComponent } from './camara-rental.component';
import { LensListComponent } from './lens-list/lens-list.component';
import { CanonSevenhundredDetailsComponent } from './canon-sevenhundred-details/canon-sevenhundred-details.component';

const routes: Routes = [
  {
  path: '',
  component: CamaraRentalComponent,
  children: [
    {
      path: 'dslr',
      component: ProductListComponent,
    },
    {
      path: 'camHome',
      component: CamHomeComponent,
    },
    {
      path: '200d-single',
      component: CamaraDetailsComponent,
    },
    {
      path: '700d-single',
      component: CanonSevenhundredDetailsComponent,
    },
    {
      path: 'lens',
      component: LensListComponent,
    },
    {
      path: 'cannon-long-lens',
      component: CannonLongLensComponent,
    },
  ],
},
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CamaraRentalRoutingModule { }
