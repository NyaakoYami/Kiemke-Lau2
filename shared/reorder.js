export function moveItemBetweenArrays(sourceArr, targetArr, sourceIndex, targetIndex) {
  if (!Array.isArray(sourceArr) || !Array.isArray(targetArr)) return false;
  if (!Number.isInteger(sourceIndex) || sourceIndex < 0 || sourceIndex >= sourceArr.length) return false;

  const [item] = sourceArr.splice(sourceIndex, 1);
  if (item === undefined) return false;

  const requestedIndex = Number.isInteger(targetIndex) ? targetIndex : targetArr.length;
  const insertAt = Math.max(0, Math.min(requestedIndex, targetArr.length));
  targetArr.splice(insertAt, 0, item);
  return true;
}
