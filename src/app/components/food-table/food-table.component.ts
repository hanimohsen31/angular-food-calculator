import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Food } from 'src/app/store/Food';

@Component({
  selector: 'app-food-table',
  templateUrl: './food-table.component.html',
  styleUrls: ['./food-table.component.scss'],
})
export class FoodTableComponent implements AfterViewInit {
  // paginator
  @ViewChild(MatPaginator) paginator: MatPaginator;
  // arrays
  toSumArray: any[] = [];
  toSumOperatorsArray: any[] = [];
  sumObject = { calories: 0, fats: 0, carbs: 0, protein: 0 };

  constructor() {
    let items = localStorage.getItem('items');
    let operatedItems = localStorage.getItem('operatedItems');
    if (items === null || operatedItems === null) {
      this.toSumArray = [];
      this.toSumOperatorsArray = [];
    } else {
      this.toSumArray = JSON.parse(items);
      this.toSumOperatorsArray = JSON.parse(operatedItems);
    }
    this.handleSum();
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  // angular table
  ELEMENT_DATA: any[] = Food;
  displayedColumns: string[] = [
    'name',
    "translated",
    'quantity',
    'measure',
    'servingDetails',
    'calories',
    'fats',
    'carbs',
    'protein',
    'menue',
  ];
  dataSource = new MatTableDataSource(this.ELEMENT_DATA);

  // filter
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // handle add
  handleAdd(index: any, element: any) {
    this.toSumArray.push(element);
    this.toSumOperatorsArray.push(element);
    localStorage.setItem(
      'operatedItems',
      JSON.stringify(this.toSumOperatorsArray)
    );
    localStorage.setItem('items', JSON.stringify(this.toSumArray));
  }

  // handle remove
  handleRemove(index: any) {
    this.toSumArray.splice(index, 1);
    this.toSumOperatorsArray.splice(index, 1);
    document.querySelector(`.xyz${index}`)?.classList.add('inVisible');
    localStorage.setItem('items', JSON.stringify(this.toSumArray));
    localStorage.setItem(
      'operatedItems',
      JSON.stringify(this.toSumOperatorsArray)
    );
    this.handleSum();
  }

  // handle change
  handleChange(index: any, quantity: any) {
    let currentObject = this.toSumArray[index];
    let newObject = {
      id: currentObject.id,
      name: currentObject.name,
      calories: +currentObject.calories * +currentObject.quantity,
      carbs: +currentObject.carbs * +currentObject.quantity,
      protein: +currentObject.protein * +currentObject.quantity,
      fats: +currentObject.fats * +currentObject.quantity,
      quantity: +quantity,
      measure: 'gram (g)',
    };
    this.toSumOperatorsArray[index] = newObject;
    localStorage.setItem('items', JSON.stringify(this.toSumArray));
    localStorage.setItem(
      'operatedItems',
      JSON.stringify(this.toSumOperatorsArray)
    );
    this.handleSum();
  }

  // handle sum
  handleSum() {
    this.sumObject = { calories: 0, fats: 0, carbs: 0, protein: 0 };
    this.toSumOperatorsArray.map((elm) => {
      this.sumObject.calories += elm.calories;
      this.sumObject.fats += elm.fats;
      this.sumObject.carbs += elm.carbs;
      this.sumObject.protein += elm.protein;
    });
  }

  // handle check
  handleCheck() {
    localStorage.setItem('items', JSON.stringify(this.toSumArray));
    localStorage.setItem(
      'operatedItems',
      JSON.stringify(this.toSumOperatorsArray)
    );
    this.handleSum();
  }

  // handle clear
  handleClear() {
    localStorage.removeItem('items');
    localStorage.removeItem('operatedItems');
    this.toSumArray = [];
    this.toSumOperatorsArray = [];
  }
}
