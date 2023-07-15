import { Component, OnInit } from '@angular/core';
import { map, combineLatest } from 'rxjs';
import { OperationsService } from './../../services/operations.service';
import { DataService } from './../../services/data.service';

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

  constructor(
    private OperationsService: OperationsService,
    private DataService: DataService
  ) {}

  ngOnInit(): void {}

  sumArray$ = this.OperationsService.sumArrayAction$.pipe(
    map((response: any) => response.map((elm: any) => elm))
  );

  finalSumObject$ = this.OperationsService.finalSumAction$
    .pipe(map((response: any) => response.map((elm: any) => elm)))
    .pipe(map((response: any) => (this.finsObj = response)));

  percentageObjJoin$ = combineLatest([
    this.finalSumObject$,
    this.OperationsService.getTargetEnergy(),
  ]).subscribe({
    next: (res) => {
      res[1]?.Energy
        ? this.updatePercentageObj(res[0][0], res[1]?.Energy)
        : this.updatePercentageObj(res[0][0], 2000);
    },
    error: (err) => console.log('error in personal: ', err),
  });

  updatePercentageObj(finsObj: any, trgtEnr: any) {
    let obj = {
      enrgTrg: +trgtEnr.toFixed(),
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
    // console.log('obj: ', obj);
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
    this.OperationsService.handleClear();
  }

  toggleDetails() {
    this.displayDetails = !this.displayDetails;
  }

  saveData() {
    let data = { ...this.targetObj, ...this.finsObj[0]};
    this.DataService.saveTrackingData(data).subscribe();
  }

  print() {
    print();
  }
}
