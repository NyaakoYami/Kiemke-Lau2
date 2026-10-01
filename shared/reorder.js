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

// Kéo thả hiển thị vạch chèn "trước" một cabin (insertBefore = chỉ số trong mảng
// GỐC, có thể = length để chèn cuối). Khi di chuyển trong cùng một mảng và item
// nằm phía trước vị trí chèn, việc rút item ra làm các phần tử sau dịch lên 1.
export function resolveInsertIndex(sameArray, sourceIndex, insertBefore) {
  if (sameArray && sourceIndex < insertBefore) return insertBefore - 1;
  return insertBefore;
}
