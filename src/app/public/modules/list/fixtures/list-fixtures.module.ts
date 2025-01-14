import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SkyListModule } from '../';
import { SkyListToolbarModule } from '../../list-toolbar';

import { ListTestComponent } from './list.component.fixture';
import { ListDualTestComponent } from './list-dual.component.fixture';
import { ListEmptyTestComponent } from './list-empty.component.fixture';
import { ListSelectedTestComponent } from './list-selected.component.fixture';
import { ListFilteredTestComponent } from './list-filtered.component.fixture';
import { ListViewTestComponent } from './list-view-test.component.fixture';

@NgModule({
  declarations: [
    ListTestComponent,
    ListDualTestComponent,
    ListEmptyTestComponent,
    ListSelectedTestComponent,
    ListFilteredTestComponent,
    ListViewTestComponent
  ],
  imports: [
    CommonModule,
    SkyListModule,
    SkyListToolbarModule,
    FormsModule
  ],
  exports: [
    ListTestComponent,
    ListDualTestComponent,
    ListEmptyTestComponent,
    ListSelectedTestComponent,
    ListFilteredTestComponent,
    ListViewTestComponent
  ]
})
export class ListFixturesModule { }
