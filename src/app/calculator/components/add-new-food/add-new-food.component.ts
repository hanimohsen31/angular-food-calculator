import { Component, HostListener, OnInit } from '@angular/core';
import { FoodDataService } from '../../services/food-data.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MEASURE_UNITS } from '../../services/constants';

@Component({
  standalone: false,
  selector: 'app-add-new-food',
  templateUrl: './add-new-food.component.html',
  styleUrls: ['./add-new-food.component.scss'],
})
export class AddNewFoodComponent implements OnInit {
  formDataCopy: any = {};
  measureUnits: string[] = MEASURE_UNITS;

  // saved food items, the recipes are left to the recipes screen
  foodList: any[] = [];
  filteredFoodList: any[] = [];
  searchTerm: string = '';
  loading: boolean = false;

  // the list is read one page at a time
  pageSize: number = 5;
  currentPage: number = 1;
  pagedFoodList: any[] = [];
  pageNumbers: number[] = [];

  // edit / delete state
  editedFoodKey: string = '';
  editedFoodID: string = '';
  deletePopup: boolean = false;
  foodToDelete: any = null;

  formData: any = new FormGroup({
    ShortFoodName: new FormControl('', [Validators.required]),
    Translation: new FormControl('', [Validators.required]),
    Measure: new FormControl(0, [Validators.required]),
    MeasureUnit: new FormControl('gm', [Validators.required]),
    Quantity: new FormControl(1),
    Energy: new FormControl(0, [Validators.required]),
    Carbohydrate: new FormControl(0, [Validators.required]),
    Fat: new FormControl(0, [Validators.required]),
    Protein: new FormControl(0, [Validators.required]),
  });

  constructor(private FoodDataService: FoodDataService) {}

  ngOnInit(): void {
    this.getFoodData();
  }

  // ------------------------------ data ------------------------------
  getFoodData() {
    this.loading = true;
    this.FoodDataService.getFoodData().subscribe({
      next: (res: any) => {
        // keep the firebase key on every row, it is needed to update / delete
        this.foodList = Object.entries(res || {})
          .map(([key, value]: any) => ({ ...value, FoodKey: key }))
          .filter((elm: any) => !elm.isRecipe)
          .sort((a: any, b: any) => (a.ShortFoodName || '').localeCompare(b.ShortFoodName || ''));
        this.applyFilter();
        this.loading = false;
      },
      error: (err: any) => {
        console.log(err);
        this.loading = false;
      },
    });
  }

  // ------------------------------ list ------------------------------
  applyFilter() {
    let term = this.searchTerm.trim().toLowerCase();
    this.filteredFoodList = term
      ? this.foodList.filter(
          (elm: any) =>
            (elm.ShortFoodName || '').toLowerCase().includes(term) ||
            (elm.Translation || '').includes(term),
        )
      : this.foodList;
    // a new search starts from the first page of its own results
    this.currentPage = 1;
    this.applyPaging();
  }

  clearSearch() {
    this.searchTerm = '';
    this.applyFilter();
  }

  // ------------------------------ save ------------------------------
  get formTitle(): string {
    return this.editedFoodKey ? 'Edit Food Item' : 'Add New Food';
  }

  onSubmit() {
    if (!this.formData.valid) {
      alert('Data not valid');
      return;
    }
    this.editedFoodKey ? this.updateFood() : this.addNewFood(this.formData.value);
  }

  addNewFood(formdata: any) {
    this.loading = true;
    this.FoodDataService.addNewFood(formdata).subscribe({
      next: (res: any) => {
        this.resetForm();
        this.getFoodData();
      },
      error: (err: any) => {
        console.log(err);
        this.loading = false;
      },
    });
  }

  // the whole row is written back, so the fields the form does not show
  // (FoodID, the equivalent measure, ...) survive the edit
  updateFood() {
    let food = { ...this.formDataCopy, ...this.formData.value, FoodID: this.editedFoodID };
    delete food.FoodKey;
    this.loading = true;
    this.FoodDataService.updateFood(this.editedFoodKey, food).subscribe({
      next: () => {
        this.resetForm();
        this.getFoodData();
      },
      error: (err: any) => {
        console.log(err);
        this.loading = false;
        alert('Could not save the food item');
      },
    });
  }

  // ------------------------------ edit ------------------------------
  editFood(food: any) {
    this.editedFoodKey = food.FoodKey;
    this.editedFoodID = food.FoodID || '';
    this.formDataCopy = { ...food };
    this.formData.patchValue({
      ShortFoodName: food.ShortFoodName || '',
      Translation: food.Translation || '',
      Measure: +food.Measure || 0,
      MeasureUnit: food.MeasureUnit || this.measureUnits[0],
      Quantity: +food.Quantity || 1,
      Energy: +food.Energy || 0,
      Carbohydrate: +food.Carbohydrate || 0,
      Fat: +food.Fat || 0,
      Protein: +food.Protein || 0,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // a bare reset would leave the unit empty, which is not one of the options
  resetForm() {
    this.formData.reset({
      ShortFoodName: '',
      Translation: '',
      Measure: 0,
      MeasureUnit: this.measureUnits[0],
      Quantity: 1,
      Energy: 0,
      Carbohydrate: 0,
      Fat: 0,
      Protein: 0,
    });
    this.editedFoodKey = '';
    this.editedFoodID = '';
    this.formDataCopy = {};
  }

  // ------------------------------ delete ------------------------------
  toggleDeletePopup(food: any = null) {
    this.foodToDelete = food;
    this.deletePopup = !this.deletePopup;
  }

  handleDelete() {
    let key = this.foodToDelete?.FoodKey;
    if (!key) {
      return;
    }
    this.loading = true;
    this.FoodDataService.deleteFood(key).subscribe({
      next: () => {
        // the row being edited is gone, the form has nothing to save to
        if (this.editedFoodKey === key) {
          this.resetForm();
        }
        this.toggleDeletePopup();
        this.getFoodData();
      },
      error: (err: any) => {
        console.log(err);
        this.loading = false;
        alert('Could not delete the food item');
      },
    });
  }

  // ------------------------------ paging ------------------------------
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredFoodList.length / this.pageSize));
  }

  // the first item shown on this page, counted from one for the reader
  get rangeStart(): number {
    return this.filteredFoodList.length ? (this.currentPage - 1) * this.pageSize + 1 : 0;
  }

  get rangeEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredFoodList.length);
  }

  applyPaging() {
    let total = this.totalPages;
    // a save or a delete can leave the page being read past the last item
    this.currentPage = Math.min(Math.max(this.currentPage, 1), total);
    let start = (this.currentPage - 1) * this.pageSize;
    this.pagedFoodList = this.filteredFoodList.slice(start, start + this.pageSize);
    this.buildPageNumbers(total);
  }

  // a narrow screen only has room for a short run of page buttons
  compactPager: boolean = window.matchMedia('(max-width: 767px)').matches;

  @HostListener('window:resize')
  handleResize() {
    let compact = window.matchMedia('(max-width: 767px)').matches;
    if (compact != this.compactPager) {
      this.compactPager = compact;
      this.applyPaging();
    }
  }

  // at most five page buttons, kept around the page being read
  buildPageNumbers(total: number) {
    let width = this.compactPager ? 3 : 5;
    let start = Math.max(1, this.currentPage - Math.floor(width / 2));
    let end = Math.min(total, start + width - 1);
    start = Math.max(1, end - width + 1);
    this.pageNumbers = [];
    for (let page = start; page <= end; page++) {
      this.pageNumbers.push(page);
    }
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages || page == this.currentPage) {
      return;
    }
    this.currentPage = page;
    this.applyPaging();
  }

  handlePageSizeChange() {
    this.pageSize = +this.pageSize || 5;
    this.currentPage = 1;
    this.applyPaging();
  }
}
