import { Component, Injector, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Location } from '@angular/common';
import { CommonService } from '../../service/common-service.service';
import { Router } from '@angular/router';
@Component({
  selector: 'ngx-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  productsData: any[];
  constructor(private injector:Injector,public location: Location, private router:Router,private commonSrvc:CommonService) { }

  ngOnInit(): void {
    this.getProducts();
  }

  getProducts() {
    this.commonSrvc.list("products") .subscribe((productsData: any[]) => {
      this.productsData = productsData;
    });
  }
  callProduct(data){
    this.router.navigate(['/pages/rental/common-product'], { queryParams: { data: JSON.stringify(data) } });
  }
}
