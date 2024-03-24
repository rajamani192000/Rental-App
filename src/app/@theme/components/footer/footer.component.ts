import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { faTwitter,  faFacebookF, faInstagramSquare } from '@fortawesome/free-brands-svg-icons';
import { User } from '../../../@core/data/users';
@Component({
  selector: 'ngx-footer',
  styleUrls: ['./footer.component.scss'],
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  faFacebook = faFacebookF;
  faInstagram = faInstagramSquare;
  faTwitter = faTwitter;
  userMenu = [{ title: 'Whatsapp' }, { title: 'Call' }];
  userPictureOnly: boolean = false;
  user: User;
  registrationShow: boolean = false;
  srcname = "/assets/images/crazylogo.png";
  whatsapp = "/assets/images/raja.jpg";
  call = "/assets/images/call.jpg";
  constructor(private router: Router){

  }

  goHome(){
    this.router.navigateByUrl('/pages/rental/camHome');
  }
  goDslr(){
    this.router.navigateByUrl('/pages/rental/dslr');
  }

}

