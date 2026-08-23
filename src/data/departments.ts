const palette: Record<string, string> = {
  Engineering: "var(--primary)",
  Production: "var(--gold)",
  Design: "var(--chart-3)",
  Operations: "var(--chart-4)",
  Quality: "var(--chart-5)",
};

export const departmentOptions = Object.keys(palette);

export function departmentAccent(department: string): string {
  return palette[department] ?? "var(--gold)";
}
