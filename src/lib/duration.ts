export function calculateDurationDays(areaPyeong: number, scope: string[]) {
  let base = 7;

  if (areaPyeong <= 20) base = 10;
  else if (areaPyeong <= 30) base = 14;
  else if (areaPyeong <= 40) base = 18;
  else base = 24;

  if (scope.includes("kitchen")) base += 3;
  if (scope.includes("bathroom")) base += 3;
  if (scope.includes("balcony")) base += 2;

  return base;
}