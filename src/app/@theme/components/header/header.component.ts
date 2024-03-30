import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { NbMediaBreakpointsService, NbMenuService, NbSidebarService, NbThemeService } from '@nebular/theme';

import { User, UserData } from '../../../@core/data/users';
import { LayoutService } from '../../../@core/utils';
import { map, takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { userInfo } from 'os';
import { UserService } from '../../../@core/mock/users.service';
import { CommonService } from '../../../pages/service/common-service.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'ngx-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {

  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly: boolean = false;
  user: any;
  registrationShow: boolean = false;
  srcname = "/assets/images/crazylogo.png";
  whatsapp = "/assets/images/raja.jpg";
  avatarIcon="/assets/images/avatar.jpg";
  call = "/assets/images/call.jpg";
  themes = [
    {
      value: 'default',
      name: 'Light',
    },
    {
      value: 'dark',
      name: 'Dark',
    },
    {
      value: 'cosmic',
      name: 'Cosmic',
    },
    {
      value: 'corporate',
      name: 'Corporate',
    },
  ];


  private localStorageSubscription: Subscription;
  currentTheme = 'default';
  userMenu:any;

  faild: boolean = false;

  constructor(private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private themeService: NbThemeService,
    private userService: UserService,
    private layoutService: LayoutService,
    private breakpointService: NbMediaBreakpointsService,
    private afAuth: AngularFireAuth,
  // private spinner:NgxSpinnerService,
    private commonSrvc:CommonService) {
  }

  ngOnInit() {

    this.currentTheme = this.themeService.currentTheme;

    const { xl } = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(
        map(([, currentBreakpoint]) => currentBreakpoint.width < xl),
        takeUntil(this.destroy$),
      )
      .subscribe((isLessThanXl: boolean) => this.userPictureOnly = isLessThanXl);

    this.themeService.onThemeChange()
      .pipe(
        map(({ name }) => name),
        takeUntil(this.destroy$),
      )
      .subscribe(themeName => this.currentTheme = themeName);

     this.commonSrvc.getLoginDetailFromLocalStorage()
      .subscribe(data => {
        this.user = data;
        if(this.user.imageUrl == null || this.user.imageUrl == "undefined"){
          this.user.imageUrl="https://firebasestorage.googleapis.com/v0/b/dindigulcamara.appspot.com/o/adminUser_images%2Favatar.jpg?alt=media&token=0a438f89-d498-46a0-8168-9fae6863baf5"
        }
        this.userMenu = [{ title: `Profile ${this.user.username == null ? "" : "("+this.user.username+")"}` },{ title: 'Orders'}, { title: 'Whatsapp Booking', link: "https://wa.me/+917904998687?text=Hi, I need your help renting a product from https://dindigulcamara.web.app/ . Please provide your details - Equipment type, Start Date, End Date"}];
      });
  }


  showRegistraion(){
    this.registrationShow=true;
  }

  logout() {
    // this.spinner.show();
    this.afAuth.signOut().then(() => {

      this.user=null;
      var data={
        uid: null,
        username: null,
        email: null,
        password: null,
        role: null,
        mobile: null,
        last_login_timestamp: null,
        tenantId: null,
        createdby: null,
        status: null,
        imageUrl: null,
        createdDate: null
      }
      const jsonData = JSON.stringify(data);
      localStorage.setItem('currentUser', jsonData);
      this.user = data;
       this.faild = true;
      setTimeout(() => {
         this.faild = false;
         window.location.reload();
      }, 3000);
      // this.spinner.hide();
    }).catch((error) => {
      // this.spinner.hide();
      // An error happened.
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  changeTheme(themeName: string) {
    this.themeService.changeTheme(themeName);
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.layoutService.changeLayoutSize();

    return false;
  }

  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }

}
