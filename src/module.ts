import { PanelPlugin, FieldConfigProperty, FieldColorModeId } from '@grafana/data';
import { SimpleOptions } from './types';
import { BoxPlotPanel } from './BoxPlotPanel';

export const plugin = new PanelPlugin<SimpleOptions>(BoxPlotPanel)
  .setPanelOptions((builder) => {
    builder
      .addTextInput({
        path: 'text',
        name: 'Simple text option',
        description: 'Description of panel option',
        defaultValue: 'Default value of text input option',
      })
      .addRadio({
        path: 'boxplotType',
        defaultValue: 'time',
        name: 'Type',
        settings: {
          options: [
            {
              value: 'time',
              label: 'Time',
            },
            {
              value: 'series',
              label: 'Series',
            },
          ],
        },
      })
      .addRadio({
        path: 'seriesCountSize',
        defaultValue: 'sm',
        name: 'Series counter size',
        settings: {
          options: [
            {
              value: 'sm',
              label: 'Small',
            },
            {
              value: 'md',
              label: 'Medium',
            },
            {
              value: 'lg',
              label: 'Large',
            },
          ],
        },
        showIf: (config) => config.showSeriesCount,
      });

    const sliderOption = { 
      path: 'd3ThresholdNum', 
      name: 'Number of Buckets (approximate)',
      defaultValue: 40
    };

    if (typeof builder.addSliderInput === 'undefined') {
      // v7 compatible
      builder.addNumberInput({
        ...sliderOption,
        settings: {
          min: 2,
          max: 50,
          step: 1,
          integer: true
        }
      });
    } else {
      builder.addSliderInput({
        ...sliderOption,
        settings: {
          min: 2,
          max: 50,
          step: 1,
          ariaLabelForHandle: "Number of Buckets",
        },
      });
    }
  });

if (typeof FieldColorModeId !== "undefined") {
  plugin
    .useFieldConfig({
      standardOptions: {
        [FieldConfigProperty.Color]: {
          settings: {
            byValueSupport: true,
            bySeriesSupport: true,
            preferThresholdsMode: false,
          },
          defaultValue: {
            mode: FieldColorModeId?.PaletteClassic,
          },
        },
      },
      disableStandardOptions: [
        FieldConfigProperty.Min,
        FieldConfigProperty.Max,
        FieldConfigProperty.Decimals,
        FieldConfigProperty.DisplayName,
        FieldConfigProperty.NoValue,
      ],
    });
}
