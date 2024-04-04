import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { faTwitter,  faFacebookF, faInstagramSquare } from '@fortawesome/free-brands-svg-icons';
import { User } from '../../../@core/data/users';
import { CommonService } from '../../../pages/service/common-service.service';
import { NbMenuService } from '@nebular/theme';
@Component({
  selector: 'ngx-footer',
  styleUrls: ['./footer.component.scss'],
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  faFacebook = faFacebookF;
  faInstagram = faInstagramSquare;
  faTwitter = faTwitter;

  userPictureOnly: boolean = true;
  user: User;
  registrationShow: boolean = false;
  srcname = "/assets/images/crazylogo.png";
  whatsapp = "/assets/images/raja.jpg";
  call = "/assets/images/call.jpg";
  userMenu:any;
  myorderPopup: boolean;
  constructor(private router: Router,private commonSrvc:CommonService,private menuService: NbMenuService,){

  }
  ngOnInit(): void {
    this.commonSrvc.getLoginDetailFromLocalStorage()
    .subscribe(data => {
      this.user = data;
      if(this.user.imageUrl == null){
        this.user.imageUrl="https://firebasestorage.googleapis.com/v0/b/dindigulcamara.appspot.com/o/adminUser_images%2Favatar.jpg?alt=media&token=0a438f89-d498-46a0-8168-9fae6863baf5"
      }
      this.userMenu = [{ title: `Profile ${this.user.username == null ? "" : "("+this.user.username+")"}`,link: "profile" },{ title: 'My Orders',link:"Orders"}, { title: 'Whatsapp Booking', link: "https://wa.me/+917904998687?text=Hi, I need your help renting a product from https://dindigulcamara.web.app/ . Please provide your details - Equipment type, Start Date, End Date"}];
    });

    this.menuService.onItemClick().subscribe((data) => {
      console.log(data);
      if (data.item.link === "Orders") {
        this.myorderPopup=true;
      }
    });
  }

  myOrderClose(){
    this.myorderPopup=false;
  }

  goHome(){
    this.router.navigateByUrl('/pages/rental/camHome');
  }
  goDslr(){
    this.router.navigateByUrl('/pages/rental/dslr');
  }

}

