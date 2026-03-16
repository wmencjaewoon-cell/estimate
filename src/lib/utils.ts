export function formatKRW(value: number) {
  return `${Math.round(value).toLocaleString("ko-KR")}원`;
}

export function pyeongToM2(pyeong: number) {
  return pyeong * 3.3058;
}