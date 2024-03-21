import { PagesComponent } from './../../pages.component';
import { Component, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Observable, Subject, from, throwError } from "rxjs";
import { catchError, finalize, map, switchMap, take, takeUntil } from "rxjs/operators";
import { Location } from "@angular/common";
import { environment } from "../../../../environments/environment";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { AngularFireStorage } from "@angular/fire/compat/storage";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { Router } from "@angular/router";
import { AdminService } from "../../service/admin.service";
import { CommonService } from "../../service/common-service.service";


@Component({
  selector: 'ngx-product-manage',
  templateUrl: './product-manage.component.html',
  styleUrls: ['./product-manage.component.scss']
})
export class ProductManageComponent implements OnInit {
  data: any = [];
  term: string;
  p: number = 1;
  id: number;
  availabilityList: any = ["In Stock", "Out of Stock"];
  typeList: Array<any> = [];
  brandList: Array<any> = [];
  modelList: Array<any> = [];
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
  productForm: FormGroup;
  isProductAddComponent: boolean = false;
  isProductBtnSubmitted: boolean = false;
  private tenantId = localStorage.getItem("tenantId");
  private branchId = localStorage.getItem("branchId");
  private userId: number = parseInt(localStorage.getItem("userId"));
  protected readonly unsubscribe$ = new Subject<void>();
  selectedFile: File;
  selectedFileUrl: string | ArrayBuffer;
  popupAalert: boolean;
  popupMessage: string;
  adminUserData: Array<any> = [];
  logedInUser: any = {};
  productDetailsForm: FormGroup;
  typeListCopy: Array<any> = [];
  modelListCopy: Array<any> = [];
  modelData: Array<any> = [];
  modelDataCopy: any;
  isdetailsSubmitted: boolean = false;
  addedModelDetails: Array<any> = [];
  popupMessageFailed: any;
  popupAalertFailed: boolean;
  indexPosition: any;

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
    this.productForm = this.fb.group({
      productName: [null, [Validators.required]],
      description: [null, [Validators.required]],
      displayAmt: [null, [Validators.required]],
      productAmt: [null, [Validators.required]],
      specs: [null, [Validators.required]],
      availability: [null, [Validators.required]],
      type: [null, [Validators.required]],
      brand: [null, [Validators.required]],
      imageurl: [null, [Validators.required]]
    });

    this.productDetailsForm = this.fb.group({
      modelName: [null, [Validators.required]],
      totalQty: [null, [Validators.required]],
      availableQty: [null, [Validators.required]],
      modelAmt: [null, [Validators.required]],
      fourdayAmtDisc: [null, [Validators.required]],
      seveendayAmtDisc: [null, [Validators.required]],
      seveenDaysMoreDisc: [null, [Validators.required]]
    });

  }

  ngOnInit(): void {
    this.isAddComponnet = false;
    this.isEditComponnet = false;
    this.getAdminUser();
    this.requiredDetails();
    // Retrieve the data from localStorage
    const storedData = localStorage.getItem('currentUser');
    // Parse the stored data
    this.logedInUser = storedData ? JSON.parse(storedData) : null;
  }
  requiredDetails() {
    this.getBrandDetails();

  }
  resetDetails() {

  }
  setMedicineDetails() {
    let productDetails = {
      "availableQty": this.productDetailsForm.value.availableQty,
      "totalQty": this.productDetailsForm.value.totalQty,
      "modelName": this.productDetailsForm.value.modelName,
      "modelAmt": this.productDetailsForm.value.modelAmt,
      "discAmt": {
        "fourdayAmtDisc": this.productDetailsForm.value.fourdayAmtDisc,
        "seveendayAmtDisc": this.productDetailsForm.value.seveendayAmtDisc,
        "seveenDaysMoreDisc": this.productDetailsForm.value.seveenDaysMoreDisc,
      }
    }
    return productDetails;
  }

  getProducts(){
   let a= {"discAmt": [
      {"name": "fourdayAmtDisc","price": this.productDetailsForm.value.fourdayAmtDisc},
      {"name": "seveendayAmtDisc","price": this.productDetailsForm.value.seveendayAmtDisc},
      {"name": "seveenDaysMoreDisc","price": this.productDetailsForm.value.seveenDaysMoreDisc},
    ]
  }
  }
  addProduct() {
    this.isdetailsSubmitted = true;
    this.isProductBtnSubmitted = true;
    if (this.productDetailsForm.valid) {
      let modelData = this.setMedicineDetails();
      this.addedModelDetails.push(modelData);
      this.productDetailsForm.reset();
      this.showConfirmationMessage("Successfully Added The model")
      this.isProductBtnSubmitted = false;
    }
    else {
      this.isProductBtnSubmitted = false;
      this.failedShowConfirmationMessage("Failed to Add The model")
    }
  }

  callmodelEdit(data, index) {
    this.isProductAddComponent = false;
    this.indexPosition = index;
    this.productDetailsForm.setValue({
      modelName: data.modelName,
      totalQty: data.totalQty,
      availableQty: data.availableQty,
      modelAmt: data.modelAmt,
      fourdayAmtDisc: data.fourdayAmtDisc,
      seveendayAmtDisc: data.seveendayAmtDisc,
      seveenDaysMoreDisc: data.seveenDaysMoreDisc
    });
  }
  updateProduct() {
    this.isdetailsSubmitted = true;
    this.isProductBtnSubmitted = true;
    if (this.productDetailsForm.valid) {
      let modelData = this.setMedicineDetails();
      this.addedModelDetails[this.indexPosition] = modelData;
      this.showConfirmationMessage("Successfully Updated The model")
      this.isProductAddComponent = true;
      this.isProductBtnSubmitted = false;
    }
    else {
      this.isProductAddComponent = true;
      this.isProductBtnSubmitted = false;
      this.failedShowConfirmationMessage("Failed to Update The model")
    }
  }
  callmodeldelete(i) {

  }
  failedShowConfirmationMessage(message) {
    this.popupMessageFailed = message;
    this.popupAalertFailed = true;
    setTimeout(() => {
      this.popupAalert = false;
    }, 3000); // Clear message after 3 seconds
  }
  getBrandDetails() {
    this.commonSrvc.list("brandList").subscribe(data => {
      this.brandList = data;
    });
    this.commonSrvc.list("lensList").subscribe(data => {
      this.modelData = data;
      this.modelDataCopy = data;
    });
    this.commonSrvc.list("modelList").subscribe(data => {
      this.modelList = data;
      this.modelListCopy = data;
    });
    this.commonSrvc.list("typeList").subscribe(data => {
      this.typeList = data;
      this.typeListCopy = data;
    });
  }
  // getTypeandModelList() {
  //   let typeSet = new Set();
  //   let modelSet = new Set();
  //   this.brandList.forEach(brand => {
  //     var brandName = brand.brand
  //     brand.types.forEach(type => {
  //       var typee=type.type;
  //         typeSet.add({type:type.type,brand:brandName,models:type.models});
  //         type.models.forEach(model => {
  //             modelSet.add({model:model,type:typee,brand:brandName});
  //         });
  //     });
  // });
  // this.typeList = [...typeSet];
  // this.typeListCopy=this.typeList;
  // this.modelList = [...modelSet];
  // this.modelListCopy= [...modelSet];


  // }
  //   data.filter(item => item.name.toLowerCase().includes(searchText.toLowerCase()) ||
  //   item.tariff.toString().includes(searchText)
  // );
  onBrandChange(event) {
    this.typeList = this.typeListCopy.filter(item => item.brand.toLowerCase().includes(event[0].value.toLowerCase()));
    this.modelList = this.modelListCopy.filter(item => item.brand.toLowerCase().includes(event[0].value.toLowerCase()));
    this.modelData = this.modelDataCopy.filter(item => item.brand.toLowerCase().includes(event[0].value.toLowerCase()));
  }
  onTypeChange(event) {
    this.modelList = this.modelListCopy.filter(item => item.brand.toLowerCase().includes(event[0].data.brand.toLowerCase()) && item.type.toLowerCase().includes(event[0].data.type.toLowerCase()));
  }


  getAdminUser() {
    this.firestore
      .collection('Admin')
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
      this.productForm.patchValue({ image: file });
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.selectedFileUrl = reader.result;
        this.productForm.controls['imageUrl'].setValue(this.selectedFileUrl);
      };
    }
  }

  onSave() {
    this.getProductUidandSave().subscribe(status => {
      if (status == "saved") {
        this.showConfirmationMessage('product Saved Successfully');
      } else if (status == "failed") {
        this.showConfirmationMessage('Product Saved Failed');
      }
    });

  }

  getProductUidandSave(data?) {
    const uid = this.commonSrvc.generateUniqueID();
    return this.commonSrvc.isUIDAvailable(uid, "products").pipe(
      switchMap(available => {
        if (available) {
          this.isSubmitted = true;
          this.isBtnSubmitted = true;
          if (this.productForm.valid) {
            const formData = this.productForm.value;
            const productId = formData.email;
            let imageFile;
            this.adminSrvc.uploadImageGetUrl(this.productForm.value.productName, this.selectedFile).subscribe(
              imageUrl => {
                if (!imageUrl) {
                  return;
                }


                let data = {
                  "modelDet": this.addedModelDetails,
                  "productName": this.productForm.value.productName,
                  "id": uid,
                  "description": this.productForm.value.description,
                  "displayAmt": this.productForm.value.displayAmt,
                  "specs": this.productForm.value.specs,
                  "type": this.productForm.value.type,
                  "brand": this.productForm.value.brand,
                  "imageurl": imageUrl,
                  "tenantId": this.logedInUser.tenantId,
                  "availability": this.productForm.value.availability,
                  "createdBy": this.logedInUser.username,
                  "createdDate": new Date()
                }

                // Use async/await for readability and error handling
                return from(this.commonSrvc.createwithUid("products", uid, data)).pipe(
                  map(() => {
                    return "saved"; // Return undefined if saved successfully
                  }),
                  catchError(() => {
                    return "faild"; // Return Observable with undefined if save fails
                  })
                );
              },
              error => {
                this.showConfirmationMessage('Error uploading image');
              }
            );
          } else {
            this.isBtnSubmitted = false;
          }
        } else {
          // Retry generating a new UID recursively until it's unique
          return this.getProductUidandSave(data);
        }
      })
    );
  }

  // onSave() {
  //   this.isSubmitted = true;
  //   this.isBtnSubmitted = true;
  //   if (this.productForm.valid) {
  //     const formData = this.productForm.value;
  //     const productId = formData.email;
  //     let imageFile;
  //     this.adminSrvc.uploadImageGetUrl(formData.username, this.selectedFile).subscribe(
  //       imageUrl => {
  //         imageFile = imageUrl;

  //         if (!imageFile || !productId) {
  //           return;
  //         }
  //         this.adminSrvc.signUpWithEmailAndPassword(formData.email, formData.password)
  //           .then((userCredential) => {
  //             let data = {
  //               "uid": userCredential.user.uid,
  //               "username": formData.username,
  //               "email": formData.email,
  //               "password": formData.password,
  //               "role": "Admin",
  //               "mobile": formData.mobile,
  //               "last_login_timestamp": new Date(),
  //               "tenantId": this.logedInUser.tenantId,
  //               "createdby": this.logedInUser.username,
  //               "status": formData.status == "Activated" ? true : false,
  //               "imageUrl": imageFile,
  //               "createdDate": new Date(),
  //             }

  //             let b = {
  //               "CameraID": "unique_identifier",
  //               "productName": "Camera Name",
  //               "Description": "Description",
  //               "Brand": "Brand",
  //               "Model": "Model",
  //               "Type": "Type",
  //               "RentalAmtPerDay": "Rental Amt per Day",
  //               "AvailabilityStatus": "Availability Status",
  //               "ImageURL": "Image URL",
  //               "Tenant": "Tenant",
  //               "CreatedBy": "Createdby",
  //               "CreatedDate": "createddate"
  //             }

  //             this.adminSrvc.addUserToAdminCollection('Admin', userCredential.user.uid, data)
  //               .then(() => {
  //                 this.selectedFile = null;
  //                 this.selectedFileUrl = null;
  //                 this.goback();
  //                 this.showConfirmationMessage('User Added successfully');
  //               })
  //               .catch((error) => {
  //                 this.showConfirmationMessage('User Added Failed');
  //               });
  //             this.productForm.reset();
  //             // You can perform further actions here, such as redirecting the user to a different page
  //           })
  //           .catch((error) => {
  //             // Handle errors
  //             console.log('Error signing up with email and password:', error);
  //           });
  //       },
  //       error => {
  //         console.error('Error uploading image:', error);
  //       }
  //     );
  //   } else {
  //     this.isBtnSubmitted = false;
  //   }
  // }


  signUpGoogle() {
    this.isSubmitted = true;
    this.isBtnSubmitted = true;
    if (this.productForm.valid) {
      const formData = this.productForm.value;

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
            "tenantId": this.logedInUser?.tenantId,
            "created_by": this.logedInUser?.username,
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
          this.productForm.reset();
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
    this.isProductAddComponent = true;
    this.isEditComponnet = false;
    this.productForm.reset();
    this.productDetailsForm.reset();
  }

  callEdit(data): void {
    this.id = data.id;
    this.isEditComponnet = true;
    this.isAddComponnet = false;
    this.productForm.controls["name"].setValue(data.name);
    this.productForm.controls["category"].setValue(data.categoryId);
  }

  onEdit() {
    this.isSubmitted = true;
    this.isBtnSubmitted = true;
    if (this.productForm.valid) {
      let postData = {
        CategoryId: this.productForm.get("category").value,
        Name: this.productForm.get("name").value,
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
      //       this.productForm.reset();
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
    this.productForm.reset();
  }

  goback() {
    this.isAddComponnet = false;
    this.isEditComponnet = false;
    this.isSubmitted = false;
    this.isBtnSubmitted = false;
    this.productForm.reset();
  }

  get fval(): { [key: string]: AbstractControl } {
    return this.productForm.controls;
  }

}

