import { Component, OnInit } from '@angular/core';
import { AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { DataService } from './../../services/data.service';
import { OperationsService } from './../../services/operations.service';
import { MatSort } from '@angular/material/sort';
import { DeitService } from './../../services/deit.service';

@Component({
  selector: 'app-personal-deit',
  templateUrl: './personal-deit.component.html',
  styleUrls: ['./personal-deit.component.scss'],
})
export class PersonalDeitComponent {
  // paginator
  displayedColumns: string[] = [
    'ShortFoodName',
    'Translation',
    'MeasureUnit',
    'Equavlint',
    'Energy',
    'Fat',
    'Carbohydrate',
    'Protein',
    'menue',
  ];
  // angular table
  dataSource = new MatTableDataSource([]);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  constructor(
    private _DataService: DataService,
    private DeitService: DeitService,
    private _OperationsService: OperationsService
  ) {
    this.getDate();
  }

  getDate() {
    this.DeitService.getDeitList().subscribe({
      next: (res: any) => {
        this.dataSource = new MatTableDataSource(res);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
    });
  }

  // filter
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // handle add
  handleAdd(element: any) {
    this._OperationsService.handleAdd(element);
    this._OperationsService.handleChange();
  }

  // word breaker
  wordBreaker(value: String) {
    if (value) {
      return value.replace('/', ' ');
    } else {
      return '_______';
    }
  }

  breakfast : any = []
  snack1 :any = []
  lunch :any = []
  snack2 :any = []
  gym :any = []
  dinner :any = []

  addToDaymeal(meal:any,element:any){
    meal == 1 ? this.breakfast.push(element):
    meal == 2 ? this.snack1.push(element):
    meal == 3 ? this.lunch.push(element):
    meal == 4 ? this.snack2.push(element):
    meal == 5 ? this.gym.push(element):
    meal == 6 ? this.dinner.push(element):
    null
  }
}
