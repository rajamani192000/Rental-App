import { AdminService } from './../../service/admin.service';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GoogleAuthProvider } from "firebase/auth";
import { userInfo } from 'os';
import { UserData } from '../../../@core/data/users';
import { CommonService } from '../../service/common-service.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'ngx-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showPassword: boolean = false;
  currentUser: any;
  success: boolean = false;
  faild: any;
  popupMessage: string;
  popupAalert: boolean;
  logedInUser: any;
  protected readonly unsubscribe$ = new Subject<void>();
  uid: any;
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

  }

  login() {
    this.adminSrvc.signInWithEmailAndPassword(this.loginForm.value.email, this.loginForm.value.password)
      .then((result) => {
        this.uid = result.user.uid;
        var isNewUser = result.additionalUserInfo.isNewUser;
        if (isNewUser) {
          this.showConfirmationMessage("You Are Not authorized")
          result.user.delete();
        } else {
          this.showConfirmationMessage("Logged In Successfully")
          setTimeout(() => {
            this.router.navigateByUrl('/theme', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/pages/admin/dashboard']);
            });

          }, 3001);
        }
      })
      .catch((error: any) => {
        this.showConfirmationMessage("You Are Not authorized")
      });
  }

  googleLogin() {

    this.adminSrvc.signInWithGoogle().then((UserCredential) => {
      this.uid = UserCredential.user.uid;
      var isNewUser = UserCredential.additionalUserInfo.isNewUser;
      if (isNewUser) {
        this.showConfirmationMessage("You Are Not authorized")
        UserCredential.user.delete();
      } else {
        this.showConfirmationMessage("Logged In Successfully")
        this.getCurrentUser();
        setTimeout(() => {
          this.router.navigateByUrl('/theme', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/pages/admin/dashboard']);
          });
        }, 3001);
      }
    }).catch((error) => {
      this.showConfirmationMessage("Log In Failed");
    });

  }


  getCurrentUser() {
    if (this.uid) {
      this.commonSrvc.getById('Admin', this.uid)
        .subscribe((data) => {
          if (data != null && data != undefined) {
            this.logedInUser = data;
            const jsonData = JSON.stringify(this.logedInUser);
            localStorage.setItem('currentUser', jsonData);
          }
        });
    } else {
      // Handle the case when this.uid is not defined
      console.error("User ID is not defined");
    }
  }

  showConfirmationMessage(message: string): void {
    this.popupMessage = message;
    this.popupAalert = true;
    setTimeout(() => {
      this.popupAalert = false;
    }, 3000); // Clear message after 3 seconds
  }



}
