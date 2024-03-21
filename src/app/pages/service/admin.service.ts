import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import firebase from 'firebase/compat/app';
@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private adminUsersCollection: AngularFirestoreCollection<any>;

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage
  ) {
    this.adminUsersCollection = this.firestore.collection('adminUsers');
  }

  // Get admin user by UID
  getAdminUser(uid: string): Observable<any> {
    return this.firestore.doc(`adminUsers/${uid}`).valueChanges();
  }

  // Add admin user by UID
  addAdminUser(uid: string): Promise<void> {
    return this.adminUsersCollection.doc(uid).set({ isAdmin: true });
  }

  // List all admin users
  listAdminUsers(): Observable<any[]> {
    return this.adminUsersCollection.valueChanges();
  }

  addUserToAdminCollection(collectionName: string,uid:any, data: any): Promise<void> {
    return this.firestore.collection(collectionName).doc(uid).set(data);
  }

  // Delete admin user by UID
  deleteAdminUser(uid: string): Promise<void> {
    return this.adminUsersCollection.doc(uid).delete();
  }

  signInWithEmailAndPassword(email: string, password: string): Promise<firebase.auth.UserCredential> {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  signInWithGoogle(): Promise<firebase.auth.UserCredential> {
    const provider = new firebase.auth.GoogleAuthProvider();
    return this.afAuth.signInWithPopup(provider);
  }

  // Sign up with email and password
  signUpWithEmailAndPassword(email: string, password: string): Promise<firebase.auth.UserCredential> {
    return this.afAuth.createUserWithEmailAndPassword(email, password);
  }

  // Sign up with Google
  signUpWithGoogle(): Promise<firebase.auth.UserCredential> {
    const provider = new firebase.auth.GoogleAuthProvider();
    return this.afAuth.signInWithPopup(provider);
  }


  uploadImageGetUrl(productId: string, imageFile: any): Observable<string> {
    const filePath = `adminUser_images/${productId}_${new Date().getTime()}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, imageFile);

    return new Observable<string>(observer => {
      task.snapshotChanges()
        .pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe((downloadUrl) => {
              observer.next(downloadUrl);
              observer.complete();
            }, error => {
              observer.error(error);
            });
          })
        ).subscribe();
    });
  }

}
