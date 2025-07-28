export default function isStrongPassword(password: string): boolean {
  // Regex explanation:
  // - At least one lowercase letter
  // - At least one uppercase letter
  // - At least one digit
  // - At least one special character (non-alphanumeric)
  // - Minimum length of 8 characters
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/

  // Return true if password matches the strong pattern
  return strongPasswordRegex.test(password)
}
