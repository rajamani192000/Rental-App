import { of as observableOf, Observable, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { UserData, User } from '../data/users';

@Injectable()
export class UserService extends UserData {
  private Users = new BehaviorSubject<User>({
    uid: null,
    username: null,
    email: null,
    password: null,
    role: null,
    mobile: null,
    last_login_timestamp: null,
    tenantId: null,
    createdby: null,
    status: null,
    imageUrl: null,
    createdDate: null
  });
  data$ = this.Users.asObservable();
  private time: Date = new Date;

  // Retrieve the JSON string from localStorage using the key


  updateUser(userdata: User) {
    this.Users.next(userdata)
    return this.data$;
  }


}
