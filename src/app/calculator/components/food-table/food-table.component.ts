import {
  Component,
  AfterViewInit,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FoodDataService } from '../../services/food-data.service';
import { OperationsService } from '../../services/operations.service';
import { MatSort } from '@angular/material/sort';
import { Subscription } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-food-table',
  templateUrl: './food-table.component.html',
  styleUrls: ['./food-table.component.scss'],
})
export class FoodTableComponent implements AfterViewInit, OnDestroy {
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

  // the card list on a phone draws the same page of rows the table would draw
  rows: any[] = [];
  private rowsSub: Subscription | null = null;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.bindRows();
  }

  ngOnDestroy() {
    this.rowsSub?.unsubscribe();
  }

  // connect() emits the rows of the current page, filter and sort applied
  private bindRows() {
    this.rowsSub?.unsubscribe();
    this.rowsSub = this.dataSource.connect().subscribe((res: any) => {
      this.rows = res;
    });
  }

  constructor(
    private FoodDataService: FoodDataService,
    private OperationsService: OperationsService,
  ) {
    this.getFoodData();
  }

  getFoodData() {
    this.FoodDataService.getFoodData().subscribe({
      next: (res) => {
        let array: any = Object.values(res);
        // fill table and sort
        this.dataSource = new MatTableDataSource(array);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.bindRows();
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
    this.OperationsService.handleAdd(element);
  }

  // word breaker
  wordBreaker(value: String) {
    return value ? value.replace('/', ' ') : '_______';
  }
}
