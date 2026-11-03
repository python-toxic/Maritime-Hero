export function formatDate(iso: string): string {
  if (!iso) return "Unknown date";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "Unknown date";
  
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
