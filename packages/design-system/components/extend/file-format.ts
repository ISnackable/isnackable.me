export function formatFileSize(size: number, locale: string) {
  const units = ["byte", "kilobyte", "megabyte", "gigabyte", "terabyte"];
  let unit = 0;
  let value = size;
  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000;
    unit += 1;
  }
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: unit === 0 ? 0 : 1,
    style: "unit",
    unit: units[unit],
    unitDisplay: "narrow",
  }).format(value);
}
