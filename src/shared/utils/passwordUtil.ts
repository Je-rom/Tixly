export function changedPasswordAfter(
  passwordChangedAt: Date | null | undefined,
  jwtTimestamp: number,
): boolean {
  if (passwordChangedAt) {
    const changedTimestamp = Math.floor(passwordChangedAt.getTime() / 1000);
    return jwtTimestamp < changedTimestamp;
  }
  return false;
}
