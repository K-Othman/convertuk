import type { InputField, InputValues } from "./conversions";

export function inputErrors(fields: InputField[], values: InputValues): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    const raw = values[field.name] ?? "";
    if (field.type === "select") {
      if (!field.options.some(option => option.value === raw)) errors[field.name] = `Choose ${field.label.toLowerCase()}.`;
      continue;
    }
    const value = Number(raw);
    if (!raw.trim() || !Number.isFinite(value)) errors[field.name] = `Enter a number for ${field.label.toLowerCase()}.`;
    else if (field.min !== undefined && value < field.min) errors[field.name] = `Enter ${field.min} or more.`;
    else if (field.max !== undefined && value > field.max) errors[field.name] = `Enter ${field.max} or less.`;
  }
  return errors;
}
