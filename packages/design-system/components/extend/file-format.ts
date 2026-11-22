const byteUnits = ["B", "kB", "MB", "GB", "TB"];

export function formatFileSize(size: number, locale: string) {
  let unit = 0;
  let value = size;
  while (value >= 1000 && unit < byteUnits.length - 1) {
    value /= 1000;
    unit += 1;
  }
  const number = new Intl.NumberFormat(locale, {
    maximumFractionDigits: unit === 0 ? 0 : 1,
  }).format(value);
  return `${number}\u00a0${byteUnits[unit]}`;
}
