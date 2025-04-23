interface Options<T> {
  propertyName?: keyof T;
  direction?: "asc" | "desc";
}

export function order<T>(items: T[], options?: Options<T>): T[] {
  const { propertyName, direction = "asc" } = options || {};

  const itemsClone: T[] = JSON.parse(JSON.stringify(items));

  itemsClone.sort((firstItem, secondItem) => {
    const firstItemValue = propertyName ? firstItem[propertyName] : firstItem;
    const secondItemValue = propertyName
      ? secondItem[propertyName]
      : secondItem;
    const firstItemTextValue = `${firstItemValue}`;
    const secondItemTextValue = `${secondItemValue}`;

    return firstItemTextValue.localeCompare(secondItemTextValue, undefined, {
      sensitivity: "base",
      numeric: true,
    });
  });

  if (direction === "desc") {
    itemsClone.reverse();
  }

  return itemsClone;
}
