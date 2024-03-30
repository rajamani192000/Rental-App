import { PagesComponent } from './../../pages.component';
import { Component, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Observable, Subject, from, of, throwError } from "rxjs";
import { catchError, finalize, map, switchMap, take, takeUntil } from "rxjs/operators";
import { Location } from "@angular/common";
import { environment } from "../../../../environments/environment";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { AngularFireStorage } from "@angular/fire/compat/storage";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { Router } from "@angular/router";
import { AdminService } from "../../service/admin.service";
import { CommonService } from "../../service/common-service.service";
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'ngx-product-manage',
  templateUrl: './product-manage.component.html',
  styleUrls: ['./product-manage.component.scss']
})
export class ProductManageComponent implements OnInit {
  data: any = [];
  term: string;
  p: number = 1;
  id: string;
  availabilityList: any = ["In Stock", "Out of Stock"];
  locationData: Array<any> = [];
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
  productsData: Array<any> = [];
  logedInUser: any = {};
  productDetailsForm: FormGroup;
  typeListCopy: Array<any> = [];
  modelListCopy: Array<any> = [];
  modelData: Array<any> = [];
  modelDataCopy: any;
  isdetailsSubmitted: boolean = false;
  addedModelDetails: Array<any> = [];
  popupMessageFailed: any;
  popupAalertFailed: boolean=false;
  indexPosition: any;
  imageError: boolean=false;
  confirmDelete: boolean=false;
  constructor(
    private fb: FormBuilder,
    public location: Location,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
    private afAuth: AngularFireAuth,
    private router: Router,
    private adminSrvc: AdminService,
    private commonSrvc: CommonService,
    private spinner:NgxSpinnerService
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
      inclusions:[null, [Validators.required]],
      fourdayAmtDisc: [null, [Validators.required]],
      seveendayAmtDisc: [null, [Validators.required]],
      seveenDaysMoreDisc: [null, [Validators.required]],
      imageurl: [null],
      createdDate: [null],
    });

    this.productDetailsForm = this.fb.group({
      modelName: [null, [Validators.required]],
      totalQty: [null, [Validators.required]],
      availableQty: [null, [Validators.required]],
      modelAmt: [null, [Validators.required]],
      pickupLocation: [null, [Validators.required]],
      advanceAmt: [null, [Validators.required]]
    });

  }

  ngOnInit(): void {
    this.isAddComponnet = false;
    this.isEditComponnet = false;
    this.getProducts();
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
      "pickupLocation":this.productDetailsForm.value.pickupLocation,
      "advanceAmt":this.productDetailsForm.value.advanceAmt

    }
    return productDetails;
  }

  getProducts() {
    // let a = {
    //   "discAmt": [
    //     { "name": "fourdayAmtDisc", "price": this.productDetailsForm.value.fourdayAmtDisc },
    //     { "name": "seveendayAmtDisc", "price": this.productDetailsForm.value.seveendayAmtDisc },
    //     { "name": "seveenDaysMoreDisc", "price": this.productDetailsForm.value.seveenDaysMoreDisc },
    //   ]
    // }
    this.spinner.show()
    this.commonSrvc.list("products") .subscribe((productsData: any[]) => {
      this.productsData = productsData;
      this.spinner.hide()
    });
  }
  addProduct() {
    this.spinner.show()
    this.isdetailsSubmitted = true;
    this.isProductBtnSubmitted = true;
    if (this.productDetailsForm.valid) {
      let modelData = this.setMedicineDetails();
      this.addedModelDetails.push(modelData);
      this.productDetailsForm.reset();
      this.showConfirmationMessage("Successfully Added The model")
      this.isProductBtnSubmitted = false;
      this.spinner.hide()
    }
    else {
      this.spinner.hide()
      this.isProductBtnSubmitted = false;
      this.failedShowConfirmationMessage("Failed to Add The model")
    }
  }

  callmodelEdit(data, index) {
    this.spinner.show();
    this.isProductAddComponent = false;
    this.indexPosition = index;
    this.productDetailsForm.setValue({
      modelName: data.modelName,
      totalQty: data.totalQty,
      availableQty: data.availableQty,
      modelAmt: data.modelAmt,
      pickupLocation: data.pickupLocation,
      advanceAmt:data.advanceAmt
    });
    this.spinner.hide();
  }
  updateProduct() {
    this.spinner.show();
    this.isdetailsSubmitted = true;
    this.isProductBtnSubmitted = true;
    if (this.productDetailsForm.valid) {
      let modelData = this.setMedicineDetails();
      this.addedModelDetails[this.indexPosition] = modelData;
      this.showConfirmationMessage("Successfully Updated The model")
      this.isProductAddComponent = true;
      this.isProductBtnSubmitted = false;
      this.spinner.show();
    }
    else {
      this.spinner.hide();
      this.isProductAddComponent = true;
      this.isProductBtnSubmitted = false;
      this.failedShowConfirmationMessage("Failed to Update The model")
    }
  }
  callmodeldelete(i) {
    this.spinner.show();
    this.addedModelDetails.splice(i, 1);
    this.spinner.hide();
  }
  failedShowConfirmationMessage(message) {
    this.popupMessageFailed = message;
    this.popupAalertFailed = true;
    setTimeout(() => {
      this.popupAalert = false;
    }, 3000); // Clear message after 3 seconds
  }
  getBrandDetails() {
    this.spinner.show();
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
    this.commonSrvc.list("tamilnaduTaluks").subscribe(data => {
      this.locationData = data;
    });
    this.spinner.hide();
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


  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.imageError = false;
      this.productForm.patchValue({ image: file });
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.selectedFileUrl = reader.result;
      };
    } else {
      this.imageError = true;
    }
  }

  onSave() {
    this.spinner.show();
    this.getProductUidandSave("save").subscribe(status => {
      if (status == "saved") {
        this.selectedFile = null;
        this.selectedFileUrl = null;
        this.isBtnSubmitted =false;
        this.goback();
        this.spinner.hide();
        this.showConfirmationMessage('product Saved Successfully');
      } else if (status == "failed") {
        this.spinner.hide();
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
          if (this.productForm.valid) {
            const formData = this.productForm.value;
            const productId = formData.email;
            return this.adminSrvc.uploadImageGetUrl(this.productForm.value.productName, this.selectedFile).pipe(
              switchMap(imageUrl => {
                if (!imageUrl) {
                  return of("failed"); // Return failed if image upload fails
                }
                const data = {
                  "modelDet": this.addedModelDetails,
                  "productName": this.productForm.value.productName,
                  "id": uid,
                  "inclusions":this.productForm.value.inclusions,
                  "description": this.productForm.value.description,
                  "displayAmt": this.productForm.value.displayAmt,
                  "specs": this.productForm.value.specs,
                  "type": this.productForm.value.type,
                  "brand": this.productForm.value.brand,
                  "productAmt": this.productForm.value.productAmt,
                  "imageurl": imageUrl,
                  "tenantId": this.logedInUser.tenantId,
                  "availability": this.productForm.value.availability == "In Stock" ? true : false,
                  "createdBy": this.logedInUser.username,
                  "createdDate": new Date(),
                  "fourdayAmtDisc": this.productForm.value.fourdayAmtDisc,
                  "seveendayAmtDisc": this.productForm.value.seveendayAmtDisc,
                  "seveenDaysMoreDisc": this.productForm.value.seveenDaysMoreDisc
                };
                // Use async/await for readability and error handling
                return from(this.commonSrvc.createwithUid("products", uid, data)).pipe(
                  map(() => {
                    return "saved"; // Return saved if successful
                  }),
                  catchError(() => {
                    return of("failed"); // Return failed if save fails
                  })
                );
              }),
              catchError(error => {
                this.showConfirmationMessage('Error uploading image');
                return of("failed"); // Return failed if image upload fails
              })
            );
          } else {
            this.isBtnSubmitted = false;
            return of("failed"); // Return failed if form is invalid
          }
        } else {
          // Retry generating a new UID recursively until it's unique
          return this.getProductUidandSave(data);
        }
      })
    );
  }




  signUpGoogle() {
    this.isSubmitted = true;
    this.isBtnSubmitted = true;
    if (this.productForm.valid) {
      this.spinner.show();
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
              this.spinner.hide();
            })
            .catch((error) => {
              this.spinner.hide();
              this.showConfirmationMessage('User Added Failed');
            });
          this.productForm.reset();
          // You can perform further actions here, such as redirecting the user to a different page
        })
        .catch((error) => {
          this.spinner.hide();
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
    this.spinner.show();
    this.selectedFileUrl=null;
    this.addedModelDetails=[];
    this.isAddComponnet = true;
    this.isProductAddComponent = true;
    this.isEditComponnet = false;
    this.productForm.reset();
    this.productDetailsForm.reset();
    this.spinner.hide();
  }
  calldelete(id){
    this.spinner.show();
    this.commonSrvc.delete("products",id)
      .then(() => {
        this.showConfirmationMessage('Successfully Product Deleted');
        this.spinner.show();
      this.confirmDelete=false;
      })
      .catch((error) => {
        this.spinner.hide();
        this.showConfirmationMessage('Failed to Delete Product');
      });
  }

  callEdit(data): void {
    this.spinner.show();
    this.id = data.id;
    this.addedModelDetails=[];
    data.modelDet.forEach(e => {
      this.productDetailsForm.setValue({
        modelName: e.modelName,
        totalQty: e.totalQty,
        availableQty: e.availableQty,
        modelAmt: e.modelAmt,
        pickupLocation: e.pickupLocation,
        advanceAmt:e.advanceAmt
      });
      let modelData = this.setMedicineDetails();
      this.addedModelDetails.push(modelData);
      this.productDetailsForm.reset();
    });


    this.selectedFileUrl = data.imageurl;
    this.productForm.setValue({
      fourdayAmtDisc: data.fourdayAmtDisc,
      seveendayAmtDisc: data.seveendayAmtDisc,
      seveenDaysMoreDisc: data.seveenDaysMoreDisc,
      productName: data.productName,
      description: data.description,
      displayAmt: data.displayAmt,
      productAmt: data.productAmt,
      specs: data.specs,
      availability: data.availability == true ? "In Stock" :"Out of Stock",
      type: data.type,
      brand: data.brand,
      imageurl: data.imageurl,
      inclusions:data.inclusions,
      createdDate: data.createdDate
    });

    this.isEditComponnet = true;
    this.isAddComponnet = false;
    this.isProductAddComponent = true;
    this.spinner.hide();
  }


  onEdit() {
    this.spinner.show();
    this.isSubmitted = true;
    this.isBtnSubmitted = true;
    this.getProductUidandUpdate().subscribe(status => {
      if (status == "updated") {
        this.selectedFile = null;
        this.selectedFileUrl = null;
        this.isBtnSubmitted =false;
        this.goback();
        this.spinner.hide();
        this.showConfirmationMessage('product Updated Successfully');
      } else if (status == "failed") {
        this.spinner.hide();
        this.showConfirmationMessage('Product Update Failed');
      }
    });
  }

  getProductUidandUpdate() {
    this.isSubmitted = true;
    this.isBtnSubmitted=true;
    if (this.productForm.valid) {

      if (this.selectedFile == undefined) {
        const data = {
          "modelDet": this.addedModelDetails,
          "productName": this.productForm.value.productName,
          "id": this.id,
          "inclusions":this.productForm.value.inclusions,
          "description": this.productForm.value.description,
          "displayAmt": this.productForm.value.displayAmt,
          "specs": this.productForm.value.specs,
          "type": this.productForm.value.type,
          "brand": this.productForm.value.brand,
          "productAmt": this.productForm.value.productAmt,
          "imageurl": this.selectedFileUrl,
          "tenantId": this.logedInUser.tenantId,
          "availability": this.productForm.value.availability == "In Stock" ? true : false,
          "createdBy": this.logedInUser.username,
          "createdDate": this.productForm.value.createdDate,
          "updatedDate": new Date(),
          "fourdayAmtDisc": this.productForm.value.fourdayAmtDisc,
          "seveendayAmtDisc": this.productForm.value.seveendayAmtDisc,
          "seveenDaysMoreDisc": this.productForm.value.seveenDaysMoreDisc
        };
        return from(this.commonSrvc.update("products", this.id, data)).pipe(
          map(() => {
            return "updated"; // Return saved if successful
          }),
          catchError(() => {
            return of("failed"); // Return failed if save fails
          })
        );
      } else {
        return this.adminSrvc.uploadImageGetUrl(this.productForm.value.productName, this.selectedFile).pipe(
          switchMap(imageUrl => {
            if (!imageUrl) {
              return of("failed"); // Return failed if image upload fails
            }
            const data = {
              "modelDet": this.addedModelDetails,
              "productName": this.productForm.value.productName,
              "id": this.id,
              "inclusions":this.productForm.value.inclusions,
              "description": this.productForm.value.description,
              "displayAmt": this.productForm.value.displayAmt,
              "specs": this.productForm.value.specs,
              "type": this.productForm.value.type,
              "brand": this.productForm.value.brand,
              "productAmt": this.productForm.value.productAmt,
              "imageurl": imageUrl,
              "tenantId": this.logedInUser.tenantId,
              "availability": this.productForm.value.availability == "In Stock" ? true : false,
              "createdBy": this.logedInUser.username,
              "createdDate": this.productForm.value.createdDate,
              "updatedDate": new Date(),
              "fourdayAmtDisc": this.productForm.value.fourdayAmtDisc,
              "seveendayAmtDisc": this.productForm.value.seveendayAmtDisc,
              "seveenDaysMoreDisc": this.productForm.value.seveenDaysMoreDisc
            };
            // Use async/await for readability and error handling
            return from(this.commonSrvc.update("products", this.id, data)).pipe(
              map(() => {
                return "updated"; // Return saved if successful
              }),
              catchError(() => {
                return of("failed"); // Return failed if save fails
              })
            );
          }),
          catchError(error => {
            this.showConfirmationMessage('Error uploading image');
            return of("failed"); // Return failed if image upload fails
          })
        );
      }

    } else {
      this.isBtnSubmitted = false;
      return of("failed"); // Return failed if form is invalid
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
    this.productDetailsForm.reset();
  }

  get fval(): { [key: string]: AbstractControl } {
    return this.productForm.controls;
  }
  get dval(): { [key: string]: AbstractControl } {
    return this.productDetailsForm.controls;
  }

}

