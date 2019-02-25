/** @deprecated since version 3.1.0, use ListItemModel's isSelected property instead */
export class ListSelectedModel {
  public selectedIdMap: Map<string, boolean>;

  constructor() {
    this.selectedIdMap = new Map<string, boolean>();
  }
}
