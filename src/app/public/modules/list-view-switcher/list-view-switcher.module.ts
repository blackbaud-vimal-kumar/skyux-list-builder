import {
  NgModule
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  SkyRadioModule
} from '@skyux/forms';

import {
  SkyListViewSwitcherComponent
} from './list-view-switcher.component';

import {
  SkyListViewSwitcherCustomComponent
} from './list-view-switcher-custom.component';

import {
  SkyListModule
} from '../list/list.module';

@NgModule({
  declarations: [
    SkyListViewSwitcherComponent,
    SkyListViewSwitcherCustomComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SkyListModule,
    SkyRadioModule
  ],
  exports: [
    SkyListViewSwitcherComponent,
    SkyListViewSwitcherCustomComponent
  ]
})
export class SkyListViewSwitcherModule { }
