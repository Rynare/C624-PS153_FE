function numberToNotation(number) {
  let angka = parseInt(number, 10) || 0;
  angka = angka <= 0 ? 0 : angka;
  if (angka >= 1_000_000_000) {
    return `${(angka / 1_000_000_000).toFixed(1)}M`;
  } if (angka >= 1_000_000) {
    return `${(angka / 1_000_000).toFixed(1)}jt`;
  } if (angka >= 1_000) {
    return `${(angka / 1_000).toFixed(1)}rb`;
  }
  return angka.toString();
}

export { numberToNotation };
