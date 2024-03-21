import { Component, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Location } from "@angular/common";
import { environment } from "../../../../environments/environment";
@Component({
  selector: 'ngx-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  data: any = [];
  term: string;
  p: number = 1;
  id: number;
  categoryList: any = [];
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
  AdvertisingForm: FormGroup;

  private tenantId = localStorage.getItem("tenantId");
  private branchId = localStorage.getItem("branchId");
  private userId: number = parseInt(localStorage.getItem("userId"));
  protected readonly unsubscribe$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    public location: Location
  ) {
    this.AdvertisingForm = this.fb.group({
      name: this.fb.control(null, [
        Validators.required,
        Validators.pattern(".*\\S.*[a-zA-z ]"),
        Validators.maxLength(30),
      ]),
      category: this.fb.control(null, [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.isAddComponnet = false;
    this.isEditComponnet = false;
    this.loadCategoryList();
    this.fetchAdvertisementSubCategory();
  }

  fetchAdvertisementSubCategory(): void {
    this.isSubmitted = false;

    // this.crmSrvc
    //   .list(
    //     `advertisementSubCategoryCRM/advertiseSubCategoryGet/${this.tenantId}`
    //   )
    //   .pipe(takeUntil(this.unsubscribe$))
    //   .subscribe(
    //     (data: any) => {
    //       this.data = data;
    //     },
    //     (error) => {},
    //     () => {}
    //   );
  }

  loadCategoryList() {
    // this.crmSrvc
    //   .list(
    //     `advertisementCategoryMasterCRM/advertisingCategoryMasterGetCRM/${this.tenantId}`
    //   )
    //   .pipe(takeUntil(this.unsubscribe$))
    //   .subscribe(
    //     (data: any) => {
    //       this.categoryList = data;
    //     },
    //     (error) => {},
    //     () => {}
    //   );
  }

  onSave() {
    this.isSubmitted = true;
    this.isBtnSubmitted = true;
    if (this.AdvertisingForm.valid) {
      let postData = {
        CategoryId: this.AdvertisingForm.get("category").value,
        Name: this.AdvertisingForm.get("name").value,
        TenantId: this.tenantId,
      };
      // this.crmSrvc
      //   .searchList(
      //     `advertisementSubCategoryCRM/advertiseSourcePost `,
      //     postData
      //   )
      //   .pipe(takeUntil(this.unsubscribe$))
      //   .subscribe(
      //     (data: any) => {
      //       this.data = data;
      //     },
      //     (error) => {
      //       this.isBtnSubmitted = false;
      //       this.isSubmitted = false;
      //     },
      //     () => {
      //       this.isSubmitted = false;
      //       this.isAddComponnet = false;
      //       this.isBtnSubmitted = false;
      //       this.Savemsg = true;
      //       this.isUpdateConfirmationMessage = false;
      //       setTimeout(() => {
      //         this.Savemsg = false;
      //       }, 4000);
      //       this.AdvertisingForm.reset();
      //     }
      //   );
    } else {
      this.isBtnSubmitted = false;
    }
  }

  callAdd() {
    this.isAddComponnet = true;
    this.isEditComponnet = false;
  }

  callEdit(data): void {
    this.id = data.id;
    this.isEditComponnet = true;
    this.isAddComponnet = false;
    this.AdvertisingForm.controls["name"].setValue(data.name);
    this.AdvertisingForm.controls["category"].setValue(data.categoryId);
  }

  onEdit() {
    this.isSubmitted = true;
    this.isBtnSubmitted = true;
    if (this.AdvertisingForm.valid) {
      let postData = {
        CategoryId: this.AdvertisingForm.get("category").value,
        Name: this.AdvertisingForm.get("name").value,
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
      //       this.AdvertisingForm.reset();
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
    this.AdvertisingForm.reset();
  }

  goback() {
    this.isAddComponnet = false;
    this.isEditComponnet = false;
    this.isSubmitted = false;
    this.isBtnSubmitted = false;
    this.AdvertisingForm.reset();
  }

  get fval(): { [key: string]: AbstractControl } {
    return this.AdvertisingForm.controls;
  }

}
