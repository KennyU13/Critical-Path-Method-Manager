export const pushOrRemove = (value, arr)=> {
  arr.includes(value)
    ? (arr = arr.filter((elem) => elem !== value))
    : arr.push(value);
  return arr;
}