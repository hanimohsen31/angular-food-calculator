import { Component, OnInit } from '@angular/core';
import { map, combineLatest } from 'rxjs';
import { OperationsService } from 'src/app/services/operations.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-sum',
  templateUrl: './sum.component.html',
  styleUrls: ['./sum.component.scss'],
})
export class SumComponent implements OnInit {
  // properties
  nutritions = this.DataService.nutritions;

  carbFactor = this.DataService.carbFactor;
  fatFactor = this.DataService.fatFactor;
  proteinFactor = this.DataService.proteinFactor;

  fatCalGM = this.DataService.fatCalGM;
  CarbCalGM = this.DataService.CarbCalGM;
  proteinCalGM = this.DataService.proteinCalGM;

  trgtEnr: any = 0;
  displayDetails = false;
  date = new Date();
  finsObj: any = {};
  targetObj: any = {};
  sumArray: any[] = [];

  constructor(
    private OperationsService: OperationsService,
    private DataService: DataService
  ) {}

  ngOnInit(): void {}

  sumArray$ = this.OperationsService.sumArrayAction$
    .pipe(map((response: any) => response.map((elm: any) => elm)))
    .pipe(map((response: any) => (this.sumArray = response)));

  finalSumObject$ = this.OperationsService.finalSumAction$
    .pipe(map((response: any) => response.map((elm: any) => elm)))
    .pipe(map((response: any) => (this.finsObj = response)));

  percentageObjJoin$ = combineLatest([
    this.finalSumObject$,
    this.OperationsService.getTargetEnergy(),
  ]).subscribe({
    next: (res) => {
      res[0].length == 0 && !res[1].Energy
        ? this.updatePercentageObj([], 2000)
        : res[0].length > 0 && res[1]?.Energy
        ? this.updatePercentageObj(res[0][0], res[1]?.Energy)
        : res[0].length > 0 && !res[1]?.Energy
        ? this.updatePercentageObj(res[0][0], 2000)
        : (res[0].length = 0 && res[1]?.Energy);
    },
    error: (err) => console.log('error in personal: ', err),
  });

  updatePercentageObj(finsObj: any, trgtEnr: any) {
    console.log( typeof(+trgtEnr) )
    console.log( (+trgtEnr).toFixed() )
    let obj = {
      enrgTrg: (+trgtEnr).toFixed(),
      enrgPer: ((+finsObj.Energy * 100) / +trgtEnr).toFixed(),
      fatTarg: ((+trgtEnr * this.fatFactor) / this.fatCalGM).toFixed(),
      fatPerc: (
        (finsObj.Fat * this.fatCalGM * 100) /
        (+trgtEnr * this.fatFactor)
      ).toFixed(),
      carbTarg: ((+trgtEnr * this.carbFactor) / this.CarbCalGM).toFixed(),
      carbPer: (
        (finsObj.Carbohydrate * this.CarbCalGM * 100) /
        (+trgtEnr * this.carbFactor)
      ).toFixed(),
      proTrg: (
        (+trgtEnr * this.proteinFactor) /
        this.nutritions.proteinCalGM
      ).toFixed(),
      proPer: (
        (finsObj.Protein * this.proteinCalGM * 100) /
        (+trgtEnr * this.proteinFactor)
      ).toFixed(),
    };
    this.targetObj = obj;
  }

  // handle remove
  handleRemove(index: any) {
    this.OperationsService.handleRemove(index);
  }

  // handle change
  handleChange() {
    this.OperationsService.handleChange();
  }

  // handle clear
  handleClear() {
    this.popupContainer = !this.popupContainer;
    this.clearPopup = !this.clearPopup;
    this.OperationsService.handleClear();
  }

  toggleDetails() {
    this.displayDetails = !this.displayDetails;
  }

  saveData() {
    let container = {
      ...this.targetObj,
      ...this.finsObj[0],
      Food: [...this.sumArray],
    };
    // console.log(this.targetObj);
    // console.log(this.finsObj[0]);
    // console.log(this.sumArray);
    let data = JSON.parse(JSON.stringify(container));
    delete data.FoodID;
    delete data.Measure;
    delete data.Quantity;
    delete data.ShortFoodName;
    delete data.Translation;
    data.Food.map((elm: any) => {
      delete elm.Equavlint;
      delete elm.EquavlintMeasure;
      delete elm.EquavlintMeasureUnit;
      delete elm.FoodID;
      delete elm.Measure;
      delete elm.MeasureUnit;
      delete elm.Quantity;
      delete elm.Sugars;
    });

    this.popupContainer = !this.popupContainer;
    this.savePopup = !this.savePopup;
    this.DataService.saveTrackingData(data).subscribe();
  }

  saveDeitData() {
    let container = {
      ...this.targetObj,
      ...this.finsObj[0],
      Food: [...this.sumArray],
    };
    // console.log(this.targetObj);
    // console.log(this.finsObj[0]);
    // console.log(this.sumArray);
    let data = JSON.parse(JSON.stringify(container));
    delete data.FoodID;
    delete data.Measure;
    delete data.Quantity;
    delete data.ShortFoodName;
    delete data.Translation;
    data.Food.map((elm: any) => {
      delete elm.Equavlint;
      delete elm.EquavlintMeasure;
      delete elm.EquavlintMeasureUnit;
      delete elm.FoodID;
      delete elm.Measure;
      delete elm.MeasureUnit;
      delete elm.Quantity;
      delete elm.Sugars;
    });

    // this.popupContainer = !this.popupContainer;
    // this.savePopup = !this.savePopup;
    this.DataService.saveDeitData(data).subscribe();
  }

  print() {
    print();
  }

  clearPopup = false;
  savePopup = false;
  popupContainer = false;
  curruntDate: any = '';

  toggleClearPopup() {
    this.popupContainer = !this.popupContainer;
    this.clearPopup = !this.clearPopup;
  }

  toggleSavePopup() {
    this.popupContainer = !this.popupContainer;
    this.savePopup = !this.savePopup;
    let date = this.DataService.getCurruntDate();
    this.curruntDate = this.dateFormat(date);
  }

  dateFormat(value: string) {
    return this.OperationsService.dateFormater(value);
  }
}
