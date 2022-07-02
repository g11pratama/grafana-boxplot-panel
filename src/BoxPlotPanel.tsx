import React, { useEffect, useMemo, useRef } from 'react';
import { FieldType, PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css, cx } from 'emotion';
import { stylesFactory, useTheme2 } from '@grafana/ui';
import { BoxPlot } from 'components/BoxPlot';
import * as d3 from 'd3';

interface Props extends PanelProps<SimpleOptions> {}

// For v7.0 backward compatibility
const useTheme = useTheme2 || (() => null) ;

export const BoxPlotPanel: React.FC<Props> = ({ options, data, width, height }) => {
  const theme = useTheme();
  const styles = getStyles();
  const padding = 60;
  const chartHeight = height - padding;
  const threshold = options.d3ThresholdNum;
  const xAxisRef = useRef(null);
  const yAxisRef = useRef(null);

  const histGenerator = useMemo(() => d3.histogram().thresholds(threshold), [threshold]);

  const [xMin, xMax, yMin, yMax] = useMemo(() => { 
    const findExtrema = (fieldType: FieldType) => {
      return data.series.reduce(([curMin, curMax], frame) => {
        const timeArr = frame.fields.find((f) => f.type === fieldType)!.values.toArray();

        const [localMin, localMax] = timeArr.reduce(([curLocalMin, curLocalMax], curVal) => {
          return [Math.min(curLocalMin, curVal), Math.max(curLocalMax, curVal)];
        }, [curMin, curMax]);
        
        return [Math.min(curMin, localMin), Math.max(curMax, localMax)];
      }, [Infinity, -Infinity]);
    }
    return [...findExtrema(FieldType.time), ...findExtrema(FieldType.number)];
  }, [data]);

  const xDomain = [xMin||0,  xMax || 0.0];
  const yDomain = [yMin||0,  yMax || 0.0];
  const xScale = d3.scaleTime(xDomain, [0, width]).interpolate(d3.interpolateRound);
  const yScale = d3.scaleLinear(yDomain, [chartHeight, 0]);

  const xAxis = d3.axisBottom(xScale).ticks(threshold).tickSizeOuter(0);
  const yAxis = d3.axisLeft(yScale).ticks(height / 40);

  useEffect(() => {
    d3.select(yAxisRef.current).call(yAxis as any);
    d3.select(xAxisRef.current).call((xAxis as any).tickFormat(d3.timeFormat("%Y-%m-%d")));
  });

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
        {data.series.map((frame, idx) => {
          const field = frame.fields.find((f) => f.type === FieldType.number);
          const key = frame.refId + field!.name;
          return ( 
            <BoxPlot
              key={key}
              frame={frame}
              theme={theme}
              xScale={xScale}
              yScale={yScale}
              histGenerator={histGenerator}
              index={idx}
            />
          );
        })}
        <g transform={`translate(40, 0)`} ref={yAxisRef} />
        <g transform={`translate(0, ${chartHeight})`} ref={xAxisRef} />
      </svg>

      <div className={styles.textBox}>
        {options.showSeriesCount && (
          <div
            className={css`
              font-size: ${12};
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
