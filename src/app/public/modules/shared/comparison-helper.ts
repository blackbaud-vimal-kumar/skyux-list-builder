import {
  ListItemModel
} from '@skyux/list-builder-common';

export abstract class SkyComparisonHelper {

  public static arraysEqual(arrayA: Array<any>, arrayB: Array<any>): boolean {
    return arrayA.length === arrayB.length &&
      arrayA.every((value, index) =>
        value === arrayB[index]);
  }

  public static listModelSelectionsEqual(listA: ListItemModel[], listB: ListItemModel[]): boolean {
    if (listA.length !== listB.length) {
        return false;
    }

    for (let i = 0; i < listA.length; i++) {
      let modelB = listB.find(item => item.id === listA[i].id);
      if (!modelB || listA[i].isSelected !== modelB.isSelected) {
        return false;
      }
    }

    return true;
  }

}
