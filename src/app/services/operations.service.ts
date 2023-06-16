import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from './product';

@Injectable({
  providedIn: 'root',
})
export class OperationsService {
  initialProduct = {};

  sumArray = new BehaviorSubject<any[]>([]);
  sumArrayAction$ = this.sumArray.asObservable();

  finalSum = new BehaviorSubject<any>([]);
  finalSumAction$ = this.finalSum.asObservable();

  constructor() {
    let sumArrayScoped: any = localStorage.getItem('sumArray');
    let finalSumScoped: any = localStorage.getItem('finalSum');
    if (sumArrayScoped) {
      this.sumArray.next(JSON.parse(sumArrayScoped));
      this.finalSum.next(JSON.parse(finalSumScoped));
      this.initialProduct = JSON.parse(finalSumScoped)[0];
    } else {
      this.sumArray.next([]);
      this.finalSum.next([]);
      this.initialProduct = {
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
    }
  }

  handleChange() {
    let getterArr = this.sumArray.getValue();
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
    localStorage.setItem('sumArray', JSON.stringify(this.sumArray.getValue()));
    localStorage.setItem('finalSum', JSON.stringify(this.finalSum.getValue()));
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
    this.sumArray.getValue().length === 0 ? this.handleClear() : true
  }

  // handle clear
  handleClear() {
    localStorage.removeItem('sumArray');
    localStorage.removeItem('finalSum');
    this.sumArray.next([]);
    this.finalSum.next([]);
  }
}
