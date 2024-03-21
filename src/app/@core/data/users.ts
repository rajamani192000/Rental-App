import { Observable } from 'rxjs';

export interface User {
    uid: string;
    username: string;
    email: string;
    password: string;
    role: string;
    mobile: string;
    last_login_timestamp: Date;
    tenantId: string;
    createdby: string;
    status: true;
    imageUrl: string;
    createdDate: Date;
}


export abstract class UserData {
  abstract updateUser(data:User);

}
