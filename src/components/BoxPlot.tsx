import React, { useEffect, useMemo, useRef } from 'react';
import { 
  DataFrame, 
  FieldType, 
  getFieldSeriesColor,
  GrafanaTheme2,
} from '@grafana/data';
import { colors } from "@grafana/ui";
import { getBinBox } from './utils';
import * as d3 from 'd3';

interface BoxPlotProps {
  frame: DataFrame,
  theme: GrafanaTheme2 | null,
  xScale: d3.ScaleTime<number, number, never>,
  yScale: d3.ScaleLinear<number, number, never>,
  histGenerator: d3.HistogramGeneratorNumber<number, number>
  index: number,
};

export const BoxPlot: React.FC<BoxPlotProps> = ({ 
  frame, 
  theme,
  xScale, 
  yScale,
  histGenerator,
  index,
}) => {
  const dataRef = useRef(null);

  const [Y, B, seriesColor] = useMemo(() => {
    let X = frame.fields.find((f) => f.type === FieldType.time)!.values.toArray();
    X.forEach(d => new Date(d));

    const yField = frame.fields.find((f) => f.type === FieldType.number)!;
    const Y = yField.values.toArray();
    const I = d3.range(X.length).filter((i) => !isNaN(X[i]) && !isNaN(Y[i]));
    const B = histGenerator
      .value((i) => X[i])(I)
      .map((bin) => getBinBox(bin, Y));

    // const scaleCalc = getScaleCalculator( yField, theme as GrafanaTheme2 );

    const seriesColor = theme? getFieldSeriesColor(yField, theme).color: colors[index];

    return [Y, B, seriesColor];
  }, [frame, histGenerator, theme, index]);

  useEffect(() => {
    d3.select(dataRef.current).selectAll('g').remove();
    const g = d3.select(dataRef.current)
      .selectAll('g')
      .data(B)
      .join('g');
      g.append('path')
      .attr('stroke', 'currentColor')
      .attr(
        'd',
        (d) => `
        M${xScale((d.x0! + d.x1!) / 2)},${yScale(d.range[1])}
        V${yScale(d.range[0])}
      `
      );

      g.append('path')
        .attr('fill', seriesColor)
        .attr(
          'd',
          (d) => `
          M${xScale(d.x0!) + 0.5},${yScale(d.quartiles[2]!)}
          H${xScale(d.x1!) - 0.5}
          V${yScale(d.quartiles[0]!)}
          H${xScale(d.x0!) + 0.5}
          Z
        `
        );

      g.append('path')
        .attr('stroke', 'currentColor')
        .attr('stroke-width', 2)
        .attr(
          'd',
          (d) => `
          M${xScale(d.x0!) + 0.5},${yScale(d.quartiles[1]!)}
          H${xScale(d.x1!) - 0.5}
        `
        );

      g.append('g')
        .attr('fill', seriesColor)
        .attr('fill-opacity', 0.2)
        .attr('stroke', 'none')
        .attr('transform', (d) => `translate(${xScale((d.x0! + d.x1!) / 2)},0)`)
        .selectAll('circle')
        .data((d) => d.outliers)
        .join('circle')
        .attr('r', 2)
        .attr('cx', () => (Math.random() - 0.5) * 4)
        .attr('cy', (i) => yScale(Y[i]));
  });
  return <g ref={dataRef} />;
};
