import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup,Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable, Subject } from 'rxjs';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'ngx-cannon-long-lens',
  templateUrl: './cannon-long-lens.component.html',
  styleUrls: ['./cannon-long-lens.component.scss']
})
export class CannonLongLensComponent implements OnInit {
  locationList: any = [{ value: "Dindigul City" }]
  ProductData: any = [{ value: 1, text: "Canon 55-250MM Lens" }]
  dayslist: any = [{ value: 1, text: "0-1 Day (Rs.400)", single: 400, dual: 400 }, { value: 2, text: "2-4 Days Rs.(350)", single: 350, dual: 350 }, { value: 3, text: "5-7 Days Rs.(300)", single: 300, dual: 300 }];
  bookForm: FormGroup;
  display: any;
  dateError: boolean = false;
  isSubmitted: boolean = false
  public min = new Date();
  advanceAmount: number;
  toDate: any;
  fromDate: any;
  productValue: any;
  ratePerDay: number;
  duration: number;
  singlePrice: any;
  dualPrice: any;
  cameras: any[];
  products: any[];
  constructor(private fb: FormBuilder,public location: Location,private firestore :AngularFirestore) { }

  ngOnInit(): void {
    this.getData();
    this.bookForm = this.fb.group({
      totalDays: this.fb.control(null),
      location: this.fb.control(null),
      product: this.fb.control(null),
      date: this.fb.control(null),
      checkbox: this.fb.control(null),
      year: this.fb.control(null)
    });

    this.bookForm.get('date').valueChanges.subscribe(changes => {
      this.rentPriceUpdateDate(changes);
          });
  }

  getData(){
    this.firestore
    .collection('camera')
    .valueChanges()
    .subscribe((products: any[]) => {
      this.products = products;
      console.log(products);
      this.postData();
      // localStorage.setItem('products', JSON.stringify(this.products));
      // this.originalArray = products;
    });
  }

  postData(){
    var postData={
      "baseprice": 600,
      "brand": "Cannon",
      "description": "Rent Canon 200D Mark-II for your better experience, Renting a Camera has never been so easy. We provide all kind of Professional Cameras on rent. Our wide range of rental products include Brands like Canon, Sony, Carl Zeiss, Compact Prime, Sigma, Samyang. Book now to rent a camera and make your project better without spending a lot.",
      "type": "DSLR",
      "imageurl": "https://example.com/camera_image.jpg",
      "name": " Canon 200D Mark-II",
      "specs": "24.1megapixel APS-C CMOS Sensor, Dual pixel CMOS AF, DIGIC 8, 3 975 selectable focus positions (Live View), Wifi Photo Video Transfer, 3inch Rotatetable Display, Eye Detection AF (One Shot & Servo AF – Live View),",
      "modelName": [
          {
              "price": [
                  {
                      "onedayprice": 600
                  },
                  {
                      "fourdayprice": 550
                  },
                  {
                      "seveendayprice": 500
                  }
              ],
              "modelName": "\"200D (18-55MM Single Lens)\""
          }
      ],
      "id": "2",
      "availability": true
  }

  // this.firestore
  //             .collection('camera')
  //             .doc(postData.id)
  //             .set(postData)
  //             .then((data) => {
  //               console.log(
  //                 'Product data Added successfully:',
  //                 data
  //               );
  //             })
  //             .catch((error) => {
  //               console.error(
  //                 'Error Adding product data:',
  //                 error
  //               );
  //             });



  }

  changeTotalDays(event) {
    this.singlePrice = event[0].data.single;
    this.dualPrice = event[0].data.dual;
    this.calculateAmount();
  }

  rentPriceUpdateDate(event) {

    this.ratePerDay = 0;
    this.advanceAmount = 0;
    this.toDate = event.end;
    this.fromDate = event.start;
    this.calculateAmount();
  }
  rentPriceUpdateProduct(event) {
    this.productValue = event[0].value;
    this.calculateAmount();
  }
  calculateAmount() {
    this.productValue=this.productValue==undefined?1:this.productValue;
    this.duration=this.duration==undefined?1:this.duration;
    if (this.toDate == null) {
      this.dateError = true;
    } else {
      if (this.fromDate != null) {
        this.ratePerDay = this.productValue == 1 ? this.singlePrice : this.dualPrice;
        const oneDay = 24 * 60 * 60 * 1000; // Milliseconds in a day
        this.duration = Math.round((this.toDate - this.fromDate) / oneDay+1);
        this.ratePerDay = this.duration * this.ratePerDay;
        const advanceAmt = this.productValue == 1 ? 200 : 200;
        this.advanceAmount = advanceAmt * this.duration;
      }

      this.dateError = false;
    }
    if (this.fromDate == null) {
      this.ratePerDay = this.productValue == 1 ? this.singlePrice : this.dualPrice;
      const advanceAmt = this.productValue == 1 ? 200 : 200;
      this.advanceAmount = advanceAmt * this.duration;
    }
  }
  get fval(): {
    [key: string]: AbstractControl
  } {
    return this.bookForm.controls;
  }
  openModal() {
    this.isSubmitted = true;
    if (this.bookForm.valid && !this.dateError) {
      this.isSubmitted = false;
      this.display = "block";

    }
  }
  onCloseHandled() {
    this.display = "none";
  }

}
