export function formatDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const num = Number(value);
  const date = !Number.isNaN(num) && String(num) === value.trim() ? new Date(num) : new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
