
import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference, DocumentSnapshot } from '@angular/fire/compat/firestore';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
function _window(): any {
  // return the global native browser window object
  return window;
}

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  private userDataSubject: BehaviorSubject<any>;
  constructor(private firestore: AngularFirestore, private http: HttpClient) {
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

  getDocumentById(collectionName: string, documentId: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.firestore.collection(collectionName).doc(documentId).get().toPromise()
        .then((doc) => {
          if (doc.exists) {
            resolve(doc.data());
          } else {
            reject("Document not found");
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  // Update a document
  update(collectionName: string, documentId: string, data: any): Promise<void> {
    return this.firestore.collection(collectionName).doc(documentId).update(data);
  }



  updateField(collectionName: string, docId: string, fieldName: string, value: any) {
    return this.firestore.collection(collectionName).doc(docId).update({
      [fieldName]: value
    });
  }
  convertToServerTimestamp(date: Date): firebase.firestore.Timestamp {
    const firebaseTimestamp = firebase.firestore.Timestamp.fromDate(date);
    return firebaseTimestamp;
  }

  getFieldValueByModelId(productId: string, id: string, modelId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.firestore.collection('products', ref =>
        ref.where('productId', '==', productId)
          .where('id', '==', id)
      ).valueChanges().pipe(
        map((product: any) => {
          if (product && Array.isArray(product[0].modelDet)) {
            // Find the array within modelDet that matches the given modelId
            const modelArray = product[0].modelDet.find((model: any) => model.modelId === modelId);
            // If modelArray is found, extract the desired field value
            if (modelArray) {
              resolve(modelArray["availableQty"]);
            } else {
              resolve(null); // Resolve with null if modelId is not found
            }
          } else {
            resolve(null); // Resolve with null if product, modelDet, or modelDet is not found or not an array
          }
        })
      ).subscribe(() => { }, reject); // Subscribe to handle errors
    });
  }

  isOrderWithinDateRange(order: any, fromDate: Date, toDate: Date): boolean {
    const orderFromDate = (order.booking_start_date).toDate();
    const orderToDate = (order.booking_end_date).toDate();
    return ((fromDate >= orderFromDate && fromDate < orderToDate) || (toDate > orderFromDate && toDate <= orderToDate));
  }

  getProductAvailability(modelId: string, productId: string, id: string, fromDate: Date, toDate: Date): Promise<any> {
    return new Promise((resolve, reject) => {
      this.firestore.collection('orderDetails', ref =>
        ref.where('payment_status', '==', 'paid')
          .where('product_Id', '==', productId)
      ).valueChanges().pipe(
        map((orders: any[]) => {
          let totalBookedQty = 0;
          if (orders.length > 0) {
            orders.forEach(order => {
              if (this.isOrderWithinDateRange(order, fromDate, toDate)) {
                // Iterate over each booking and check if any of its productIds arrays contain the productId
                if (Array.isArray(order.product_model)) {
                  if (order.product_model.some(item => item.modelId === modelId)) {
                    totalBookedQty += 1;
                  }
                }
              }
            });
          }
          // For simplicity, assuming product quantity is stored elsewhere, adapt as necessary
          // Here you should fetch the total available quantity of the product from your products collection
          // Example total available quantity, replace with actual logic
          var totalAvailableQty;
          try {
            this.firestore.collection('products', ref =>
              ref.where('productId', '==', productId)
                .where('id', '==', id)
            ).valueChanges().pipe(
              map((product: any) => {
                if (product && Array.isArray(product[0].modelDet)) {
                  // Find the array within modelDet that matches the given modelId
                  const modelArray = product[0].modelDet.find((model: any) => model.modelId === modelId);
                  // If modelArray is found, extract the desired field value
                  if (modelArray) {
                    totalAvailableQty = modelArray["availableQty"];
                    const remainingQty = Number(totalAvailableQty) - Number(totalBookedQty);
                    resolve(remainingQty);
                  } else {
                    resolve(null); // Resolve with null if modelId is not found
                  }
                } else {
                  resolve(null); // Resolve with null if product, modelDet, or modelDet is not found or not an array
                }
              })
            ).subscribe(() => { }, reject);

          } catch (error) {
            reject(error);
          }
        })
      ).subscribe(() => { }, reject); // Subscribe to handle errors
    });
  }


  getAvailableQuantity(itemId: string, productId, startDate: Date, endDate: Date, modelId: any): Promise<number> {
    return new Promise((resolve, reject) => {
      this.firestore.collection('products', ref =>
        ref.where('productId', '==', productId)
          .where('id', '==', itemId)
      ).valueChanges().pipe(
        map((product: any) => {
          if (product && Array.isArray(product[0].modelDet)) {
            // Find the array within modelDet that matches the given modelId
            const modelArray = product[0].modelDet.find((model: any) => model.modelId === modelId);
            // If modelArray is found, extract the desired field value
            if (modelArray) {
              const totalQuantity = modelArray["availableQty"]
              const bookedQuantity = product[0].bookings.reduce((acc, booking) => {
                if (booking.booking_start_date.toDate() < endDate && booking.booking_end_date.toDate() > startDate) {
                  // Booking overlaps with search range
                  const bookingStart = booking.booking_start_date.toDate() < startDate ? startDate : booking.booking_start_date.toDate();
                  const bookingEnd = booking.booking_end_date.toDate() > endDate ? endDate : booking.booking_end_date.toDate();
                  const duration = bookingEnd.getTime() - bookingStart.getTime();
                  const daysBooked = Math.ceil(duration / (1000 * 3600 * 24));
                  return acc + daysBooked;
                }
                return acc;
              }, 0);
              const availableQuantity = totalQuantity - bookedQuantity;
              resolve(availableQuantity);
            } else {
              resolve(null); // Resolve with null if modelId is not found
            }
          } else {
            resolve(null); // Resolve with null if product, modelDet, or modelDet is not found or not an array
          }
        })
      ).subscribe(() => { }, reject);
    });
  }
  // Update a document
  createwithUid(collectionName: string, uid: string, data: any): Promise<void> {
    return this.firestore.collection(collectionName).doc(uid).set(data);
  }
  sendEmail(emailData: { to: string, subject: string, text: string }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/send-email`, emailData);
  }
  get nativeWindow(): any {
    return _window();
  }

  // Delete a document
  delete(collectionName: string, documentId: string): Promise<void> {
    return this.firestore.collection(collectionName).doc(documentId).delete();
  }

  createOrder(amount: number): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/create-order`, { amount });
  }

  getLoginDetailFromLocalStorage(): Observable<any> {
    const localStorageArray = localStorage.getItem('currentUser');
    if (localStorageArray) {
      const data = JSON.parse(localStorageArray);
      return of(data); // Wrapping the data in `of` to create an Observable
    } else {
      return of(null); // Return an Observable with null if no data found
    }
  }
  isUIDAvailable(uid: string, collectionName: string): Observable<boolean> {
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

  getOrderDetail(orderId: string): Promise<any> {
    return this.http.get<any>(`${environment.apiUrl}/payment-status/${orderId}`).toPromise();
  }

  getPaymentDetail(paymentId: string): Promise<any> {
    return this.http.get<any>(`${environment.apiUrl}/payment-details/${paymentId}`).toPromise();
  }


  // // Function to update a specific array within the inner array of a document
  // updateSpecificArray(collectionName: string, documentId: string, innerArrayIndex: number, innerArrayFieldName: string, newArray: any[]): Promise<void> {
  //   return new Promise<void>((resolve, reject) => {
  //     const documentRef = this.firestore.collection(collectionName).doc(documentId);

  //     // Get the document
  //     documentRef.get().subscribe((doc) => {
  //       if (doc.exists) {
  //         var array = doc.data() as any;
  //         var innerArray;
  //         if (array.hasOwnProperty(innerArrayFieldName)) {
  //           innerArray = array[innerArrayFieldName];
  //         } else {
  //           throw new Error(`Field ${innerArrayFieldName} not found in document`);
  //         }
  //         // Update the specific array within the inner array
  //         innerArray[innerArrayIndex] = newArray;

  //         const updateObject = {};
  //         updateObject[innerArrayFieldName] = innerArray;

  //         // Update the document with the modified inner array
  //         documentRef.update(updateObject)
  //           .then(() => {
  //             console.log("Specific array updated successfully");
  //             resolve();
  //           })
  //           .catch((error) => {
  //             console.error("Error updating specific array: ", error);
  //             reject(error);
  //           });
  //       } else {
  //         console.error("Document does not exist");
  //         reject("Document does not exist");
  //       }
  //     });
  //   });
  // }




  placeOrder(itemId: string, bookingData: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const docRef = this.firestore.collection('products').doc(itemId);

      docRef.get().toPromise()
        .then(doc => {
          if (!doc.exists) {
            throw new Error('Document does not exist');
          }
          const docData = doc.data() as any;
          if (docData.hasOwnProperty('bookings')) {
            // Append bookingData to existing bookings array
            var existingBookings=[];
            existingBookings.push(bookingData);
            existingBookings.push(docData.bookings);
            const flattenedBookings = [].concat.apply([], existingBookings);
            return docRef.update({ bookings: flattenedBookings });
          }
        })
        .then(() => {
          console.log('Booking added successfully');
          resolve('Booking added successfully');
        })
        .catch(error => {
          console.error('Error adding booking:', error);
          reject(error);
        });
    });
  }

  cancelOrder(itemId: string, bookingData: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.firestore.collection('products').doc(itemId).get().toPromise()
        .then((doc) => {
          if (doc.exists) {
            var docData=doc.data() as any;
            const bookingsArray = docData.bookings || [];
            const updatedBookings = bookingsArray.filter((booking: any) =>
            booking.booking_id !== bookingData.booking_id
            );
            return this.firestore.collection('products').doc(itemId).update({ bookings: updatedBookings });
          } else {
            throw new Error('Document not found');
          }
        })
        .then(() => {
          console.log('Order canceled successfully');
          resolve('Order canceled successfully');
        })
        .catch((error) => {
          console.error('Error canceling order:', error);
          reject(error);
        });
    });
  }


  isTimeRangeAvailable(item: any, startTime: Date, endTime: Date): boolean {
    return !item.bookings.some(booking =>
      (startTime >= booking.startTime.toDate() && startTime < booking.endTime.toDate()) ||
      (endTime > booking.startTime.toDate() && endTime <= booking.endTime.toDate()));
  }
}


