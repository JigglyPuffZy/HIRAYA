export const isValidEmail = (email: string): boolean => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email.trim());
};

export const isValidPassword = (password: string): boolean =>
  password.trim().length >= 8;

export const parsePositiveNumber = (
  value: string,
): { valid: boolean; number?: number } => {
  const trimmed = value.trim();
  if (!trimmed) {
    return { valid: false };
  }

  const parsed = Number(trimmed);
  if (Number.isNaN(parsed) || parsed < 0) {
    return { valid: false };
  }

  return { valid: true, number: parsed };
};

export const validateRequired = (value: string): boolean =>
  value.trim().length > 0;
