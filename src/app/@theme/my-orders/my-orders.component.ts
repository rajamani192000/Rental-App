import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import * as moment from 'moment';
import { CommonService } from '../../pages/service/common-service.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'ngx-my-orders',
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.scss']
})
export class MyOrdersComponent implements OnInit {
  isAddComponnet: boolean;
  isEditComponnet: boolean;
  loggedUser: any;
  ordersData: any[];
  viewOrderDet: any;
  isBtnSubmitted: boolean;
  bookNowBtnError: boolean;
  isSubmitted: boolean;
  paymentDetails: any;
  paymentSuccess: boolean;
  bookingData: any;
  popupAlert: boolean;
  popupMessage: string;
  paidAmount: number;
  cancelOrderPopup: boolean = false;
  dueAmtPopup: boolean = false;
  orderEditComp: boolean = false;
  duePaymentData: any = null;
  createdOrder: any;
  editForm: FormGroup;
  ratePerDay: number;
  toDate: any;
  fromDate: any;
  dateError: boolean;
  pickupDateTime: any;
  minutes: any;
  hours: any;
  duration: number;
  constructor(private commonSrvc: CommonService, private fb: FormBuilder, private spinner: NgxSpinnerService) {
    // Example Firebase timestamp
  }


  ngOnInit() {
    this.editForm = this.fb.group({
      location: [null, [Validators.required]],
      date: [null, [Validators.required]],
      pickUpdate: [null, [Validators.required]]
    });
    this.editForm.get('date').valueChanges.subscribe(changes => {
      this.rentPriceUpdateDate(changes);
    });
    this.spinner.show()
    this.isAddComponnet = true;
    this.isEditComponnet = false;
    this.commonSrvc.getLoginDetailFromLocalStorage()
      .subscribe(data => {
        this.loggedUser = data == undefined ? null : data;
        this.getOrderDetials();
      });
  }

  callChangeRentalDate(){
    this.orderEditComp=true;
    this.isAddComponnet=false;
    this.isEditComponnet=false;
  }

  goBackEditComp(){
    this.orderEditComp=false;
    this.isAddComponnet=false;
    this.isEditComponnet=true;
  }
  getOrderDetials() {

    this.commonSrvc.list("orderDetails").subscribe((data: any[]) => {
      this.ordersData = data.filter(item => item.customer_phone.includes(this.loggedUser.mobile));
    });

    this.spinner.hide()
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

  timeChange(event) {
    var currentDate = event.value;
    this.pickupDateTime = null;
    // Extracting time from the Date object
    this.hours = currentDate.getHours();
    this.minutes = currentDate.getMinutes();
    this.calculateAmount();
  }
  searchInNewTab(locationUrl): void {
    if (locationUrl) {// Encode URL for search query
      window.open(locationUrl, '_blank');
    }
  }
  calculateAmount() {
    if (this.toDate == null) {
      this.dateError = true;
    } else {
      this.dateError = false;
      if (this.fromDate != null) {
        if (this.editForm.value.pickUpdate == null) {
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
          this.editForm.controls['qty'].setValue(1);
        }
        const oneDay = 24 * 60 * 60 * 1000; // Milliseconds in a day
        this.duration = Math.round((this.toDate - this.fromDate) / oneDay + 1);
        this.duration = Number(this.duration) - 1;

      }
    }

  }

  viewOrder(data) {
    this.isAddComponnet = false;
    this.isEditComponnet = true;
    this.viewOrderDet = data;
    this.paidAmount = Number(data.paid_amount) / 100
  }
  goBack() {
    this.isAddComponnet = true;
    this.isEditComponnet = false;
  }


  paymentRetry() {
    // Call createOrder method with the amount
    this.isBtnSubmitted = true;
    this.isSubmitted = true;
    this.spinner.show();
    if (this.viewOrderDet?.payment_status !== "paid" && this.loggedUser != null) {
      this.isSubmitted = false;
      this.bookNowBtnError = false;
      this.commonSrvc.getById('credentials', 'razorpay').subscribe(params => {
        var options = {
          "key": params.keyId, // Enter the Key ID generated from the Dashboard
          "amount": this.viewOrderDet.order_details.amount_due, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
          "currency": "INR",
          "name": "Dindigul Camera Rental", //your business name
          "description": `${this.viewOrderDet.product_name} - ${this.viewOrderDet.product_model}`,
          "image": "https://example.com/your_logo",
          "send_sms_hash": true,
          "order_id": this.viewOrderDet.order_details.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
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
              "pickup_dateTime": this.viewOrderDet.pickup_dateTime,
              "booking_start_date": this.viewOrderDet.booking_start_date,
              "booking_end_date": this.viewOrderDet.booking_end_date,
              "pickup_time": this.viewOrderDet.pickup_time,
              "total_amount": this.viewOrderDet.total_amount,
              "paid_amount": this.paymentDetails.amount,
              "payment_status": orderDetails.order.status,
              "payment_method": this.paymentDetails.method,
              "payment_details": this.paymentDetails,
              "order_details": orderDetails.order,
              "notes": this.viewOrderDet.notes,
              "tenant": this.viewOrderDet.tenant,
              "created_by": this.loggedUser.username,
              "created_date": new Date(),
              "product_img": this.viewOrderDet.product_img,
              "product_name": this.viewOrderDet.product_name,
              "product_model": this.viewOrderDet.product_model,
              "availability_status": true,
              "product_status": "Booked"
            }
            this.paymentDetails = this.bookingData;
            this.commonSrvc.createwithUid("orderDetails", orderDetails.order.id, this.bookingData).then((result) => {
              this.sendEmail(this.bookingData);
              this.commonSrvc.placeOrder(this.viewOrderDet.id, this.bookingData)
                .then(() => console.log('Order placed successfully'))
                .catch(error => console.error('Error placing order:', error));
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

  dismissHandler() {

    this.commonSrvc.getOrderDetail(this.viewOrderDet.order_details.id)
      .then((orderDetails) => {
        this.isBtnSubmitted = false;
        this.paymentSuccess = true;

        this.bookingData = {
          "booking_id": orderDetails.order.id,
          "booking_date": new Date(),
          "customer_name": this.loggedUser.username,
          "customer_email": this.loggedUser.email,
          "customer_phone": this.loggedUser.mobile,
          "pickup_dateTime": this.viewOrderDet.pickup_dateTime,
          "booking_start_date": this.viewOrderDet.booking_start_date,
          "booking_end_date": this.viewOrderDet.booking_end_date,
          "pickup_time": this.viewOrderDet.pickup_time,
          "total_amount": this.viewOrderDet.total_amount,
          "paid_amount": orderDetails.order.amount_paid,
          "payment_status": orderDetails.order.status,
          "payment_method": orderDetails.order.status,
          "payment_details": 'undefined',
          "order_details": orderDetails.order,
          "notes": this.viewOrderDet.notes,
          "tenant": "01",
          "created_by": this.loggedUser.username,
          "created_date": new Date(),
          "product_name": this.viewOrderDet.product_name,
          "product_model": this.viewOrderDet.product_model,
          "product_img": this.viewOrderDet.product_img,
          "availability_status": true,
          "product_status": "Order Not Placed"
        }
        this.paymentDetails = this.bookingData;
        this.commonSrvc.update("orderDetails", orderDetails.order.id, this.bookingData).then((result) => {
          this.popupAlert = true;
          this.getOrderDetials();
          setTimeout(() => {
            this.popupAlert = true;
          }, 4000);
        }).catch((err) => {
          console.log(err);
          this.popupMessage = 'Payement Canceled';
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
        this.popupAlert = true;
        setTimeout(() => {
          this.popupAlert = true;
        }, 4000);
      });
  }
  cancalOrder() {
    this.commonSrvc.cancelOrder(this.viewOrderDet.product_Item_Id, this.viewOrderDet).then((result) => {
      if (result === 'Order canceled successfully') {
        this.commonSrvc.updateField("orderDetails", this.viewOrderDet.booking_id, "product_status", "Cancelled").then((data) => {
          this.showConfirmationMessage(result)
          this.getOrderDetials();
          this.cancelOrderPopup = false;
        }).catch((err) => {
          this.showConfirmationMessage("Order canceled Failed")
        });
      }
    }).catch((err) => {
    });
  }


  payDueAmt() {

    // Call createOrder method with the amount
    this.isBtnSubmitted = true;
    this.isSubmitted = true;
    this.spinner.show();
    if (this.viewOrderDet?.payment_status === "paid" && this.loggedUser != null) {
      // const dueAmt = Number(this.viewOrderDet.total_amount) - Number(this.paidAmount) / 100;
      const dueAmt = 100;
      this.isSubmitted = false;
      this.bookNowBtnError = false;
      this.commonSrvc.getById('credentials', 'razorpay').subscribe(params => {
        const orderAmountInPaisa = Number(Number(this.viewOrderDet?.total_amount)-Number(this.paidAmount)) * 100;
        this.commonSrvc.createOrder(orderAmountInPaisa).subscribe(
          response => {
            this.createdOrder = response;
            var options = {
              "key": params.keyId, // Enter the Key ID generated from the Dashboard
              "amount": response.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
              "currency": "INR",
              "name": "Dindigul Camera Rental", //your business name
              "description": `${this.viewOrderDet.product_name} - ${this.viewOrderDet.product_model}`,
              "image": "https://example.com/your_logo",
              "send_sms_hash": true,
              "order_id": response.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
              "handler": this.duepaymentSuccessHandler.bind(this),
              "modal": {
                escape: false,
                "ondismiss": this.duedismissHandler.bind(this)
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

  duepaymentSuccessHandler(response) {
    this.commonSrvc.getPaymentDetail(response.razorpay_payment_id)
      .then((payment) => {
        this.paymentDetails = payment.payment;
        this.commonSrvc.getOrderDetail(response.razorpay_order_id)
          .then((orderDetails) => {
            this.isBtnSubmitted = false;
            this.duePaymentData = {
              "booking_id": orderDetails.order.id,
              "booking_date": new Date(),
              "customer_name": this.loggedUser.username,
              "customer_email": this.loggedUser.email,
              "customer_phone": this.loggedUser.mobile,
              "pickup_dateTime": this.viewOrderDet.pickup_dateTime,
              "booking_start_date": this.viewOrderDet.booking_start_date,
              "booking_end_date": this.viewOrderDet.booking_end_date,
              "pickup_time": this.viewOrderDet.pickup_time,
              "total_amount": this.viewOrderDet.total_amount,
              "paid_amount": this.paymentDetails.amount,
              "payment_status": orderDetails.order.status,
              "payment_method": this.paymentDetails.method,
              "parent_order_Id": this.viewOrderDet.booking_id,
              "payment_details": this.paymentDetails,
              "order_details": orderDetails.order,
              "notes": this.viewOrderDet.notes,
              "tenant": this.viewOrderDet.tenant,
              "created_by": this.loggedUser.username,
              "created_date": new Date(),
              "product_img": this.viewOrderDet.product_img,
              "product_name": this.viewOrderDet.product_name,
              "product_model": this.viewOrderDet.product_model,
              "availability_status": true,
              "product_status": this.viewOrderDet.product_status
            }
            this.commonSrvc.createwithUid("duePaymentDetails", orderDetails.order.id, this.duePaymentData).then((result) => {
              this.sendEmail(this.duePaymentData);
              this.paidAmount += Number(this.duePaymentData.paid_amount) / 100;
              const paidAmountInPaisa = Number(this.paidAmount) * 100;
              this.commonSrvc.updateField("orderDetails", this.viewOrderDet.booking_id, "paid_amount", paidAmountInPaisa)
                .then(() =>
                  console.log('Due Amount Paid SuccessFully')
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
  }

  duedismissHandler() {
    this.commonSrvc.getOrderDetail(this.createdOrder.id)
      .then((orderDetails) => {
        this.isBtnSubmitted = false;
        this.duePaymentData = {
          "booking_id": orderDetails.order.id,
          "booking_date": new Date(),
          "customer_name": this.loggedUser.username,
          "customer_email": this.loggedUser.email,
          "customer_phone": this.loggedUser.mobile,
          "pickup_dateTime": this.viewOrderDet.pickup_dateTime,
          "booking_start_date": this.viewOrderDet.booking_start_date,
          "booking_end_date": this.viewOrderDet.booking_end_date,
          "pickup_time": this.viewOrderDet.pickup_time,
          "total_amount": this.viewOrderDet.total_amount,
          "paid_amount": orderDetails.order.amount_paid,
          "payment_status": orderDetails.order.status,
          "payment_method": orderDetails.order.status,
          "parent_order_Id": this.viewOrderDet.booking_id,
          "payment_details": 'undefined',
          "order_details": orderDetails.order,
          "notes": this.viewOrderDet.notes,
          "tenant": "01",
          "created_by": this.loggedUser.username,
          "created_date": new Date(),
          "product_name": this.viewOrderDet.product_name,
          "product_model": this.viewOrderDet.product_model,
          "product_img": this.viewOrderDet.product_img,
          "availability_status": true,
          "product_status": this.viewOrderDet.product_status
        }
        this.paymentDetails = this.duePaymentData;
        this.commonSrvc.createwithUid("duePaymentDetails", orderDetails.order.id, this.duePaymentData).then((result) => {
          this.popupAlert = true;
          this.getOrderDetials();
          setTimeout(() => {
            this.popupAlert = true;
          }, 4000);
        }).catch((err) => {
          console.log(err);
          this.popupMessage = 'Payement Canceled';
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
        this.popupAlert = true;
        setTimeout(() => {
          this.popupAlert = true;
        }, 4000);
      });
  }
  sendEmail(data) {
    const emailData = {
      to: data.customer_email,
      subject: 'Successfully Booked - 📸Dindigul Camara Rental🎥',
      text: `

               Welcome to 📸Dindigul Camara Rental🎥

           📸We Provide Rentals For Camera & Accessories

      Follow Insta - https://www.instagram.com/dindigul_camera_rental

                    📲 Contact - 7904998687

      Hi ${data.customer_name}!,

      <p><u>RENTAL BOOKED RECEIPT</u></p>
      Name                : ${data.customer_name}
      Mobile              : ${data.customer_mobile}
      booked Date         : ${moment(data.booking_date).format('YYYY-MM-DD HH:mm:ss')}
      Pickup Date & Time  : ${moment(data.pickup_dateTime).format('YYYY-MM-DD HH:mm:ss')}
      Rental Start Date   : ${moment(data.booking_start_date).format('YYYY-MM-DD')}
      Rental End Date     : ${moment(data.booking_end_date).format('YYYY-MM-DD')}
      Total Rental Amount : Rs.${data.total_amount}
      Paid Amount         : Rs.${data.paid_amount}
      Pending Due Amount  : Rs.${Number(data.total_amount) - Number(data.paid_amount)}
      Payment Status      : ${data.customer_mobile}
      Payment Mode        : ${data.customer_mobile}

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


  showConfirmationMessage(message: string): void {
    this.popupMessage = message;
    this.popupAlert = true;
    setTimeout(() => {
      this.popupAlert = false;
    }, 3000); // Clear message after 3 seconds
  }

  onCloseHandled() {
    this.paymentSuccess = false;
    window.location.reload();
  }

}
