import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { Location } from '@angular/common';
import { NbDateService } from '@nebular/theme';
import { doc, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'ngx-camara-details',
  templateUrl: './camara-details.component.html',
  styleUrls: ['./camara-details.component.scss']
})
export class CamaraDetailsComponent implements OnInit {
  locationList: any = [{ value: "Dindigul City" }]
  ProductData: any = [{ value: 1, text: "200D (18-55MM Single Lens)" }, { value: 2, text: "200D (18-55MM and 55-250MM Dual Lens)" }]
  dayslist: any = [{ value: 1, text: "0-1 Day (Rs.600)", single: 600, dual: 900 }, { value: 2, text: "2-4 Days Rs.(550)", single: 550, dual: 850 }, { value: 3, text: "5-7 Days Rs.(500)", single: 500, dual: 800 }];


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
  gpayUrl: string;
  finalBookForm: any;
  db:any;
  constructor(private fb: FormBuilder, public location: Location, protected dateService: NbDateService<Date>) {
    this.min = this.dateService.addMonth(this.dateService.today(), -1);

  }



  ngOnInit(): void {
    this.getData();
    this.bookForm = this.fb.group({
      totalDays: this.fb.control(null),
      location: this.fb.control(null),
      product: this.fb.control(null),
      date: this.fb.control(null),
      checkbox: this.fb.control(null),
      mobile: this.fb.control(null),
    });

    this.finalBookForm = this.fb.group({
      paidAmount: this.fb.control(null),
      transactionId: this.fb.control(null)
    });
    this.bookForm.get('date').valueChanges.subscribe(changes => {
      this.rentPriceUpdateDate(changes);
    });
  }
  getData() {

  }

  changeTotalDays(event) {
    this.singlePrice = event[0].data.single;
    this.dualPrice = event[0].data.dual;
    this.calculateAmount();
  }

  get fval(): {
    [key: string]: AbstractControl
  } {
    return this.bookForm.controls;
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
    this.productValue = this.productValue == undefined ? 1 : this.productValue;
    this.duration = this.duration == undefined ? 1 : this.duration;
    if (this.toDate == null) {
      this.dateError = true;
    } else {
      if (this.fromDate != null) {
        this.ratePerDay = this.productValue == 1 ? this.singlePrice : this.dualPrice;
        const oneDay = 24 * 60 * 60 * 1000; // Milliseconds in a day
        this.duration = Math.round((this.toDate - this.fromDate) / oneDay + 1);
        this.ratePerDay = this.duration * this.ratePerDay;
        const advanceAmt = this.productValue == 1 ? 200 : 300;
        this.advanceAmount = advanceAmt * this.duration;
      }

      this.dateError = false;
    }
    if (this.fromDate == null) {
      this.ratePerDay = this.productValue == 1 ? this.singlePrice : this.dualPrice;
      const advanceAmt = this.productValue == 1 ? 200 : 300;
      this.advanceAmount = advanceAmt * this.duration;
      this.gpayUrl = `upi://pay?pa=rajamanihari19-3@oksbi&pn=Rajamani&tn=cannon200d&am=${this.advanceAmount}`
    }
  }

  async openModal() {
    this.isSubmitted = true;
    if (this.bookForm.valid && !this.dateError) {
      let date = this.bookForm.get("date").value;
      this.db.collection("bookcamara").doc(this.bookForm.get("mobile").value).set({
        totalDays: this.bookForm.get("totalDays").value,
        location: this.bookForm.get("location").value,
        product: this.bookForm.get("product").value,
        date: Timestamp.fromDate(new Date(date?.start)),
        todate: Timestamp.fromDate(new Date(date?.end)),
        paidAmount: null,
        transactionId: null,
      }).then(function() {

      });
      this.isSubmitted = false;
      this.display = "block";
    }
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
    }).then(function() {
      alert("successfully You have Booked The" + this.bookForm.get("product").value);
    });
  }
}
