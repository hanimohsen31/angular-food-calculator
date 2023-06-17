import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { Product } from './product';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OperationsService {
  initialProduct = {
    FoodID: '',
    ShortFoodName: '',
    Translation: '',
    Measure: 0,
    Energy: 0,
    Protein: 0,
    Fat: 0,
    Carbohydrate: 0,
    Quantity: 1,
  };
  // user
  user = localStorage.getItem('user') || '';
  userId = JSON.parse(this.user).uid;
  url = `${environment.database.url}/users/${this.userId}.json`;
  // sumArray
  sumArray = new BehaviorSubject<any[]>([]);
  sumArrayAction$ = this.sumArray.asObservable();
  // finalSum[{}]
  finalSum = new BehaviorSubject<any>([]);
  finalSumAction$ = this.finalSum.asObservable();

  constructor(private _HttpClient: HttpClient) {
    let userData: any = this.handleCloude('get').subscribe((res: any) => {
      userData = res;
      if (userData) {
        this.sumArray.next(res.sumArray);
        this.finalSum.next(res.finalSum);
      } else {
        this.sumArray.next([]);
        this.finalSum.next([]);
      }
    });
  }

  handleChange() {
    let getterArr = this.sumArray.getValue();
    console.log(getterArr);
    let finalSumContainer: any = this.initialProduct;
    getterArr.map((elm: any) => {
      finalSumContainer = {
        FoodID: 'Sum',
        ShortFoodName: 'Sum',
        Translation: 'المجموع',
        Measure: +finalSumContainer.Measure + +elm.Measure * +elm.Quantity,
        Energy: +finalSumContainer.Energy + +elm.Energy * +elm.Quantity,
        Protein: +finalSumContainer.Protein + +elm.Protein * +elm.Quantity,
        Fat: +finalSumContainer.Fat + +elm.Fat * +elm.Quantity,
        Carbohydrate:
          +finalSumContainer.Carbohydrate + +elm.Carbohydrate * +elm.Quantity,
        Quantity: 1,
      };
    });
    this.finalSum.next([finalSumContainer]);
    this.handleCloude('put', {
      sumArray: this.sumArray.getValue(),
      finalSum: this.finalSum.getValue(),
    }).subscribe();
  }

  handleCloude(method: string, data?: any): Observable<any> {
    if (method === 'get') {
      return this._HttpClient.get(this.url);
    } else if (method === 'post') {
      return this._HttpClient.post(this.url, data);
    } else if (method === 'put') {
      return this._HttpClient.put(this.url, data);
    } else if (method === 'delete') {
      return this._HttpClient.delete(this.url);
    } else {
      return EMPTY;
    }
  }

  // handle add
  handleAdd(element: any) {
    let getterArr = this.sumArray.getValue();
    getterArr.push(element);
    this.sumArray.next(getterArr);
    this.handleChange();
  }

  // handle remove
  handleRemove(index: any) {
    let getterArr = this.sumArray.getValue();
    console.log(getterArr);
    getterArr.splice(index, 1);
    this.sumArray.next(getterArr);
    this.handleChange();
    this.sumArray.getValue().length === 0 ? this.handleClear() : true;
  }

  // handle clear
  handleClear() {
    this.handleCloude('delete').subscribe((res) => {
      this.sumArray.next([]);
      this.finalSum.next([]);
    });
  }
}
