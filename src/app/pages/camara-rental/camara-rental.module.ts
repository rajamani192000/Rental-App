import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { CamaraRentalComponent } from './camara-rental.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CamaraRentalRoutingModule } from './camara-rental-routing.module';
import { CamHomeComponent } from './cam-home/cam-home.component';
import { ProductListComponent } from './product-list/product-list.component';
import { CamaraDetailsComponent } from './camara-details/camara-details.component';
import { RouterModule } from '@angular/router';
import { ThemeModule } from '../../@theme/theme.module';
import { LensListComponent } from './lens-list/lens-list.component';
import { CanonSevenhundredDetailsComponent } from './canon-sevenhundred-details/canon-sevenhundred-details.component';
import { CannonLongLensComponent } from './cannon-long-lens/cannon-long-lens.component';
import { NbDatepickerModule,NbTabsetModule } from '@nebular/theme';
import { NgxSelectModule } from 'ngx-select-ex';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { QRCodeModule } from 'angular2-qrcode';
@NgModule({
  declarations: [CamaraRentalComponent, CamHomeComponent, ProductListComponent, CamaraDetailsComponent, LensListComponent, CanonSevenhundredDetailsComponent, CannonLongLensComponent],
  imports: [
    ThemeModule,
    RouterModule,
    CommonModule,
    CamaraRentalRoutingModule,
    NbTabsetModule,
    NgxSelectModule,
    FormsModule,
    QRCodeModule,
    ReactiveFormsModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    NbDatepickerModule
  ]
})
export class CamaraRentalModule { }
