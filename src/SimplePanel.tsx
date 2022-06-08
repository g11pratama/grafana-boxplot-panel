import React, { useEffect, useMemo, useRef } from 'react';
import { FieldType, PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css, cx } from 'emotion';
import { stylesFactory, useTheme } from '@grafana/ui';
import * as d3 from 'd3';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  const theme = useTheme();
  const styles = getStyles();
  //const values = [4, 8, 15, 16, 23, 42];
  const padding = 60;
  const chartHeight = height - padding;
  //const barHeight = chartHeight / values.length;
  const thresholdDiv = 40;
  // const xAxisRef = useRef(null);
  // const yAxisRef = useRef(null);
  const dataRef = useRef(null);

  const [Y, B] = useMemo(() => {
    const X = data.series[0].fields.find((f) => f.type === FieldType.time)!.values.toArray();
    const Y = data.series[0].fields.find((f) => f.type === FieldType.number)!.values.toArray();
    const I = d3.range(X.length).filter((i) => !isNaN(X[i]) && !isNaN(Y[i]));
    const B = d3
      .histogram()
      .thresholds(width / thresholdDiv)
      .value((i) => X[i])(I)
      .map((bin) => {
        const y = (i: number) => Y[i];
        const min = d3.min(bin, y);
        const max = d3.max(bin, y);
        const q1 = d3.quantile(bin, 0.25, y);
        const q2 = d3.quantile(bin, 0.5, y);
        const q3 = d3.quantile(bin, 0.75, y);
        const iqr = q3! - q1!;
        const r0 = Math.max(min, q1! - iqr * 1.5);
        const r1 = Math.min(max, q3! + iqr * 1.5);
        const binCopy = {
          ...bin,
          quartiles: [q1, q2, q3],
          range: [r0, r1],
          outliers: bin.filter((i) => Y[i] < r0 || Y[i] > r1),
        };
        return binCopy;
      });
    return [Y, B];
  }, [data, width]);

  const xDomain = [d3.min(B, (d) => d.x0) || 0, d3.max(B, (d) => d.x1) || 0.0];
  const yDomain = [d3.min(B, (d) => d.range[0]) || 0, d3.max(B, (d) => d.range[1]) || 0.0];
  const xScale = d3.scaleLinear(xDomain, [0, width]).interpolate(d3.interpolateRound);
  const yScale = d3.scaleLinear(yDomain, [0, chartHeight]);

  const xAxis = d3
    .axisBottom(xScale)
    .ticks(width / thresholdDiv)
    .tickSizeOuter(0);
  const yAxis = d3.axisLeft(yScale).ticks(height / 40);

  useEffect(() => {
    // d3.select(yAxisRef.current)
    //   .call(yAxis as any);
    // d3.select(xAxisRef.current)
    //   .call(xAxis as any);

    const g = d3.select(dataRef.current).selectAll('g').data(B).join('g');
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
      .attr('fill', '#ddd')
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
      .attr('fill', 'currentColor')
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

  // const scale = d3
  //   .scaleLinear()
  //   .domain([0, d3.max(values) || 0.0])
  //   .range([0, width]);
  // const axis = d3.axisBottom(scale);

  return (
    <div
      className={cx(
        styles.wrapper,
        css`
          width: ${width}px;
          height: ${height}px;
        `
      )}
    >
      <svg
        className={styles.svg}
        width={width}
        height={height}
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
      >
        <g transform={`translate(40, 0)`} ref={(node) => d3.select(node).call(yAxis as any)} />
        <g transform={`translate(0, ${chartHeight})`} ref={(node) => d3.select(node).call(xAxis as any)} />
        <g ref={dataRef} />
      </svg>

      <div className={styles.textBox}>
        {options.showSeriesCount && (
          <div
            className={css`
              font-size: ${theme.typography.size[options.seriesCountSize]};
            `}
          >
            Number of series: {data.series.length}
          </div>
        )}
        <div>Text option value: {options.text}</div>
      </div>
    </div>
  );
};

const getStyles = stylesFactory(() => {
  return {
    wrapper: css`
      position: relative;
    `,
    svg: css`
      position: absolute;
      top: 0;
      left: 0;
    `,
    textBox: css`
      position: absolute;
      bottom: 0;
      left: 0;
      padding: 10px;
    `,
  };
});
