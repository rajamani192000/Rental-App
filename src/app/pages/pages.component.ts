import { User } from './../@core/data/users';
import { Component } from '@angular/core';

import { PagesMenu } from './pages-menu';
import { NbMenuItem } from '@nebular/theme';
import { takeWhile } from 'rxjs/operators';
import { CommonService } from './service/common-service.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ngx-pages',
  styleUrls: ['pages.component.scss'],
  template: `
    <ngx-one-column-layout>
      <nb-menu [items]="menu"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `,
})
export class PagesComponent {
  menu: NbMenuItem[] = [];
  alive: boolean = true;
  private localStorageSubscription: Subscription;
  userData: any;
  constructor(private pageMenuService:PagesMenu,private commonSrvc:CommonService) {
    this.localStorageSubscription = this.commonSrvc.getLoginDetailFromLocalStorage()
    .subscribe(data => {
      this.userData = data;
    });


    this.pageMenuService.getcustomerMenu()
    .pipe(takeWhile(() => this.alive))
    .subscribe(menu => {
      this.menu = menu;
    });
    if(this.userData?.role=="Admin"){
      this.pageMenuService.getAdminMenu()
      .pipe(takeWhile(() => this.alive))
      .subscribe(menu => {
        this.menu=menu;
      });
    }


  }

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngOnDestroy(): void {
    this.localStorageSubscription.unsubscribe();
    this.alive = false;
  }
}
