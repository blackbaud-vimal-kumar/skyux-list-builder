import {
  Component,
  Input,
  OnInit,
  OnDestroy
} from '@angular/core';

import {
  Subject
} from 'rxjs/Subject';

import {
  Observable
} from 'rxjs/Observable';

import {
  SkyCheckboxChange
} from '@skyux/forms';

import {
  ListFilterModel
} from '@skyux/list-builder/modules/list/state';

import {
  ListItemModel
} from '@skyux/list-builder-common';

import {
  ListPagingSetPageNumberAction,
  ListState,
  ListStateDispatcher
} from '../list/state';

import {
  SkyComparisonHelper
} from '../shared/comparison-helper';

let uniqueId = 0;

@Component({
  selector: 'sky-list-multiselect-toolbar',
  templateUrl: './list-multiselect-toolbar.component.html',
  styleUrls: ['./list-multiselect-toolbar.component.scss']
})
export class SkyListMultiselectToolbarComponent implements OnInit, OnDestroy {

  @Input()
  public showOnlySelected = false;

  public multiselectToolbarId = `sky-list-multiselect-toolbar-${uniqueId++}`;

  private _selectedIds: string[] = [];

  private _lastSelectedIds: string[] = [];

  private ngUnsubscribe = new Subject();

  constructor(
    private state: ListState,
    private dispatcher: ListStateDispatcher
  ) {}

  public ngOnInit() {
    this.state.map(t => t.items.items)
      .takeUntil(this.ngUnsubscribe)
      .distinctUntilChanged()
      .subscribe((listItemModel: ListItemModel[]) => {
        this.getSelectedIdsFromModel(listItemModel);

        if (this.showOnlySelected) {
          this.reapplyFilter(true);
        }
      });
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public selectAll() {
    this.state.map(state => state.items.items)
      .take(1)
      .subscribe(items => {
        this.dispatcher.setSelected(items.map(item => item.id));
        if (this.showOnlySelected) {
          this.reapplyFilter(this.showOnlySelected);
        }
      });
  }

  public clearSelections() {
    this.state.map(state => state.items.items)
      .take(1)
      .subscribe(items => {
        this.dispatcher.setSelected([]);
        if (this.showOnlySelected) {
          this.reapplyFilter(this.showOnlySelected);
        }
      });
  }

  public changeVisibleItems(change: SkyCheckboxChange) {
    this.showOnlySelected = change.checked;
    this.reapplyFilter(change.checked);
  }

  private reapplyFilter(isSelected: boolean) {
    let self = this;

    this.state.map(state => state.filters)
      .take(1)
      .subscribe((filters: ListFilterModel[]) => {
        filters = filters.filter(filter => filter.name !== 'show-selected');
        filters.push(self.getShowSelectedFilter(isSelected));
        this.dispatcher.filtersUpdate(filters);
      });

    // If "show selected" is checked and paging is enabled, go to page one.
    /* istanbul ignore else */
    if (isSelected) {
      this.state
        .take(1)
        .subscribe((currentState) => {
          if (currentState.paging.pageNumber && currentState.paging.pageNumber !== 1) {
            this.dispatcher.next(
              new ListPagingSetPageNumberAction(Number(1))
            );
          }
      });
    }
    this.dispatcher.toolbarSetDisabled(isSelected);
  }

  private getShowSelectedFilter(isSelected: boolean) {
    return new ListFilterModel({
      name: 'show-selected',
      value: isSelected.toString(),
      filterFunction: (model: ListItemModel, showOnlySelected: boolean) => {
        if (showOnlySelected.toString() !== false.toString()) {
          return this._selectedIds.indexOf(model.id) > -1;
        }
      },
      defaultValue: false.toString()
    });
  }

  private getSelectedIdsFromModel(models: ListItemModel[]) {
    this._selectedIds = models
      .filter(listItemModel => listItemModel.isSelected === true)
      .map(item => item.id);
    console.log('_selectedIds: ' + this._selectedIds);
  }

}
