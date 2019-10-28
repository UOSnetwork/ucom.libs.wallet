export const symmetricDifference = <T>(arrayA: T[], arrayB: T[]) => arrayA
  .filter((x: T) => !arrayB.includes(x))
  .concat(arrayB.filter((x: T) => !arrayA.includes(x)));
