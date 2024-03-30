
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminComponent } from './admin.component';
import { LoginComponent } from './login/login.component';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { RouterModule } from '@angular/router';
import { ThemeModule } from '../../@theme/theme.module';
import { NbCardModule, NbDatepickerModule,NbIconModule,NbInputModule,NbTabsetModule, NbTreeGridModule } from '@nebular/theme';
import { NgxSelectModule } from 'ngx-select-ex';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { QRCodeModule } from 'angular2-qrcode';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminListComponent } from './admin-list/admin-list.component';
import { ComponentsModule } from '../../@components/components.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { FilterPipe } from '../../@theme/pipes/filter.pipe';
import { ProductManageComponent } from './product-manage/product-manage.component';
import { NgxSpinnerModule } from 'ngx-spinner';

FilterPipe
@NgModule({
  declarations: [AdminComponent,LoginComponent,ProductManageComponent,AdminDashboardComponent,AdminListComponent,FilterPipe],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  imports: [
    CommonModule,
    ComponentsModule,
    NgxSelectModule,
    OwlDateTimeModule,
    NgxPaginationModule,
    NbCardModule,
    NbTreeGridModule,
    NbIconModule,
    NbInputModule,
    ThemeModule,
    Ng2SmartTableModule,
    AdminRoutingModule,
    NgxSpinnerModule,
    ThemeModule,
    RouterModule,
    NbTabsetModule,
    NgxSelectModule,
    FormsModule,
    QRCodeModule,
    ReactiveFormsModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    NbDatepickerModule
  ],
  exports:[LoginComponent]
})
export class AdminModule { }
