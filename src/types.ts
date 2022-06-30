type SeriesSize = 'sm' | 'md' | 'lg';
type BoxplotType = 'time' | 'series';

export interface SimpleOptions {
  text: string;
  showSeriesCount: boolean;
  seriesCountSize: SeriesSize;
  d3ThresholdNum: number;
  boxplotType: BoxplotType;
}
