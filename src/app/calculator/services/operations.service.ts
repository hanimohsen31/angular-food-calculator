import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { FoodDataService } from './food-data.service';
import { settingsFromApi, settingsToApi, trackingDayToApi } from './api-mapper';
import { aiExportDate } from './ai-nutrition-export';
import { storedToken, storedUserId } from 'src/app/auth/session';

@Injectable({
  providedIn: 'root',
})
export class OperationsService {
  guestStorageKey = 'guestAddedFoodList';
  guestSettingsKey = 'settings';
  legacySettingsKeys: any = {
    targetEnergy: 'targetEnergy',
    macroSplit: 'macroSplit',
    targetProfile: 'targetProfile',
    updatedAt: 'settingsUpdatedAt',
  };

  defaultTargetEnergy = 2000;
  defaultMacroSplit: any = { Fat: 0.3, Carbohydrate: 0.5, Protein: 0.2 };
  caloriesPerGram: any = { Fat: 9, Carbohydrate: 4, Protein: 4 };
  defaultTargetProfile: any = {
    Gender: 'male',
    Age: 30,
    Weight: 70,
    Height: 170,
    BodyFat: 20,
    // which equation the resting burn is read off, and which of the fields
    // beside it the target page is working from
    Formula: 'mifflin',
    Activity: 1.375,
    ActivityCustom: 1.4,
    Goal: 'keep',
    GoalCustom: -500,
    MacroMethod: 'goal',
    SplitProtein: 20,
    SplitFat: 30,
    SplitCarbs: 50,
    ProteinPerKg: 2.0,
    FatPerKg: 0.8,
  };

  macroSplit: any = this.loadMacroSplit();

  get userId(): string {
    return storedUserId();
  }

  // a session is a token, the user entry beside it is only what it is read as.
  // without one there is nobody for the server to keep anything under
  get isGuest(): boolean {
    return !storedToken();
  }

  // the working list and the settings are one document on the server, the list
  // rides along inside it
  get settingsUrl(): string {
    return `${environment.baseUrl}${environment.apiPrefix}/settings`;
  }

  get settingsKey(): string {
    return this.isGuest ? this.guestSettingsKey : `${this.guestSettingsKey}_${this.userId}`;
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

  // the body the target page was last filled in with, held here rather than on
  // the page so it travels with the rest of the settings
  targetProfile = new BehaviorSubject<any>(this.loadTargetProfile());
  targetProfile$ = this.targetProfile.asObservable();

  // a settings write waits for the typing to stop. the target row and the body
  // form both change on every key, and none of those keys is worth a request
  private settingsTouched = new Subject<void>();

  // a change that the wait is still sitting on, it has not been written yet
  private settingsPending = false;

  constructor(
    private HttpClient: HttpClient,
    private FoodDataService: FoodDataService,
  ) {
    this.settingsTouched.pipe(debounceTime(800)).subscribe(() => this.pushSettings());
    this.calculateTargetResult();
    // a session can already be open when the app starts, the settings of
    // whoever it belongs to are pulled before anything is read off the browser
    this.loadSettings();
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
    let row = this.stampItem(item);
    if (row?.QuantityBasis === 'unit') {
      return row;
    }
    return {
      ...row,
      QuantityBasis: 'unit',
      Quantity: (+row?.Quantity || 0) * (+row?.Measure || 0),
    };
  }

  // rows added before the moment was kept only carry the day they were filed
  // under. the stamp is filled in from that day here, on the way in, because the
  // server stamps whatever reaches it without one as of now, which would read
  // an old row back as a row added today
  stampItem(item: any) {
    if (+item?.stamp > 0 || !item?.AddedOn) {
      return item;
    }
    let day = aiExportDate(item.AddedOn);
    // midday, so the hour is not one the day is shifted back off
    let moment = day ? new Date(`${day}T12:00:00`) : null;
    if (!moment || isNaN(moment.getTime())) {
      return item;
    }
    return { ...item, stamp: moment.getTime() };
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
        // the moment the row was put on the list, and the day that moment falls
        // under. a save reads these back and is filed under the day most of the
        // list was built on. the stamp is the field the server holds a row by
        stamp: Date.now(),
        AddedOn: this.getNowDateString(),
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
    return this.HttpClient.patch(this.settingsUrl, { addedFoodList: [] }).subscribe({
      next: () => {
        this.addedFoodList.next([]);
        this.calculateSumResult();
      },
    });
  }

  // the list of whoever is behind the calculator right now, the user entry on
  // the server or the one this browser holds for a guest
  loadAddedFoodList() {
    if (this.isGuest) {
      this.loadGuestAddedFoodList();
      return;
    }
    this.HttpClient.get(this.settingsUrl).subscribe({
      next: (res: any) => {
        let list = res?.data?.addedFoodList || [];
        this.addedFoodList.next(this.normalizeAddedFoodList(list));
        this.calculateSumResult();
      },
      error: (error) => console.log(error),
    });
  }

  // the session ended, so the list of the user who just left has to go with it.
  // the table is put back to what a guest landing on the page would see, which
  // is the list this browser built before, or nothing at all, and the target it
  // is read against goes back to the one of the browser the same way
  resetToGuest() {
    this.addedFoodList.next([]);
    this.sumResult.next({});
    this.loadGuestAddedFoodList();
    this.resetSettingsToGuest();
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

  calculateSumResult() {
    let addedFoodListValue = this.addedFoodList.getValue();
    let sumResult: any = {
      Quantity: 1,
      Measure: 0,
      Energy: 0,
      Protein: 0,
      Fat: 0,
      Carbohydrate: 0,
      // stored on the day beside the rest, so it is summed like the rest
      Sugars: 0,
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
      sumResult.Sugars += this.scale(elm, 'Sugars');
    });
    this.sumResult.next(sumResult);
    this.calculateTargetResult();
  }

  // ------------------------------ settings storage ------------------------------
  // the settings this browser holds for whoever is behind the calculator
  readStoredSettings(): any {
    let stored = localStorage.getItem(this.settingsKey);
    if (!stored) {
      return this.readLegacySettings();
    }
    try {
      return JSON.parse(stored) || {};
    } catch (error) {
      localStorage.removeItem(this.settingsKey);
      return {};
    }
  }

  // the three keys the settings were kept under before they moved together,
  // read once, written back as one and taken out of the browser
  readLegacySettings(): any {
    let energy = +(localStorage.getItem(this.legacySettingsKeys.targetEnergy) || 0);
    let split = localStorage.getItem(this.legacySettingsKeys.macroSplit);
    let profile = localStorage.getItem(this.legacySettingsKeys.targetProfile);
    let stamp = +(localStorage.getItem(this.legacySettingsKeys.updatedAt) || 0);
    if (!energy && !split && !profile) {
      return {};
    }
    let settings: any = { updatedAt: stamp };
    try {
      settings.targetEnergy = energy;
      settings.macroSplit = split ? JSON.parse(split) : null;
      settings.targetProfile = profile ? JSON.parse(profile) : null;
    } catch (error) {
      // a corrupted key is not a setting, whatever else was read still stands
    }
    Object.keys(this.legacySettingsKeys).map((key: string) =>
      localStorage.removeItem(this.legacySettingsKeys[key]),
    );
    this.writeStoredSettings(settings);
    return settings;
  }

  writeStoredSettings(settings: any) {
    localStorage.setItem(this.settingsKey, JSON.stringify(settings));
  }

  // a setting changed, so the whole set is written back under whoever it
  // belongs to, together with the moment it was changed
  storeSettings(stamp: number) {
    this.writeStoredSettings({ ...this.currentSettings(), updatedAt: stamp });
  }

  // the target this browser was last set to, 2000 kcal until one is typed
  loadTargetEnergy(): number {
    let stored = +this.readStoredSettings()?.targetEnergy || 0;
    return stored > 0 ? stored : this.defaultTargetEnergy;
  }

  // a split that does not carry all three macros is not one
  usableSplit(split: any): any {
    let keys = Object.keys(this.defaultMacroSplit);
    let usable = keys.every((key: string) => +split?.[key] > 0);
    return usable ? split : null;
  }

  // the split this browser was last set to, the even one until a goal sets it
  loadMacroSplit(): any {
    let stored = this.usableSplit(this.readStoredSettings()?.macroSplit);
    return stored || { ...this.defaultMacroSplit };
  }

  // the body this browser last worked a target out from
  loadTargetProfile(): any {
    let stored = this.readStoredSettings()?.targetProfile;
    return { ...this.defaultTargetProfile, ...(stored || {}) };
  }

  handleMacroSplitChange(split: any) {
    this.macroSplit = split || { ...this.defaultMacroSplit };
    this.calculateTargetResult();
    this.touchSettings();
  }

  handleTargetEnergyChange(value: any) {
    let energy = +value || 0;
    energy = energy > 0 ? energy : 0;
    this.targetEnergy.next(energy);
    this.calculateTargetResult();
    this.touchSettings();
  }

  handleTargetProfileChange(profile: any) {
    this.targetProfile.next({
      ...this.defaultTargetProfile,
      ...(profile || {}),
    });
    this.touchSettings();
  }

  // ------------------------------ settings sync ------------------------------
  // the settings on the calculator right now, as they would be written
  currentSettings(): any {
    return {
      targetEnergy: this.targetEnergy.getValue(),
      macroSplit: this.macroSplit,
      targetProfile: this.targetProfile.getValue(),
      updatedAt: this.loadSettingsStamp(),
    };
  }

  loadSettingsStamp(): number {
    return +this.readStoredSettings()?.updatedAt || 0;
  }

  // a setting was changed here, so this browser now holds the newest of them,
  // and the user entry is behind until the write lands
  touchSettings() {
    this.storeSettings(Date.now());
    if (this.isGuest) {
      return;
    }
    this.settingsPending = true;
    this.settingsTouched.next();
  }

  pushSettings() {
    if (this.isGuest) {
      return;
    }
    this.settingsPending = false;
    // a browser that never changed a setting still carries a set of them, so
    // the entry it starts is stamped as of now, an unstamped one would be read
    // as older than every device that comes after it
    if (!this.loadSettingsStamp()) {
      this.storeSettings(Date.now());
    }
    // a patch rather than a full write, the working list lives on the same
    // document and a replace would take it with it
    this.HttpClient.patch(this.settingsUrl, settingsToApi(this.currentSettings())).subscribe({
      // the settings are still the ones on the calculator, a failed write is
      // nothing the page has to be pulled back from
      error: (error) => console.log(error),
    });
  }

  // what the user set on any of their devices. nothing is pulled for a guest,
  // there is no entry to pull from and the browser is all there is
  loadSettings() {
    if (this.isGuest) {
      return;
    }
    this.HttpClient.get(this.settingsUrl).subscribe({
      next: (res: any) => {
        let settings = settingsFromApi(res?.data);
        // this is the first device to sign in, so what it holds is what the
        // user has, and the entry is started from it
        if (!settings || !settings.updatedAt) {
          this.pushSettings();
          return;
        }
        // the browser was changed after the entry was last written, which is a
        // device that was used offline or before this one signed in. it is the
        // later of the two, so it is the one that carries over
        if (this.loadSettingsStamp() > settings.updatedAt) {
          this.pushSettings();
          return;
        }
        this.applySettings(settings);
      },
      error: (error) => console.log(error),
    });
  }

  // a set of settings is put on the calculator, the target row and the body form
  // both follow what is handed over here
  applySettingsToState(settings: any) {
    let energy = +settings?.targetEnergy || 0;
    this.targetEnergy.next(energy > 0 ? energy : this.defaultTargetEnergy);
    this.macroSplit = this.usableSplit(settings?.macroSplit) || {
      ...this.defaultMacroSplit,
    };
    this.targetProfile.next({
      ...this.defaultTargetProfile,
      ...(settings?.targetProfile || {}),
    });
    this.calculateTargetResult();
  }

  // settings that came off the user entry are put on the calculator, and kept
  // in this browser too so the next start opens on them before the pull lands
  applySettings(settings: any) {
    this.applySettingsToState(settings);
    this.storeSettings(+settings?.updatedAt || Date.now());
  }

  // the session is ending, so what was pulled down for the user who is leaving
  // is taken out of this browser with it. it is read while the session can
  // still be read, their settings are kept under their own key
  clearUserSettings() {
    if (this.isGuest) {
      return;
    }
    // a change the wait is still sitting on is written now, the wait itself
    // would come round to a browser that has already been signed out of
    if (this.settingsPending) {
      this.pushSettings();
    }
    localStorage.removeItem(this.settingsKey);
  }

  // the target and the body of the user who left go with them, and the
  // calculator is put back on the settings this browser had of its own.
  //
  // nothing is stamped here, this is not a setting being changed. a guest that
  // came out of a session carrying a fresh stamp would sign back in and write
  // its own defaults over the account
  resetSettingsToGuest() {
    this.applySettingsToState(this.readStoredSettings());
  }

  // what the target calories allow of every macro, and how much of each the day
  // has eaten so far
  calculateTargetResult() {
    let sum: any = this.sumResult.getValue();
    let energy = this.targetEnergy.getValue();
    let gramsOf = (key: string) => (energy * this.macroSplit[key]) / this.caloriesPerGram[key];
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
      localStorage.setItem(this.guestStorageKey, JSON.stringify(this.addedFoodList.getValue()));
      return;
    }
    this.HttpClient
      .patch(this.settingsUrl, { addedFoodList: this.addedFoodList.getValue() })
      .subscribe({ error: (error) => console.log(error) });
  }

  // handle save tracking data
  // a tracked day is kept beside the user entries, under tracking/{uid}/{day},
  // which is where the tracking page reads it back from
  saveUserTrackingData(data: any) {
    if (this.isGuest) {
      return EMPTY;
    }
    let id = this.resolveTrackingDayId();
    const url = `${environment.baseUrl}${environment.apiPrefix}/tracking/${id}`;
    // the rows the day was made of are kept beside the totals, the tracking
    // page draws the totals and the history is what the rows are there for
    let items = this.addedFoodList.getValue();
    return this.HttpClient.put(url, trackingDayToApi({ ...data, items }, id));
  }

  // the day the whole list is filed under. a list is built over one sitting, so
  // the day most of its rows were added on is the day it stands for, and one
  // late row does not carry the rest of the list off its own day. rows added
  // before the stamp existed have no day of their own and are left out of the
  // count, a tie goes to the later day, and a list nothing can be read off is
  // saved under today as it always was
  resolveTrackingDayId() {
    let counts = new Map<string, number>();
    this.addedFoodList.getValue().forEach((elm: any) => {
      let day = this.itemDayString(elm);
      if (day) {
        counts.set(day, (counts.get(day) || 0) + 1);
      }
    });
    let winner = '';
    let winnerCount = 0;
    counts.forEach((count: number, day: string) => {
      let ties = count === winnerCount && aiExportDate(day) > aiExportDate(winner);
      if (count > winnerCount || ties) {
        winner = day;
        winnerCount = count;
      }
    });
    return winner || this.getNowDateString();
  }

  // the day a row counts towards. the moment it was added is what that is read
  // off, so a row keeps the day it was really added on however long the list
  // stays open. rows written before the moment was kept fall back to the day
  // that was stored beside them
  itemDayString(item: any) {
    let stamp = +item?.stamp || 0;
    let moment = stamp > 0 ? new Date(stamp) : null;
    if (moment && !isNaN(moment.getTime())) {
      return this.dayStringOf(moment);
    }
    return item?.AddedOn || '';
  }

  // helper function
  // the day a moment belongs to, as "MonJul172023". A calculator still open
  // before noon is counted against the day before, the list is filled through
  // the evening
  dayStringOf(moment: Date) {
    let date = new Date(moment.getTime());
    let hour = date.toLocaleTimeString(); // "1:35:47 AM"
    if (hour.slice(-2) == 'AM') {
      date.setDate(date.getDate() - 1);
    }
    return date.toDateString().replaceAll(' ', ''); // "Mon Jul 17 2023"
  }

  // helper function
  getNowDateString() {
    return this.dayStringOf(new Date());
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
