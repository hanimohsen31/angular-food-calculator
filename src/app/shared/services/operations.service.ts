import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OperationsService {
  // user
  user = localStorage.getItem('user') || '';
  userId = JSON.parse(this.user).uid;
  url = `${environment.database.url}/users/${this.userId}`;
  targetEnergy = 2000;

  // added Food List
  addedFoodList = new BehaviorSubject<any[]>([]);
  addedFoodList$ = this.addedFoodList.asObservable();

  // sum result object
  sumResult = new BehaviorSubject({});
  sumResult$ = this.sumResult.asObservable();

  // target result object
  targetResult = new BehaviorSubject({});
  targetResult$ = this.targetResult.asObservable();

  constructor(private HttpClient: HttpClient) {}

  ngOnInit() {}

  // handle add
  handleAdd(element: any) {
    let overAllArray = this.addedFoodList.getValue();
    let DoAction = false;
    let existed = overAllArray?.find((elm: any) => elm?.FoodID == element?.FoodID);
    existed ? null : (DoAction = true);
    if (DoAction) {
      overAllArray.push(element);
      this.addedFoodList.next(overAllArray);
      this.handleChange();
    }
  }

  // handle remove
  handleRemove(index: any) {
    let overAllArray = this.addedFoodList.getValue();
    overAllArray.splice(index, 1);
    this.addedFoodList.next(overAllArray);
    this.handleChange();
    this.addedFoodList.getValue().length === 0 ? this.handleClear() : true;
  }

  // handle clear
  handleClear() {
  let url = `${environment.database.url}/users/${this.userId}.json`;
    return this.HttpClient.delete(url).subscribe({
      next: (res) => this.addedFoodList.next([]),
    });
  }

  calculateSumResult() {
    let addedFoodListValue = this.addedFoodList.getValue();
    let sumResult: any = {
      Quantity: 1,
      Measure: 0,
      Energy: 0,
      Protein: 0,
      Fat: 0,
      Carbohydrate: 0,
    };
    addedFoodListValue.map((elm: any) => {
      sumResult.ShortFoodName = 'Sum';
      sumResult.Translation = 'المجموع';
      sumResult.Quantity = 1;
      sumResult.Measure += elm.Measure * elm.Quantity;
      sumResult.Energy += elm.Energy * elm.Quantity;
      sumResult.Protein += elm.Protein * elm.Quantity;
      sumResult.Fat += elm.Fat * elm.Quantity;
      sumResult.Carbohydrate += elm.Carbohydrate * elm.Quantity;
    });
    this.sumResult.next(sumResult);
  }

  calculateTargetResult() {
    let sumResultValue: any = this.sumResult.getValue()
    sumResultValue = {
      Energy: (sumResultValue.Energy / 2000) * 100,
      Protein: ((sumResultValue.Protein * 4) / (2000 * 0.2)) * 100,
      Fat: ((sumResultValue.Fat * 9) / (2000 * 0.3)) * 100,
      Carbohydrate: ((sumResultValue.Carbohydrate * 4) / (2000 * 0.5)) * 100,
    };
    this.targetResult.next(sumResultValue)
  }

  handleChange() {
    let url = `${environment.database.url}/users/${this.userId}.json`;
    this.calculateSumResult();
    this.calculateTargetResult();
    this.HttpClient.put(url, {
      addedFoodList: this.addedFoodList.getValue(),
    }).subscribe();
  }

  // handle save tracking data
  saveUserTrackingData(data: any) {
    let id = this.getNowDateString();
    const user: any = localStorage.getItem('user');
    const uid = JSON.parse(user).uid;
    let url = `${environment.database.url}/tracking/${uid}/${id}.json`;
    data = { ...data, id: id };
    return this.HttpClient.put(url, data);
  }

  // helper function
  getNowDateString() {
    let date = new Date();
    let hour = date.toLocaleTimeString(); // "1:35:47 AM"
    let dayFormatted = date.toLocaleDateString().split('/')[1]; // "7/17/2023"
    let dateFormatted = date.toDateString(); // "Mon Jul 17 2023" "MonJul172023"
    if (hour.slice(-2) == 'AM') {
      let day = +dayFormatted - 1;
      let actualDate = dateFormatted.slice(0, 8) + day + dateFormatted.slice(11);
      return actualDate.replaceAll(' ', '');
    } else {
      let actualDay = dateFormatted.replaceAll(' ', '');
      return actualDay;
    }
  }

  // helper function
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
        return val.slice(0, 3) + ' ' + val.slice(3, 6) + ' ' + val.slice(6, 8) + ' ' + val.slice(8);
      };
      if (!value) {
        value = 'Sat Jan 01 2020';
      }
      return date(value);
    }
  }
}
