import { Injectable } from '@angular/core';
import { NbMenuItem } from '@nebular/theme';
import { Observable, of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PagesMenu {
  pageMenus: NbMenuItem[] = [];
  adminMenu: NbMenuItem[] = [];
  getcustomerMenu(): Observable<NbMenuItem[]> {
    const pageMenus: NbMenuItem[] = [
      {
        title: 'Camara Rental',
        icon: 'shopping-cart-outline',
        children: [
          {
            title: 'Crazy Camara Rental',
            link: '/pages/rental/camHome',
            home: true,
          },
          {
            title: 'DSLR Camara',
            link: '/pages/rental/dslr',
          },
          {
            title: 'Lens',
            link: '/pages/rental/lens',
          },
        ],
      }
    ];
    return of(pageMenus);
  }

  getAdminMenu(): Observable<NbMenuItem[]> {
    const adminMenu: NbMenuItem[] = [
        {
          title: 'Camara Rental',
          icon: 'shopping-cart-outline',
          children: [
            {
              title: 'Crazy Camara Rental',
              link: '/pages/rental/camHome',
              home: true,
            },
            {
              title: 'DSLR Camara',
              link: '/pages/rental/dslr',
            },
            {
              title: 'Lens',
              link: '/pages/rental/lens',
            },
          ],
        },
      {
        title: 'Admin',
        icon: 'lock-outline',
        children: [
          {
            title: 'Dashboard',
            link: '/pages/admin/dashboard',
          },
          {
            title: 'Product Manage',
            link: '/pages/admin/product-manage',
          },
          {
            title: 'Admin User Manage',
            link: '/pages/admin/admin-list',
          },
          {
            title: 'Customer Manage',
            link: '/pages/admin/Customer',
          },
          {
            title: 'Customer Manage',
            link: '/pages/admin/dashboard',
          },
          {
            title: 'Available Camera',
            link: '/pages/admin/dashboard',
          },
          {
            title: 'Available Camera',
            link: '/pages/admin/availableCamera',
          },
          {
            title: 'Return Camera',
            link: '/pages/admin/returnCamera',
          },
          {
            title: 'Return Camera',
            link: '/pages/admin/returnCamera',
          },
          {
            title: 'Payment Manage',
            link: '/pages/admin/returnCamera',
          },
          {
            title: 'Reports',
            link: '/pages/admin/reports',
          },
          // {
          //   title: 'Register',
          //   link: '/auth/register',
          // },
          // {
          //   title: 'Request Password',
          //   link: '/auth/request-password',
          // },
          // {
          //   title: 'Reset Password',
          //   link: '/auth/reset-password',
          // },
        ],
      },
    ];
    return of(adminMenu);
  }
}
