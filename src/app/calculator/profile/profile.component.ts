import { Component, OnInit } from '@angular/core';
import { OperationsService } from 'src/app/shared/services/operations.service';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/shared/services/data.service';
import { BehaviorSubject } from 'rxjs';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  nutritions = this.DataService.nutritions;

  carbFactor = this.DataService.carbFactor;
  fatFactor = this.DataService.fatFactor;
  proteinFactor = this.DataService.proteinFactor;

  fatCalGM = this.DataService.fatCalGM;
  CarbCalGM = this.DataService.CarbCalGM;
  proteinCalGM = this.DataService.proteinCalGM;

  isProfilePage = true;

  personal: any = { Weight: 0, Energy: 0 };
  targetCalculated: any = {};

  Weight = new BehaviorSubject(0);
  WeightAction$ = this.Weight.asObservable();

  showInput = new BehaviorSubject(false);
  showInputAction$ = this.showInput.asObservable();

  user: any = JSON.parse(localStorage.getItem('user') || '');
  img: any = this.user.photoURL;

  constructor(
    private OperationsService: OperationsService,
    private DataService: DataService,
    private ActivatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.OperationsService.getTargetEnergy().subscribe((res) => {
      if (res) {
        this.personal = res;
        this.personal.Energy = (
          370 +
          21.6 * this.personal.Weight * this.nutritions.ActicityFactorAvr
        ).toFixed();
        this.Weight.next(res?.Weight);
        this.targetCalculations();
      } else {
        this.showInput.next(true);
      }
    });

    this.ActivatedRoute.snapshot.url[0].path != 'profile'
      ? (this.isProfilePage = false)
      : true;
  }

  changePersonal() {
    this.personal.Energy = (
      370 +
      21.6 * this.personal.Weight * this.nutritions.ActicityFactorAvr
    ).toFixed();
    this.OperationsService.changeTargetEnergy(this.personal).subscribe(
      (res) => {
        this.OperationsService.changeTargetEnergy(this.personal);
        this.Weight.next(this.personal.Weight);
        this.showInput.next(false);
        this.targetCalculations();
      }
    );
  }

  targetCalculations() {
    this.targetCalculated = {
      trgtCarb: (
        (this.personal.Energy * this.carbFactor) /
        this.CarbCalGM
      ).toFixed(),
      trgtFat: (
        (this.personal.Energy * this.fatFactor) /
        this.fatCalGM
      ).toFixed(),
      trgtPro: (
        (this.personal.Energy * this.proteinFactor) /
        this.proteinCalGM
      ).toFixed(),
    };
  }
}
