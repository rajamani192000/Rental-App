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
  loggedUser: any;
  popupMessage: string;
  popupAlert: boolean = false;
  logInError: boolean = false;
  constructor(private injector:Injector,public location: Location, private router:Router,private commonSrvc:CommonService) { }

  ngOnInit(): void {
    this.getProducts();
    this.commonSrvc.getLoginDetailFromLocalStorage()
    .subscribe(data => {
      this.loggedUser = data == undefined ? null : data;
    });
  }

  getProducts() {
    this.commonSrvc.list("products") .subscribe((productsData: any[]) => {
      this.productsData = productsData;
    });
  }
  callProduct(data){
    if(this.loggedUser?.email != null && this.loggedUser != null){
      this.logInError=false;
      this.router.navigate(['/pages/rental/common-product'], { queryParams: { data: JSON.stringify(data) } });
    }else{
      this.logInError=true;
      this.showPopUpMessage("Please Login First Then Book")
    }
  }
  showPopUpMessage(message: string): void {
    this.popupMessage = message;
    this.popupAlert = true;
    setTimeout(() => {
      this.popupAlert = false;
    }, 3000); // Clear message after 3 seconds
  }
}
