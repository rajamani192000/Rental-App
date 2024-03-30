import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { faTwitter,  faFacebookF, faInstagramSquare } from '@fortawesome/free-brands-svg-icons';
import { User } from '../../../@core/data/users';
import { CommonService } from '../../../pages/service/common-service.service';
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
  constructor(private router: Router,private commonSrvc:CommonService){

  }
  ngOnInit(): void {
    this.commonSrvc.getLoginDetailFromLocalStorage()
    .subscribe(data => {
      this.user = data;
      if(this.user.imageUrl == null){
        this.user.imageUrl="https://firebasestorage.googleapis.com/v0/b/dindigulcamara.appspot.com/o/adminUser_images%2Favatar.jpg?alt=media&token=0a438f89-d498-46a0-8168-9fae6863baf5"
      }
      this.userMenu = [{ title: `Profile ${this.user.username == null ? "" : "("+this.user.username+")"}` },{ title: 'Orders'}, { title: 'Whatsapp Booking', link: "https://wa.me/+917904998687?text=Hi, I need your help renting a product from https://dindigulcamara.web.app/ . Please provide your details - Equipment type, Start Date, End Date"}];
    });
  }

  goHome(){
    this.router.navigateByUrl('/pages/rental/camHome');
  }
  goDslr(){
    this.router.navigateByUrl('/pages/rental/dslr');
  }

}

