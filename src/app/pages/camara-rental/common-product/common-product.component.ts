import { CommonService } from './../../service/common-service.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, AbstractControl, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { NbDateService } from '@nebular/theme';
import { doc, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';
declare var Razorpay: any;
declare var RazorpayAffordabilitySuite: any;
@Component({
  selector: 'ngx-common-product',
  templateUrl: './common-product.component.html',
  styleUrls: ['./common-product.component.scss']
})
export class CommonProductComponent implements OnInit {
  locationList: any = []
  modelData: any = []
  dayslist: any = [];
  bookForm: FormGroup;
  display: any;
  dateError: boolean = false;
  isSubmitted: boolean = false
  public min = new Date();
  toDate: any;
  fromDate: any;
  productValue: any;
  ratePerDay: number = 0;
  duration: number = 0;
  singlePrice: any;
  dualPrice: any;
  gpayUrl: string;
  finalBookForm: any;
  db: any;
  productData: Array<any> = [];
  finalProductData: any = {};
  advanceAmt: number = 0;
  totalModelAmount: number = 0;
  fourdayAmtDisc: number = 0;
  seveenDaysMoreDisc: number = 0;
  seveendayAmtDisc: number = 0;
  oneDayDiscAmt: number = 0;
  registrationShow: boolean = false;
  paymentResponse: any;
  paymentSuccess: boolean = false;
  bookNowBtnError: boolean = false;
  isBtnSubmitted: any;
  constructor(private activatedRoute: ActivatedRoute, private fb: FormBuilder, public location: Location, protected dateService: NbDateService<Date>, private commonSrvc: CommonService) {
    this.min = this.dateService.addMonth(this.dateService.today(), -1);

  }



  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      this.productData = [];
      this.productData.push(JSON.parse(params['data']));
      this.setProductData();
    });

    this.getData();
    this.bookForm = this.fb.group({
      product: [null, [Validators.required]],
      location: [null, [Validators.required]],
      date: [null, [Validators.required]],
    });

    this.finalBookForm = this.fb.group({
      paidAmount: this.fb.control(null),
      transactionId: this.fb.control(null)
    });
    this.bookForm.get('date').valueChanges.subscribe(changes => {
      this.rentPriceUpdateDate(changes);
    });
  }

  rentPriceUpdateProduct(event) {
    if (event?.length > 0) {
      this.productValue = event[0].value;
      this.totalModelAmount = 0;
      this.advanceAmt = 0;
      this.fourdayAmtDisc = 0;
      this.seveenDaysMoreDisc = 0;
      this.oneDayDiscAmt = 0;
      this.seveendayAmtDisc = 0;
      this.ratePerDay = 0;
      event.forEach(x => {
        this.totalModelAmount += Number(x.data.modelAmt);
        this.fourdayAmtDisc = this.totalModelAmount - (Number(this.finalProductData.fourdayAmtDisc) - Number(this.finalProductData.productAmt));
        this.oneDayDiscAmt = this.totalModelAmount + Number(this.finalProductData.productAmt);
        this.seveenDaysMoreDisc = this.totalModelAmount - (Number(this.finalProductData.seveenDaysMoreDisc) - Number(this.finalProductData.productAmt));
        this.seveendayAmtDisc = this.totalModelAmount - (Number(this.finalProductData.seveendayAmtDisc) - Number(this.finalProductData.productAmt));
        this.dayslist = [{ value: 1, text: `1-2 Day ${Number(this.oneDayDiscAmt)}(Per Day)`, totalAmt: Number(this.oneDayDiscAmt) }, { value: 2, text: `3-4 Days ${Number(this.fourdayAmtDisc)}(Per Day)`, totalAmt: Number(this.fourdayAmtDisc) }, { value: 3, text: `5-7 Days ${Number(this.seveendayAmtDisc)}(Per Day)`, totalAmt: Number(this.seveendayAmtDisc) }, { value: 4, text: `8 Days ++ ${Number(this.seveenDaysMoreDisc)}(Per Day)`, totalAmt: Number(this.seveenDaysMoreDisc) }];
        this.locationList = [...new Set(x.data.pickupLocation)];
        this.advanceAmt += Number(x.data.advanceAmt);
        this.ratePerDay = this.oneDayDiscAmt;
        this.duration = 1;
        this.gpayUrl = `upi://pay?pa=rajamanihari19-3@oksbi&pn=Rajamani&tn=cannon200d&am=${this.advanceAmt}`
      });
      this.calculateAmount();
    } else {
      this.advanceAmt = 0;
      this.ratePerDay = 0;
      this.bookForm.controls["date"].reset();

    }

  }

  rentPriceUpdateDate(event) {
    this.ratePerDay = 0;
    this.toDate = event.end;
    this.fromDate = event.start;
    this.calculateAmount();
  }

  calculateAmount() {
    if (this.toDate == null) {
      this.dateError = true;
    } else {
      this.dateError = false;
      if (this.fromDate != null) {
        const oneDay = 24 * 60 * 60 * 1000; // Milliseconds in a day
        this.duration = Math.round((this.toDate - this.fromDate) / oneDay + 1);
        if (this.duration >= 1 && this.duration <= 2) {
          this.ratePerDay = this.oneDayDiscAmt;
        } else if (this.duration >= 3 && this.duration <= 4) {
          this.ratePerDay = this.duration * this.fourdayAmtDisc;
        } else if (this.duration >= 5 && this.duration <= 7) {
          this.ratePerDay = this.duration * this.seveendayAmtDisc;
        } else if (this.duration > 7) {
          this.ratePerDay = this.duration * this.seveenDaysMoreDisc;
        }
      }
      if (this.fromDate == null) {
        this.ratePerDay = this.oneDayDiscAmt;
      }
    }

  }
  setProductData() {
    this.productData.forEach(element => {
      element.specs = element.specs.replace(/\n/g, '').split(',');
      element.inclusions = element.inclusions.replace(/\n/g, '').split(',');
      element.modelDet.forEach(e => {
        this.modelData.push(e)
      });
    });

    this.finalProductData = this.productData[0];

  }
  getData() {

  }

  // changeTotalDays(event) {
  //   this.singlePrice = event[0].data.totalAmt;
  //   this.calculateAmount();
  // }

  get fval(): {
    [key: string]: AbstractControl
  } {
    return this.bookForm.controls;
  }

  createOrder() {
    // Call createOrder method with the amount
    this.isBtnSubmitted=true;
    this.isSubmitted=true;
    if (this.advanceAmt>0 && this.bookForm.valid) {
      this.isSubmitted=false;
      this.bookNowBtnError=false;
      this.commonSrvc.getById('credentials', 'razorpay').subscribe(params => {
        this.commonSrvc.createOrder(Number(this.advanceAmt) * 100).subscribe(
          response => {
            var options = {
              "key": params.keyId, // Enter the Key ID generated from the Dashboard
              "amount": response.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
              "currency": "INR",
              "name": "Dindigul Camera Rental", //your business name
              "description": "Test Transaction",
              "image": "https://example.com/your_logo",
              "send_sms_hash": true,
              "order_id": response.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
              "handler": (response) => {
                this.paymentSuccessHandler(response);
              },
              "prefill": { //We recommend using the prefill parameter to auto-fill customer's contact information especially their phone number
                "name": "rajamani", //your customer's name
                "email": "rajamni@gmail.com",
                "contact": "7904998687" //Provide the customer's phone number for better conversion rates 
              },
              "notes": {
                "address": "Razorpay Corporate Office"
              },
              "theme": {
                "color": "#3399cc"
              }
            };

            var rzp1 = new Razorpay(options);
            rzp1.open();


          },
          error => {
            console.error('Error creating order:', error);

          }
        );
      });
    }else{
      this.isBtnSubmitted=false;
      this.bookNowBtnError=true;  
    }
  }
  paymentSuccessHandler(response: any) {
    this.isBtnSubmitted=false;
    this.paymentResponse = response;
    this.paymentSuccess = true;
  }


  async openModal() {
    this.registrationShow = true;
    this.isSubmitted = true;
    // if (this.bookForm.valid && !this.dateError) {
    //   let date = this.bookForm.get("date").value;
    //   this.db.collection("bookcamara").doc(this.bookForm.get("mobile").value).set({
    //     totalDays: this.bookForm.get("totalDays").value,
    //     location: this.bookForm.get("location").value,
    //     product: this.bookForm.get("product").value,
    //     date: Timestamp.fromDate(new Date(date?.start)),
    //     todate: Timestamp.fromDate(new Date(date?.end)),
    //     paidAmount: null,
    //     transactionId: null,
    //   }).then(function () {

    //   });
    //   this.isSubmitted = false;
    //   this.display = "block";
    // }
  }

  gpay() {
    window.open(this.gpayUrl, '_blank')
  }
  onCloseHandled() {
    this.display = "none";
  }


  async finalCambook() {
    let date = this.bookForm.get("date").value;

    this.db.collection("bookcamara").doc(this.bookForm.get("mobile").value).update({
      totalDays: this.bookForm.get("totalDays").value,
      location: this.bookForm.get("location").value,
      product: this.bookForm.get("product").value,
      date: Timestamp.fromDate(new Date(date?.start)),
      todate: Timestamp.fromDate(new Date(date?.end)),
      paidAmount: this.finalBookForm.get("paidAmount").value,
      transactionId: this.finalBookForm.get("transactionId").value,
    }).then(function () {
      alert("successfully You have Booked The" + this.bookForm.get("product").value);
    });
  }
}
