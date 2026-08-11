import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { FoodDataService } from './food-data.service';

@Injectable({
  providedIn: 'root',
})
export class OperationsService {
  // a guest calculates without an account, so the added food list is kept in
  // this browser instead of under a user entry on the server
  guestStorageKey = 'guestAddedFoodList';

  // the daily calorie target is a setting of this browser, it is kept out of the
  // user entry so saving the food list never overwrites it
  targetStorageKey = 'targetEnergy';
  defaultTargetEnergy = 2000;

  // the target calories are split over the macros, and a gram of each macro
  // carries these calories, so a calorie target becomes a target in grams. the
  // split follows the goal the day is eaten for, so it is a setting like the
  // target itself
  splitStorageKey = 'macroSplit';
  defaultMacroSplit: any = { Fat: 0.3, Carbohydrate: 0.5, Protein: 0.2 };
  macroSplit: any = this.loadMacroSplit();
  caloriesPerGram: any = { Fat: 9, Carbohydrate: 4, Protein: 4 };

  // read on every use, the session can start or end while the service lives
  get userId(): string {
    let user = localStorage.getItem('user');
    if (!user) {
      return '';
    }
    try {
      return JSON.parse(user)?.uid || '';
    } catch (error) {
      return '';
    }
  }

  get isGuest(): boolean {
    return !this.userId;
  }

  get url(): string {
    return `${environment.database.url}/users/${this.userId}.json`;
  }

  // added Food List
  addedFoodList = new BehaviorSubject<any[]>([]);
  addedFoodList$ = this.addedFoodList.asObservable();

  // sum result object
  sumResult = new BehaviorSubject({});
  sumResult$ = this.sumResult.asObservable();

  // the calorie target typed on the table, and the targets it derives
  targetEnergy = new BehaviorSubject<number>(this.loadTargetEnergy());
  targetEnergy$ = this.targetEnergy.asObservable();
  targetResult = new BehaviorSubject<any>({});
  targetResult$ = this.targetResult.asObservable();

  constructor(
    private HttpClient: HttpClient,
    private FoodDataService: FoodDataService
  ) {
    this.calculateTargetResult();
  }

  ngOnInit() {}

  // nutrient values are stored per the item Measure (100 gm for most items),
  // quantities are typed in the measure unit itself, so a value is brought down
  // to a single unit before it is multiplied by the typed quantity
  unitFactor(item: any) {
    let measure = +item?.Measure || 0;
    let quantity = +item?.Quantity || 0;
    return measure > 0 ? quantity / measure : 0;
  }

  // scaled value of one nutrient for the quantity typed on the row
  scale(item: any, key: string) {
    return (+item?.[key] || 0) * this.unitFactor(item);
  }

  // rows saved before quantities moved to gm kept the quantity as a number of
  // measures, they are converted once on load so the whole app speaks in gm
  normalizeItem(item: any) {
    if (item?.QuantityBasis === 'unit') {
      return item;
    }
    return {
      ...item,
      QuantityBasis: 'unit',
      Quantity: (+item?.Quantity || 0) * (+item?.Measure || 0),
    };
  }

  normalizeAddedFoodList(list: any[]) {
    return (list || []).map((elm: any) => this.normalizeItem(elm));
  }

  // handle add
  handleAdd(element: any) {
    let overAllArray = this.addedFoodList.getValue();
    let DoAction = false;
    let existed = overAllArray?.find((elm: any) => elm?.FoodID == element?.FoodID);
    existed ? null : (DoAction = true);
    if (DoAction) {
      // a copy so editing the quantity does not touch the row in the food table,
      // and a new row starts at one full measure of the item
      overAllArray.push({
        ...element,
        QuantityBasis: 'unit',
        Quantity: +element?.Measure || 0,
      });
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
    if (this.isGuest) {
      localStorage.removeItem(this.guestStorageKey);
      this.addedFoodList.next([]);
      this.calculateSumResult();
      return;
    }
    return this.HttpClient.delete(this.url).subscribe({
      next: (res) => this.addedFoodList.next([]),
    });
  }

  // the list of whoever is behind the calculator right now, the user entry on
  // the server or the one this browser holds for a guest
  loadAddedFoodList() {
    if (this.isGuest) {
      this.loadGuestAddedFoodList();
      return;
    }
    this.FoodDataService.getUserAddedFoodList().subscribe({
      next: (res: any) => {
        this.addedFoodList.next(res ? this.normalizeAddedFoodList(res) : []);
        this.calculateSumResult();
      },
    });
  }

  // the session ended, so the list of the user who just left has to go with it.
  // the table is put back to what a guest landing on the page would see, which
  // is the list this browser built before, or nothing at all
  resetToGuest() {
    this.addedFoodList.next([]);
    this.sumResult.next({});
    this.loadGuestAddedFoodList();
  }

  // the list a guest built in this browser
  loadGuestAddedFoodList() {
    let stored = localStorage.getItem(this.guestStorageKey);
    if (!stored) {
      this.addedFoodList.next([]);
      this.calculateSumResult();
      return;
    }
    try {
      this.addedFoodList.next(this.normalizeAddedFoodList(JSON.parse(stored)));
    } catch (error) {
      localStorage.removeItem(this.guestStorageKey);
      this.addedFoodList.next([]);
    }
    this.calculateSumResult();
  }

  calculateSumResult(){
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
      // the typed quantity is already the amount eaten, the nutrients are scaled
      // down from the item measure to a single unit first
      sumResult.Measure += +elm.Quantity || 0;
      sumResult.Energy += this.scale(elm, 'Energy');
      sumResult.Protein += this.scale(elm, 'Protein');
      sumResult.Fat += this.scale(elm, 'Fat');
      sumResult.Carbohydrate += this.scale(elm, 'Carbohydrate');
    });
    this.sumResult.next(sumResult)
    this.calculateTargetResult();
  }

  // the target this browser was last set to, 2000 kcal until one is typed
  loadTargetEnergy(): number {
    let stored = +(localStorage.getItem(this.targetStorageKey) || 0);
    return stored > 0 ? stored : this.defaultTargetEnergy;
  }

  // the split this browser was last set to, the even one until a goal sets it
  loadMacroSplit(): any {
    let stored = localStorage.getItem(this.splitStorageKey);
    if (!stored) {
      return { ...this.defaultMacroSplit };
    }
    try {
      let split = JSON.parse(stored);
      let keys = Object.keys(this.defaultMacroSplit);
      // a split that does not carry all three macros is not one
      let usable = keys.every((key: string) => +split?.[key] > 0);
      return usable ? split : { ...this.defaultMacroSplit };
    } catch (error) {
      localStorage.removeItem(this.splitStorageKey);
      return { ...this.defaultMacroSplit };
    }
  }

  handleMacroSplitChange(split: any) {
    this.macroSplit = split || { ...this.defaultMacroSplit };
    localStorage.setItem(this.splitStorageKey, JSON.stringify(this.macroSplit));
    this.calculateTargetResult();
  }

  handleTargetEnergyChange(value: any) {
    let energy = +value || 0;
    energy = energy > 0 ? energy : 0;
    localStorage.setItem(this.targetStorageKey, String(energy));
    this.targetEnergy.next(energy);
    this.calculateTargetResult();
  }

  // what the target calories allow of every macro, and how much of each the day
  // has eaten so far
  calculateTargetResult() {
    let sum: any = this.sumResult.getValue();
    let energy = this.targetEnergy.getValue();
    let gramsOf = (key: string) =>
      (energy * this.macroSplit[key]) / this.caloriesPerGram[key];
    let percentOf = (value: any, target: number) =>
      target > 0 ? ((+value || 0) / target) * 100 : 0;
    let fatTarg = gramsOf('Fat');
    let carbTarg = gramsOf('Carbohydrate');
    let proTrg = gramsOf('Protein');
    this.targetResult.next({
      enrgTrg: energy,
      enrgPer: percentOf(sum?.Energy, energy),
      fatTarg: fatTarg,
      fatPerc: percentOf(sum?.Fat, fatTarg),
      carbTarg: carbTarg,
      carbPer: percentOf(sum?.Carbohydrate, carbTarg),
      proTrg: proTrg,
      proPer: percentOf(sum?.Protein, proTrg),
    });
  }

  // the table follows a quantity as it is typed. only the sums are redone here,
  // the list is written away once the field is left, a request on every key is
  // not something the typing should carry
  handleInput() {
    this.calculateSumResult();
  }

  handleChange() {
    this.calculateSumResult();
    if (this.isGuest) {
      localStorage.setItem(
        this.guestStorageKey,
        JSON.stringify(this.addedFoodList.getValue())
      );
      return;
    }
    this.HttpClient.put(this.url, {
      addedFoodList: this.addedFoodList.getValue(),
    }).subscribe();
  }

  // handle save tracking data
  // a tracked day is kept beside the user entries, under tracking/{uid}/{day},
  // which is where the tracking page reads it back from
  saveUserTrackingData(data: any) {
    if (this.isGuest) {
      return EMPTY;
    }
    let id = this.getNowDateString();
    const url = `${environment.database.url}/tracking/${this.userId}/${id}.json`;
    data = { ...data, id: id };
    return this.HttpClient.put(url, data);
  }

  // helper function
  // the day a save belongs to, as "MonJul172023". A calculator still open
  // before noon is counted against the day before, the list is filled through
  // the evening
  getNowDateString() {
    let date = new Date();
    let hour = date.toLocaleTimeString(); // "1:35:47 AM"
    if (hour.slice(-2) == 'AM') {
      date.setDate(date.getDate() - 1);
    }
    return date.toDateString().replaceAll(' ', ''); // "Mon Jul 17 2023"
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
