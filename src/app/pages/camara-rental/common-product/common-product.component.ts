import { CommonService } from './../../service/common-service.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, AbstractControl, Validators } from '@angular/forms';
import { DatePipe, Location } from '@angular/common';
import { NbDateService } from '@nebular/theme';
import { doc, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import * as moment from 'moment';
@Component({
  selector: 'ngx-common-product',
  templateUrl: './common-product.component.html',
  styleUrls: ['./common-product.component.scss']
})
export class CommonProductComponent implements OnInit {
  locationList: any = []
  modelData: any = []
  dayslist: any = [];
  qtyData: Array<any> = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  bookForm: FormGroup;
  display: any;
  dateError: boolean = false;
  isSubmitted: boolean = false
  min: Date;
  max: Date;
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
  myOrders: boolean = false;
  isBtnSubmitted: any;
  popupMessage: string;
  popupAlert: boolean;
  paymentDetails: any;
  createdOrder: any;
  loggedUser: any = null;
  selectedModel: Array<any> = [];
  bookingData: any;
  pickupDateTime: any = null;
  selectedModelName: any;
  stockError: boolean;
  stockErrorMsg: string;
  availableStockData: Array<any> = [];
  isProductBtnSubmitted: boolean;
  ratePerDayCopy: number;
  advanceAmtCopy: number;
  availableQtyErrorMsg: string;
  availableQtyError: boolean;
  rentalQty: number;
  hours: any;
  minutes: any;
  constructor(private activatedRoute: ActivatedRoute, private datePipe: DatePipe, private fb: FormBuilder, private spinner: NgxSpinnerService, public location: Location, protected dateService: NbDateService<Date>, private commonSrvc: CommonService) {
    this.min = this.dateService.addMonth(this.dateService.today(), -5);
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
      qty: [null, [Validators.required]],
      pickUpdate: [null, [Validators.required]],
      notes: [null],
    });

    this.finalBookForm = this.fb.group({
      paidAmount: this.fb.control(null),
      transactionId: this.fb.control(null)
    });
    this.bookForm.get('date').valueChanges.subscribe(changes => {
      this.rentPriceUpdateDate(changes);
    });
    this.commonSrvc.getLoginDetailFromLocalStorage()
      .subscribe(data => {
        this.loggedUser = data == undefined ? null : data;
      });

    this.locationList = this.finalProductData.pickUpDetails;
  }

  changeLocation(event) {
    this.bookForm.controls['location'].setValue(event[0].data);
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
      this.selectedModel = [];
      this.selectedModelName = "";
      event.forEach((x, i) => {
        this.totalModelAmount += Number(x.data.modelAmt);
        this.fourdayAmtDisc = this.totalModelAmount - (Number(this.finalProductData.fourdayAmtDisc) - Number(this.finalProductData.productAmt));
        this.oneDayDiscAmt = this.totalModelAmount + Number(this.finalProductData.productAmt);
        this.seveenDaysMoreDisc = this.totalModelAmount - (Number(this.finalProductData.seveenDaysMoreDisc) - Number(this.finalProductData.productAmt));
        this.seveendayAmtDisc = this.totalModelAmount - (Number(this.finalProductData.seveendayAmtDisc) - Number(this.finalProductData.productAmt));
        this.dayslist = [{ value: 1, text: `1-2 Day ${Number(this.oneDayDiscAmt)}(Per Day)`, totalAmt: Number(this.oneDayDiscAmt) }, { value: 2, text: `3-4 Days ${Number(this.fourdayAmtDisc)}(Per Day)`, totalAmt: Number(this.fourdayAmtDisc) }, { value: 3, text: `5-7 Days ${Number(this.seveendayAmtDisc)}(Per Day)`, totalAmt: Number(this.seveendayAmtDisc) }, { value: 4, text: `8 Days ++ ${Number(this.seveenDaysMoreDisc)}(Per Day)`, totalAmt: Number(this.seveenDaysMoreDisc) }];
        this.advanceAmt += Number(x.data.advanceAmt);
        this.advanceAmtCopy = this.advanceAmt;
        this.ratePerDay = this.oneDayDiscAmt;
        const comma = i >= 1 ? ",\n" : "";
        this.selectedModelName = this.selectedModelName.concat(comma, x.value);
        this.selectedModel.push(x.data);
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
  timeChange(event) {
    var currentDate = event.value;
    this.pickupDateTime = null;
    // Extracting time from the Date object
    this.hours = currentDate.getHours();
    this.minutes = currentDate.getMinutes();
    this.calculateAmount();
  }

  rentPriceUpdateDate(event) {
    this.ratePerDay = 0;
    const endDate = new Date(event.end);
    endDate.setHours(0, 0, 0, 0);
    this.toDate = event.end == undefined ? event.end : endDate;
    if (this.toDate != undefined) {
      this.toDate.setDate(this.toDate.getDate() + 1);
    }
    const startDate = new Date(event.start);
    startDate.setHours(0, 0, 0, 0);
    this.fromDate = event.start == undefined ? event.start : startDate;
    this.calculateAmount();
  }

  calculateAmount() {
    if (this.toDate == null) {
      this.dateError = true;
    } else {
      this.dateError = false;
      if (this.fromDate != null) {
        if (this.bookForm.value.pickUpdate == null) {
          this.isSubmitted = true;
        } else {
          this.isSubmitted = false;
          this.fromDate.setHours(this.hours);
          this.fromDate.setMinutes(this.minutes);
          this.fromDate.setSeconds(0);
          this.toDate.setHours(this.hours);
          this.toDate.setMinutes(this.minutes);
          this.toDate.setSeconds(0);
          this.pickupDateTime = this.fromDate;
          this.bookForm.controls['qty'].setValue(1);
        }

        const oneDay = 24 * 60 * 60 * 1000; // Milliseconds in a day
        this.duration = Math.round((this.toDate - this.fromDate) / oneDay + 1);
        this.duration = Number(this.duration) - 1;
        if (this.duration >= 1 && this.duration <= 2) {
          this.ratePerDay = this.duration * this.oneDayDiscAmt;
        } else if (this.duration >= 3 && this.duration <= 4) {
          this.ratePerDay = this.duration * this.fourdayAmtDisc;
        } else if (this.duration >= 5 && this.duration <= 7) {
          this.ratePerDay = this.duration * this.seveendayAmtDisc;
        } else if (this.duration > 7) {
          this.ratePerDay = this.duration * this.seveenDaysMoreDisc;
        }
        this.ratePerDayCopy = this.ratePerDay;
        this.availableStockData = [];
        this.selectedModel.forEach((x, i) => {
          this.commonSrvc.getAvailableQuantity(this.finalProductData.id,this.finalProductData.productId,this.fromDate, this.toDate,x.modelId).then((availableQty) => {
            x.availableQty = availableQty;
            x.rentalQty;
            if (availableQty <= 0) {
              this.availableQtyError = true;
            }
            this.qtyCalculate();
          })
            .catch((error) => {
              this.showConfirmationMessage('User Added Failed');
            });

        });
        this.isProductBtnSubmitted = true;
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
      this.modelData
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
  selecteQty(event) {
    this.rentalQty = Number(event[0].value);
    this.ratePerDay = this.ratePerDayCopy * this.rentalQty;
    this.advanceAmt = this.advanceAmtCopy * this.rentalQty;
    this.qtyCalculate();
  }

  qtyCalculate() {
    this.availableQtyErrorMsg = "";
    this.selectedModel.forEach((x, i) => {
      x.rentalQty = this.rentalQty;
      const comma = i >= 1 ? ",\n" : "Available Qty-";
      this.availableQtyErrorMsg = this.availableQtyErrorMsg.concat(`${comma}(${(x.modelName).substr(0, 18)} - ${x.availableQty} Qty)`)
      if (this.rentalQty > x.availableQty) {
        this.availableQtyError = true;
        this.isProductBtnSubmitted = true;
      }
      else {
        this.availableQtyError = false;
        this.isProductBtnSubmitted = false;
      }
    });
    if (this.selectedModel.some(item => this.rentalQty > item.availableQty)) {
      this.availableQtyError = true;
      this.isProductBtnSubmitted = true;
    } else {
      this.availableQtyError = false;
      this.isProductBtnSubmitted = false;
    }
  }
  createOrders() {
    // Call createOrder method with the amount
    this.isBtnSubmitted = true;
    this.isSubmitted = true;
    this.spinner.show();
    if (this.advanceAmt > 0 && this.bookForm.valid && this.loggedUser?.email != null && this.loggedUser != null && this.pickupDateTime != null) {
      this.isSubmitted = false;
      this.bookNowBtnError = false;
      this.commonSrvc.getById('credentials', 'razorpay').subscribe(params => {
        const orderAmountInPaisa = Number(this.advanceAmt) * 100;
        this.commonSrvc.createOrder(orderAmountInPaisa).subscribe(
          response => {
            this.createdOrder = response;
            var options = {
              "key": params.keyId, // Enter the Key ID generated from the Dashboard
              "amount": response.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
              "currency": "INR",
              "name": "Dindigul Camera Rental", //your business name
              "description": `${this.finalProductData.productName} - ${this.selectedModelName}`,
              "image": "https://example.com/your_logo",
              "send_sms_hash": true,
              "order_id": response.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
              "handler": this.paymentSuccessHandler.bind(this),
              "modal": {
                escape: false,
                "ondismiss": this.dismissHandler.bind(this)
              },
              "prefill": { //We recommend using the prefill parameter to auto-fill customer's contact information especially their phone number
                "name": this.loggedUser.username, //your customer's name
                "email": this.loggedUser.email,
                "contact": this.loggedUser.mobile //Provide the customer's phone number for better conversion rates
              },
              "notes": {
                "address": "Razorpay Corporate Office"
              },
              "theme": {
                "color": "#225dd2"
              }
            };
            var rzp1 = new this.commonSrvc.nativeWindow.Razorpay(options);
            this.spinner.hide();
            rzp1.open();
          },
          error => {
            this.spinner.hide();
            console.error('Error creating order:', error);

          }
        );
      });
    } else {
      if (this.loggedUser?.email == null || this.loggedUser == null) {
        this.showConfirmationMessage("Please Login First Then Book")
      }
      this.spinner.hide();
      this.isBtnSubmitted = false;
      this.bookNowBtnError = true;
    }
  }
  paymentSuccessHandler(response: any) {

    this.commonSrvc.getPaymentDetail(response.razorpay_payment_id)
      .then((payment) => {
        this.paymentDetails = payment.payment;
        this.commonSrvc.getOrderDetail(response.razorpay_order_id)
          .then((orderDetails) => {
            this.isBtnSubmitted = false;
            this.paymentSuccess = true;
            this.bookingData = {
              "booking_id": orderDetails.order.id,
              "booking_date": new Date(),
              "customer_name": this.loggedUser.username,
              "customer_email": this.loggedUser.email,
              "customer_phone": this.loggedUser.mobile,
              "pickup_dateTime": this.pickupDateTime,
              "booking_start_date": this.fromDate,
              "booking_end_date": this.toDate,
              "pickup_time": this.pickupDateTime,
              "total_amount": this.ratePerDay,
              "paid_amount": this.paymentDetails.amount,
              "payment_status": orderDetails.order.status,
              "payment_method": this.paymentDetails.method,
              "payment_details": this.paymentDetails,
              "order_details": orderDetails.order,
              "locationDet": this.bookForm.value.location,
              "notes": this.bookForm.value.notes,
              "tenant": "01",
              "created_by": this.loggedUser.username,
              "created_date": new Date(),
              "product_img": this.finalProductData.imageurl,
              "product_name": this.finalProductData.productName,
              "product_Id": this.finalProductData.productId,
              "product_Item_Id": this.finalProductData.id,
              "product_model": this.selectedModel,
              "availability_status": true,
              "product_status": "Booked"
            }
            this.paymentDetails = this.bookingData;
            this.commonSrvc.createwithUid("orderDetails", orderDetails.order.id, this.bookingData).then((result) => {
              this.sendEmail();
              this.commonSrvc.placeOrder(this.finalProductData.id, this.bookingData)
                .then(() =>
                console.log('Order placed successfully')
                )
                .catch(error =>
                  console.error('Error placing order:', error)
                );
              this.popupAlert = true;
              setTimeout(() => {
                this.popupAlert = true;
              }, 4000);
            }).catch((err) => {
              this.popupAlert = true;
              setTimeout(() => {
                this.popupAlert = true;
              }, 4000);
            });

          }).catch((err) => {

          });

      }).catch((err) => {

      });


    //   "payment": {
    //     "id": "pay_NqfKxjIqegpZEG",
    //     "entity": "payment",
    //     "amount": 102,
    //     "currency": "INR",
    //     "status": "captured",
    //     "order_id": "order_NqfJwLrm15uKE4",
    //     "invoice_id": null,
    //     "international": false,
    //     "method": "upi",
    //     "amount_refunded": 0,
    //     "refund_status": null,
    //     "captured": true,
    //     "description": "Test Transaction",
    //     "card_id": null,
    //     "bank": null,
    //     "wallet": null,
    //     "vpa": "rajamanihari19-4@okicici",
    //     "email": "rajamni@gmail.com",
    //     "contact": "+917904998687",
    //     "notes": {
    //         "address": "Razorpay Corporate Office"
    //     },
    //     "fee": 2,
    //     "tax": 0,
    //     "error_code": null,
    //     "error_description": null,
    //     "error_source": null,
    //     "error_step": null,
    //     "error_reason": null,
    //     "acquirer_data": {
    //         "rrn": "408557356694",
    //         "upi_transaction_id": "ICIc03945a869e4492da55269217a11026a"
    //     },
    //     "created_at": 1711386653,
    //     "provider": null,
    //     "upi": {
    //         "payer_account_type": "bank_account",
    //         "vpa": "rajamanihari19-4@okicici"
    //     },
    //     "reward": null
    // }



    //     razorpay_order_id: "order_NqfJwLrm15uKE4"
    // razorpay_payment_id: "pay_NqfKxjIqegpZEG"
    // razorpay_signature: "0a75818ac1f2402376181f0d2691aaa22285c0e7fb3291452fcbe63e5d3bda0b"

    this.spinner.hide();

  }
  stockReduce() {
    // this.commonSrvc.getDocumentById("products", this.finalProductData.id).then(async (data) => {
    //   var availQty = data.availableQty;

    //   await this.commonSrvc.updateField("products", this.finalProductData.id, "availableQty", (Number(availQty) - Number(this.bookForm.value.qty))).then((data) => {
    //   })
    //     .catch((error) => {
    //     });

    //   data.modelDet.forEach(async (e, i) => {
    //     e.availableQty-=Number(this.bookForm.value.qty);
    //     var newArray = e;
    //     await this.commonSrvc.updateSpecificArray("products", this.finalProductData.id, i,"modelDet", newArray).then((data) => {

    //     })
    //       .catch((error) => {
    //       });
    //       await this.delay(5 * 1000);
    //   });
    // })
    //   .catch((error) => {

    //   });





  }

  private delay(ms: number): Promise<void> {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
  }
  dismissHandler() {

    this.commonSrvc.getOrderDetail(this.createdOrder.id)
      .then((orderDetails) => {
        this.isBtnSubmitted = false;
        this.paymentSuccess = true;

        this.bookingData = {
          "booking_id": orderDetails.order.id,
          "booking_date": new Date(),
          "customer_name": this.loggedUser.username,
          "customer_email": this.loggedUser.email,
          "customer_phone": this.loggedUser.mobile,
          "pickup_dateTime": this.pickupDateTime,
          "booking_start_date": this.fromDate,
          "booking_end_date": this.toDate,
          "pickup_time": this.toDate,
          "total_amount": this.ratePerDay,
          "paid_amount": orderDetails.order.amount_paid,
          "payment_status": orderDetails.order.status,
          "payment_method": orderDetails.order.status,
          "payment_details": 'undefined',
          "order_details": orderDetails.order,
          "locationDet": this.bookForm.value.location,
          "notes": this.bookForm.value.notes,
          "tenant": "01",
          "created_by": this.loggedUser.username,
          "created_date": new Date(),
          "product_name": this.finalProductData.productName,
          "product_model": this.selectedModel,
          "product_img": this.finalProductData.imageurl,
          "availability_status": true,
          "product_status": "Order Not Placed"
        }
        this.paymentDetails = this.bookingData;
        this.commonSrvc.createwithUid("orderDetails", orderDetails.order.id, this.bookingData).then((result) => {
          this.popupAlert = true;
          setTimeout(() => {
            this.popupAlert = true;
          }, 4000);
        }).catch((err) => {
          console.log(err);

          this.popupAlert = true;
          setTimeout(() => {
            this.popupAlert = true;
          }, 4000);
        });
        //   "order": {
        //     "id": "order_NqfJwLrm15uKE4",
        //     "entity": "order",
        //     "amount": 100,
        //     "amount_paid": 102,
        //     "amount_due": -2,
        //     "currency": "INR",
        //     "receipt": "order_rcptid_11",
        //     "offer_id": null,
        //     "status": "paid",
        //     "attempts": 1,
        //     "notes": [],
        //     "created_at": 1711386594
        // }
      }).catch((err) => {

      });
    this.popupMessage = 'Payement Canceled';



  }

  sendEmail() {
    const emailData = {
      to: this.bookingData?.customer_email,
      subject: 'Successfully Booked - 📸Dindigul Camara Rental🎥',
      text: `

               Welcome to 📸Dindigul Camara Rental🎥

           📸We Provide Rentals For Camera & Accessories

      Follow Insta - https://www.instagram.com/dindigul_camera_rental

                    📲 Contact - 7904998687

      Hi ${this.bookingData.customer_name}!,

      <p><u>RENTAL BOOKED RECEIPT</u></p>
      Name                : ${this.bookingData.customer_name}
      Mobile              : ${this.bookingData.customer_mobile}
      booked Date         : ${moment(this.bookingData.booking_date).format('YYYY-MM-DD HH:mm:ss')}
      Pickup Date & Time  : ${moment(this.bookingData.pickup_dateTime).format('YYYY-MM-DD HH:mm:ss')}
      Rental Start Date   : ${moment(this.bookingData.booking_start_date).format('YYYY-MM-DD')}
      Rental End Date     : ${moment(this.bookingData.booking_end_date).format('YYYY-MM-DD')}
      Total Rental Amount : Rs.${this.bookingData.total_amount}
      Paid Amount         : Rs.${this.bookingData.paid_amount}
      Pending Due Amount  : Rs.${Number(this.bookingData.total_amount) - Number(this.bookingData.paid_amount)}
      Payment Status      : ${this.bookingData.customer_mobile}
      Payment Mode        : ${this.bookingData.customer_mobile}

      ---------------------------------------------

      Click Login and View Our Page and More details & Offers ( Online Booking ):
      https://dindigulcamara.web.app/

      ---------------------------------------------

      ♥️Thanks For Renting With us🙏🏻`
    };

    this.commonSrvc.sendEmail(emailData).subscribe(
      response => {
        console.log(response);
        this.showConfirmationMessage("We Sent Booked Receipt to Your Mail Check Now");
        // Handle success response
      },
      error => {
        console.log(error);
        this.showConfirmationMessage("Your Given Mail is Invalid Please Give Orginal Mail");
        // Handle error response
      }
    );
  }
  paymentAfterCall() {
    this.paymentSuccess = false;
    this.display = 'none';
    this.myOrders = true;
  }

  myOrderClose() {
    this.myOrders = false
    window.location.reload();
  }

  showBookPopup() {
    this.isBtnSubmitted = true;
    this.isSubmitted = true;
    if (this.advanceAmt > 0 && this.bookForm.valid && this.loggedUser?.email != null && this.loggedUser != null) {
      this.display = 'block'
    } else {
      if (this.loggedUser?.email == null || this.loggedUser == null) {
        this.showConfirmationMessage("Please Login First Then Book")
      }
      this.spinner.hide();
      this.isBtnSubmitted = false;
      this.bookNowBtnError = true;
    }
  }


  showConfirmationMessage(message: string): void {
    this.popupMessage = message;
    this.popupAlert = true;
    setTimeout(() => {
      this.popupAlert = false;
    }, 3000); // Clear message after 3 seconds
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

}
