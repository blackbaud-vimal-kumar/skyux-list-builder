export class ListItemsSetSelectedAction {
  constructor(
    public items: string[],
    public refresh: boolean = true
  ) {}
}
