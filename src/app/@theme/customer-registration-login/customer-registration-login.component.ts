
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GoogleAuthProvider } from "firebase/auth";
import { userInfo } from 'os';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NbTabComponent, NbTabsetComponent } from '@nebular/theme';
import { AdminService } from '../../pages/service/admin.service';
import { UserData } from '../../@core/data/users';
import { CommonService } from '../../pages/service/common-service.service';

@Component({
  selector: 'ngx-customer-registration-login',
  templateUrl: './customer-registration-login.component.html',
  styleUrls: ['./customer-registration-login.component.scss']
})
export class CustomerRegistrationLoginComponent implements OnInit {
  loginForm: FormGroup;
  registerForm: FormGroup;
  showPassword: boolean = false;
  currentUser: any;
  success: boolean = false;
  faild: any;
  popupMessage: string;
  popupAlert: boolean = false;
  logedInUser: any;
  @ViewChild("tabSetRef") tabSetRef: NbTabsetComponent;
  @ViewChild("loginTab") loginTab: NbTabComponent;
  @ViewChild("issueTab") signupTab: NbTabComponent;
  protected readonly unsubscribe$ = new Subject<void>();
  uid: any;
  isSubmitted: boolean;
  isBtnSubmitted: boolean;
  selectedFile: File;
  selectedFileUrl: string | ArrayBuffer;
  data: { uid: string; username: any; email: any; password: any; role: string; mobile: any; last_login_timestamp: Date; tenantId: any; createdby: any; status: boolean; imageUrl: any; createdDate: Date; };
  currentPath: string;
  constructor(private fb: FormBuilder,
    private router: Router,
    private afAuth: AngularFireAuth,
    public firestore: AngularFirestore,
    private userService: UserData, private cdr: ChangeDetectorRef, private adminSrvc: AdminService, private commonSrvc: CommonService) {

  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: [null, [Validators.required]],
      password: [null, Validators.required],
    });
    this.registerForm = this.fb.group({
      name: [null, [Validators.required]],
      email: [null, [Validators.required]],
      phone: [null, Validators.required],
      password: [null, Validators.required],
      confirmPassword: [null, Validators.required],
      imageUrl: [null]
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.registerForm.patchValue({ image: file });
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.selectedFileUrl = reader.result;
        this.registerForm.controls['imageUrl'].setValue(this.selectedFileUrl);
      };
    }
  }

  signUpCus() {
    this.isSubmitted = true;
    this.isBtnSubmitted = true;
    if (this.registerForm.valid && this.selectedFile != undefined) {
      this.adminSrvc.uploadImageGetUrl(this.registerForm.value.name, this.selectedFile).subscribe(
        imageUrl => {
          if (!imageUrl) {
            this.showConfirmationMessage('Customer Signup Failed');
            return;
          }
          this.adminSrvc.signUpWithEmailAndPassword(this.registerForm.value.email, this.registerForm.value.password)
            .then((userCredential) => {
              this.data = {
                "uid": userCredential.user.uid,
                "username": this.registerForm.value.name,
                "email": this.registerForm.value.email,
                "password": this.registerForm.value.password,
                "role": "customer",
                "mobile": this.registerForm.value.phone,
                "last_login_timestamp": new Date(),
                "tenantId": "01",
                "createdby": this.registerForm.value.name,
                "status": true,
                "imageUrl": imageUrl,
                "createdDate": new Date(),
              }
              this.adminSrvc.addUserToAdminCollection('customer', userCredential.user.uid, this.data)
                .then(() => {
                  this.selectedFile = null;
                  this.selectedFileUrl = null;
                  this.sendEmail()
                  this.showConfirmationMessage('Customer Signup successfully');
                  setTimeout(() => {
                    this.loginForm.controls["email"].setValue(this.data.email);
                    this.loginForm.controls["password"].setValue(this.data.password);
                    this.loginCus()
                  }, 3001);
                })
                .catch((error) => {
                  this.showConfirmationMessage('Customer Signup Failed');
                });
              this.registerForm.reset();
              // You can perform further actions here, such as redirecting the user to a different page
            })
            .catch((error) => {
              // Handle errors
            });
        },
        error => {
          console.error('Error uploading image:', error);
        }
      );
    } else if (this.registerForm.valid && this.selectedFile == undefined) {
      this.adminSrvc.signUpWithEmailAndPassword(this.registerForm.value.email, this.registerForm.value.password)
        .then((userCredential) => {
          this.data = {
            "uid": userCredential.user.uid,
            "username": this.registerForm.value.name,
            "email": this.registerForm.value.email,
            "password": this.registerForm.value.password,
            "role": "customer",
            "mobile": this.registerForm.value.phone,
            "last_login_timestamp": new Date(),
            "tenantId": "01",
            "createdby": this.registerForm.value.name,
            "status": true,
            "imageUrl": "undefined",
            "createdDate": new Date(),
          }
          this.adminSrvc.addUserToAdminCollection('customer', this.data.uid, this.data)
            .then(() => {
              this.selectedFile = null;
              this.selectedFileUrl = null;
              this.sendEmail()
              this.showConfirmationMessage('Customer Signup successfully');
              setTimeout(() => {
                this.loginForm.controls["email"].setValue(this.data.email);
                this.loginForm.controls["password"].setValue(this.data.password);
                this.loginCus()
              }, 3001);
            })
            .catch((error) => {
              this.showConfirmationMessage('Customer Signup Failed');
            });
          this.registerForm.reset();
        })
        .catch((error) => {
          // Handle errors
        });
    }
    else {
      this.isBtnSubmitted = false;
    }
  }

  sendEmail() {
    const emailData = {
      to: this.data.email,
      subject: 'Welcome to 📸Dindigul Camara Rental🎥 - Successfully Registered',
      text: `
      Hi ${this.data.username}!,

      Your Credential
      Email: ${this.data.email}
      Password: ${this.data.password}

      ---------------------------------------------

      Welcome to 📸Dindigul Camara Rental🎥

      📸We Provide Rentals For Camera & Accessories

      Follow Insta - https://www.instagram.com/dindigul_camera_rental

      📲 Contact - 7904998687 & 9566763537

      ---------------------------------------------

      Click Login and View Our Page and More details & Offers ( Online Booking ):
      https://dindigulcamara.web.app/

      ---------------------------------------------

      ♥️Thanks For Renting With us🙏🏻`
    };

    this.commonSrvc.sendEmail(emailData).subscribe(
      response => {
        console.log(response);
        this.showConfirmationMessage("We Sent Login Details to You Mail");
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

  loginCus() {
    if (this.loginForm.valid) {
      this.adminSrvc.signInWithEmailAndPassword(this.loginForm.value.email, this.loginForm.value.password)
        .then((result) => {
          this.uid = result.user.uid;
          var isNewUser = result.additionalUserInfo.isNewUser;
          if (isNewUser) {
            this.showConfirmationMessage("You Are Not authorized. Please SignUp")
            result.user.delete();
          } else {
            this.getCurrentUser();
            this.showConfirmationMessage("Logged In Successfully")
          }
        })
        .catch((error: any) => {
          this.showConfirmationMessage("You Are Not authorized")
        });
    }
  }

  googleLogin() {

    this.adminSrvc.signUpWithGoogle().then((UserCredential) => {
      this.uid = UserCredential.user.uid;
      var isNewUser = UserCredential.additionalUserInfo.isNewUser;
      if (isNewUser) {
        this.showConfirmationMessage("You Are Not authorized, Please SignUp")
        UserCredential.user.delete();
      } else {
        this.showConfirmationMessage("Logged In Successfully")
        this.getCurrentUser();
      }
    }).catch((error) => {
      this.showConfirmationMessage("Log In Failed");
    });

  }


  getCurrentUser() {
    if (this.uid) {
      this.commonSrvc.getById('customer', this.uid)
        .subscribe((data) => {
          if (data != null && data != undefined) {
            this.logedInUser = data;
            const jsonData = JSON.stringify(this.logedInUser);
            localStorage.setItem('currentUser', jsonData);
            this.router.navigateByUrl('/theme', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/pages/rental/camHome']);
            });
          }
        });
    } else {
      // Handle the case when this.uid is not defined
      console.error("User ID is not defined");
    }
  }


  get fval(): { [key: string]: AbstractControl } {
    return this.registerForm.controls;
  }
  get dval(): { [key: string]: AbstractControl } {
    return this.loginForm.controls;
  }
}
