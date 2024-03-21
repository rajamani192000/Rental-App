import { Component, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Subject } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";
import { Location } from "@angular/common";
import { environment } from "../../../../environments/environment";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { AngularFireStorage } from "@angular/fire/compat/storage";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { Router } from "@angular/router";
import { AdminService } from "../../service/admin.service";
import { CommonService } from "../../service/common-service.service";

@Component({
  selector: 'ngx-admin-list',
  templateUrl: './admin-list.component.html',
  styleUrls: ['./admin-list.component.scss']
})
export class AdminListComponent implements OnInit {
  data: any = [];
  term: string;
  p: number = 1;
  id: number;
  statusList: any = ["Activated", "Deactivated"];
  allowClear: boolean = true;
  multiple: boolean = false;
  placeholder: string = "Select";
  isAddComponnet: boolean = false;
  isEditComponnet: boolean = false;
  isSubmitted: boolean = false;
  isBtnSubmitted: boolean = false;
  isEdit: boolean = false;
  Savemsg: boolean = false;
  isUpdateConfirmationMessage: boolean = false;
  userForm: FormGroup;

  private tenantId = localStorage.getItem("tenantId");
  private branchId = localStorage.getItem("branchId");
  private userId: number = parseInt(localStorage.getItem("userId"));
  protected readonly unsubscribe$ = new Subject<void>();
  selectedFile: File;
  selectedFileUrl: string | ArrayBuffer;
  popupAalert: boolean;
  popupMessage: string;
  adminUserData: any[];
  logedInUser: any;

  constructor(
    private fb: FormBuilder,
    public location: Location,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
    private afAuth: AngularFireAuth,
    private router: Router,
    private adminSrvc: AdminService,
    private commonSrvc: CommonService
  ) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      imageUrl: [''],
      lastLoginDate: [''],
      tenant: [''],
      createdBy: [''],
      createdDate: [''],
      mobile: ['', [Validators.pattern("^[0-9]*$")]],
      status: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.isAddComponnet = false;
    this.isEditComponnet = false;
    this.getAdminUser();
    // Retrieve the data from localStorage
    const storedData = localStorage.getItem('currentUser');
    // Parse the stored data
    this.logedInUser = storedData ? JSON.parse(storedData) : null;
  }

  addbrand() {


    // lenstlist.forEach((element,i) => {
    //   const uid = this.commonSrvc.generateUniqueID();
    //   this.commonSrvc.createwithUid("lensList",uid,element)
    //   .then(() => {
    //     this.showConfirmationMessage('brand Added successfully');
    //   })
    //   .catch((error) => {
    //     this.showConfirmationMessage('brand Added Failed');
    //   });
    // });

}

getAdminUser() {
  this.firestore
    .collection('Products')
    .valueChanges()
    .subscribe((adminUserData: any[]) => {
      this.adminUserData = adminUserData;
      // localStorage.setItem('products', JSON.stringify(this.products));
      // this.originalArray = products;
    });
}

onFileSelected(event: any) {
  const file: File = event.target.files[0];
  if (file) {
    this.selectedFile = file;
    this.userForm.patchValue({ image: file });
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.selectedFileUrl = reader.result;
      this.userForm.controls['imageUrl'].setValue(this.selectedFileUrl);
    };
  }
}



onSave() {
  this.isSubmitted = true;
  this.isBtnSubmitted = true;
  if (this.userForm.valid) {
    const formData = this.userForm.value;
    const productId = formData.email;
    let imageFile;
    this.adminSrvc.uploadImageGetUrl(formData.username, this.selectedFile).subscribe(
      imageUrl => {
        imageFile = imageUrl;

        if (!imageFile || !productId) {
          return;
        }
        this.adminSrvc.signUpWithEmailAndPassword(formData.email, formData.password)
          .then((userCredential) => {
            let data = {
              "uid": userCredential.user.uid,
              "username": formData.username,
              "email": formData.email,
              "password": formData.password,
              "role": "Admin",
              "mobile": formData.mobile,
              "last_login_timestamp": new Date(),
              "tenantId": this.logedInUser.tenantId,
              "createdby": this.logedInUser.username,
              "status": formData.status == "Activated" ? true : false,
              "imageUrl": imageFile,
              "createdDate": new Date(),
            }
            this.adminSrvc.addUserToAdminCollection('Admin', userCredential.user.uid, data)
              .then(() => {
                this.selectedFile = null;
                this.selectedFileUrl = null;
                this.goback();
                this.showConfirmationMessage('User Added successfully');
              })
              .catch((error) => {
                this.showConfirmationMessage('User Added Failed');
              });
            this.userForm.reset();
            // You can perform further actions here, such as redirecting the user to a different page
          })
          .catch((error) => {
            // Handle errors
            console.log('Error signing up with email and password:', error);
          });
      },
      error => {
        console.error('Error uploading image:', error);
      }
    );
  } else {
    this.isBtnSubmitted = false;
  }
}


signUpGoogle() {
  this.isSubmitted = true;
  this.isBtnSubmitted = true;
  if (this.userForm.valid) {
    const formData = this.userForm.value;

    this.adminSrvc.signUpWithGoogle()
      .then((userCredential) => {
        let data = {
          "uid": userCredential.user.uid,
          "username": formData.username,
          "email": formData.email,
          "password": formData.password,
          "role": "Admin",
          "mobile": formData.mobile,
          "last_login_timestamp": new Date(),
          "tenantId": this.logedInUser.tenantId,
          "created_by": this.logedInUser.username,
          "status": formData.status == "Activated" ? true : false,
          "imageUrl": userCredential.user.photoURL,
          "created_date": new Date(),
        }

        this.adminSrvc.addUserToAdminCollection('Admin', userCredential.user.uid, data)
          .then(() => {
            this.selectedFile = null;
            this.selectedFileUrl = null;
            this.goback();
            this.showConfirmationMessage('User Added successfully');
          })
          .catch((error) => {
            this.showConfirmationMessage('User Added Failed');
          });
        this.userForm.reset();
        // You can perform further actions here, such as redirecting the user to a different page
      })
      .catch((error) => {
        // Handle errors
        console.log('Error signing up with email and password:', error);
      });



  } else {
    this.isBtnSubmitted = false;
  }
}
showConfirmationMessage(message: string): void {
  this.popupMessage = message;
  this.popupAalert = true;
  setTimeout(() => {
  this.popupAalert = false;
}, 3000); // Clear message after 3 seconds
  }
callAdd() {
  this.isAddComponnet = true;
  this.isEditComponnet = false;
}

callEdit(data): void {
  this.id = data.id;
  this.isEditComponnet = true;
  this.isAddComponnet = false;
  this.userForm.controls["name"].setValue(data.name);
  this.userForm.controls["category"].setValue(data.categoryId);
}

onEdit() {
  this.isSubmitted = true;
  this.isBtnSubmitted = true;
  if (this.userForm.valid) {
    let postData = {
      CategoryId: this.userForm.get("category").value,
      Name: this.userForm.get("name").value,
      TenantId: this.tenantId,
    };
    // this.crmSrvc
    //   .update(
    //     `${this.apiUrl}/advertisementSubCategoryCRM/advertisementSubCategoryUpdate/${this.id}`,
    //     postData
    //   )
    //   .pipe(takeUntil(this.unsubscribe$))
    //   .subscribe(
    //     (datam: any) => {
    //       this.data = datam;
    //     },
    //     (error) => {
    //       this.isSubmitted = false;
    //       this.isBtnSubmitted = false;
    //     },
    //     () => {
    //       this.isSubmitted = false;
    //       this.isEditComponnet = false;
    //       this.isBtnSubmitted = false;
    //       this.Savemsg = false;
    //       this.isUpdateConfirmationMessage = true;
    //       setTimeout(() => {
    //         this.isUpdateConfirmationMessage = false;
    //       }, 4000);
    //       this.userForm.reset();
    //     }
    //   );
  } else {
    this.isBtnSubmitted = false;
    return;
  }
}

onClear() {
  this.isAddComponnet = false;
  this.isEditComponnet = false;
  this.isSubmitted = false;
  this.isBtnSubmitted = false;
  this.userForm.reset();
}

goback() {
  this.isAddComponnet = false;
  this.isEditComponnet = false;
  this.isSubmitted = false;
  this.isBtnSubmitted = false;
  this.userForm.reset();
}

  get fval(): { [key: string]: AbstractControl } {
  return this.userForm.controls;
}

}

