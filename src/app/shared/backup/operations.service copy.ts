import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
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

  // targetEnergy
  targetEnergy = new BehaviorSubject<any>(2000);
  targetEnergyAction$ = this.targetEnergy.asObservable();

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

    this.getTargetEnergy().subscribe({
      next: (res) => {
        res && res?.Energy
          ? this.targetEnergy.next(res?.Energy)
          : this.targetEnergy.next(2000);
      },
      error: (err) => null,
    });
  }

  handleChange() {
    let getterArr = this.sumArray.getValue();
    let finalSumContainer: any = this.initialProduct;
    getterArr.map((elm: any) => {
      finalSumContainer = {
        FoodID: 'Sum',
        ShortFoodName: 'Sum',
        Translation: 'المجموع',
        Measure: (+finalSumContainer.Measure + +elm.Measure * +elm.Quantity).toFixed(2),
        Energy: (+finalSumContainer.Energy + +elm.Energy * +elm.Quantity).toFixed(2),
        Protein: (+finalSumContainer.Protein + +elm.Protein * +elm.Quantity).toFixed(2),
        Fat: (+finalSumContainer.Fat + +elm.Fat * +elm.Quantity).toFixed(2),
        Carbohydrate:
          (+finalSumContainer.Carbohydrate + +elm.Carbohydrate * +elm.Quantity).toFixed(2),
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

  // personal data
  changeTargetEnergy(object: any): Observable<any> {
    let url = `${environment.database.url}/personal/${this.userId}.json`;
    this.targetEnergy.next(object?.Energy);
    return this._HttpClient.put(url, object);
  }

  getTargetEnergy(): Observable<any> {
    let url = `${environment.database.url}/personal/${this.userId}.json`;
    return this._HttpClient.get(url);
  }

  dateFormater(value: string) {
    let date = (val: any) => {
      return val.slice(0, 4) + '-' + val.slice(4, 6) + '-' + val.slice(6, 8);
    };
    if (!value) {
      value = '20200101';
    }
    if (value.length == 8) {
      let x = new Date(date(value));
      return x.toDateString();
    } else {
      let date = (val: any) => {
        return (
          val.slice(0, 3) +
          ' ' +
          val.slice(3, 6) +
          ' ' +
          val.slice(6, 8) +
          ' ' +
          val.slice(8)
        );
      };
      if (!value) {
        value = 'Sat Jan 01 2020';
      }
      return date(value);
    }
  }

}
