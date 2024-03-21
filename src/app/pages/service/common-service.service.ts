import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference, DocumentSnapshot } from '@angular/fire/compat/firestore';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
@Injectable({
  providedIn: 'root'
})
export class CommonService {
  private userDataSubject: BehaviorSubject<any>;
  constructor(private firestore: AngularFirestore) {
    const storedData = localStorage.getItem('currentUser');
    const initialData = storedData ? JSON.parse(storedData) : null;
    this.userDataSubject = new BehaviorSubject<any>(initialData);
   }

  // Create a document
  create(collectionName: string, data: any): Promise<DocumentReference<any>> {
    return this.firestore.collection(collectionName).add(data);
  }

  // Get all documents in a collection
  list(collectionName: string): Observable<any[]> {
    return this.firestore.collection(collectionName).valueChanges();
  }

  // Service code
  getById(collectionName: string, documentId: string): Observable<any> {
    return this.firestore.collection(collectionName).doc(documentId).snapshotChanges()
      .pipe(
        map((doc: any) => {
          if (doc.payload.exists) {
            return doc.payload.data();
          } else {
            throw new Error("Document not found");
          }
        })
      );
  }
  // Update a document
  update(collectionName: string, documentId: string, data: any): Promise<void> {
    return this.firestore.collection(collectionName).doc(documentId).update(data);
  }

  // Update a document
  createwithUid(collectionName: string, uid: string, data: any): Promise<void> {
    return this.firestore.collection(collectionName).doc(uid).set(data);
  }


  // Delete a document
  delete(collectionName: string, documentId: string): Promise<void> {
    return this.firestore.collection(collectionName).doc(documentId).delete();
  }

  setLoginDetailtoLocalStorage(data: any) {
    const jsonData = JSON.stringify(data);
    localStorage.setItem('currentUser', jsonData);
    this.userDataSubject.next(data);
  }

  getLoginDetailFromLocalStorage(): Observable<any> {
    return this.userDataSubject.asObservable();
  }

  isUIDAvailable(uid: string,collectionName:string): Observable<boolean> {
    return this.firestore.collection(collectionName).doc(uid).valueChanges()
      .pipe(
        take(1),
        switchMap(document => {
          return of(document ? false : true);
        })
      );
  }

  generateUniqueID(): string {
    return uuidv4();
  }
}

