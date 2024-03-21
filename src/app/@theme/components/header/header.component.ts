import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
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

@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {

  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly: boolean = false;
  user: User;
  srcname = "/assets/images/crazylogo.png";
  whatsapp = "/assets/images/raja.jpg";
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

  userMenu = [{ title: 'Whatsapp' }, { title: 'Call' }];
  faild: boolean = false;

  constructor(private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private themeService: NbThemeService,
    private userService: UserService,
    private layoutService: LayoutService,
    private breakpointService: NbMediaBreakpointsService,
    private afAuth: AngularFireAuth,
    private router: Router, private cdr: ChangeDetectorRef,
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

      this.localStorageSubscription = this.commonSrvc.getLoginDetailFromLocalStorage()
      .subscribe(data => {
        this.user = data;
      });

  }
  routeLogin(){
    this.router.navigate(['/pages/admin/login']);
  }

  logout() {
    this.afAuth.signOut().then(() => {
      this.faild = true;
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

      setTimeout(() => {
        this.faild = false;
          this.router.navigateByUrl('/theme', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/pages/admin/login']);
          });
      }, 2000);
    }).catch((error) => {
      // An error happened.
    });
  }

  ngOnDestroy() {
    this.localStorageSubscription.unsubscribe();
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
