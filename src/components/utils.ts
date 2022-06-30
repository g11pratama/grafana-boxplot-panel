import * as d3 from 'd3';

type BinQuartiles = [number | undefined, number | undefined, number | undefined];
type BinRange = [number, number];

interface Box {
  quartiles: BinQuartiles,
  range: BinRange,
  outliers: number[]
};

type BinBox = d3.Bin<number, number> & Box;

export function getBinBox(bin: d3.Bin<number, number>, yValArr: any[]): BinBox {
  const y = (i: number) => yValArr[i];
  const min = d3.min(bin, y);
  const max = d3.max(bin, y);
  const q1 = d3.quantile(bin, 0.25, y);
  const q2 = d3.quantile(bin, 0.5, y);
  const q3 = d3.quantile(bin, 0.75, y);
  const iqr = q3! - q1!;
  const r0 = Math.max(min, q1! - iqr * 1.5);
  const r1 = Math.min(max, q3! + iqr * 1.5);
  const quartiles: BinQuartiles = [q1, q2, q3];
  const range: BinRange = [r0, r1];
  const box = {
    quartiles: quartiles,
    range: range,
    outliers: bin.filter((i) => yValArr[i] < r0 || yValArr[i] > r1),
  };
  const binBox = Object.assign({}, bin, box)
  return binBox;
};
