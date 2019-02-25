/** @deprecated since version 3.1.0, use ListItemsSetSelectedAction instead */
export class ListSelectedSetItemsSelectedAction {
  constructor(
    public items: string[],
    public selected: boolean = false,
    public refresh: boolean = true) {}
}
