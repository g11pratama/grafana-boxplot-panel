import { PanelPlugin, FieldColorModeId, FieldConfigProperty } from '@grafana/data';
import { SimpleOptions } from './types';
import { BoxPlotPanel } from './BoxPlotPanel';

export const plugin = new PanelPlugin<SimpleOptions>(BoxPlotPanel)
.useFieldConfig({
  standardOptions: {
    [FieldConfigProperty.Color]: {
      settings: {
        byValueSupport: true,
        bySeriesSupport: true,
        preferThresholdsMode: false,
      },
      defaultValue: {
        mode: FieldColorModeId.ContinuousGrYlRd,
        seriesBy: 'min',
      },
    },
  }
  })
  .setPanelOptions((builder) => {
    return builder
      .addTextInput({
        path: 'text',
        name: 'Simple text option',
        description: 'Description of panel option',
        defaultValue: 'Default value of text input option',
      })
      .addBooleanSwitch({
        path: 'showSeriesCount',
        name: 'Show series counter',
        defaultValue: false,
      })
      .addSliderInput({
        path: 'd3ThresholdNum',
        name: 'Number of Buckets (approximate)',
        defaultValue: 40,
        settings: {
          min: 2,
          max: 50,
          step: 1,
          ariaLabelForHandle: "Number of Buckets",
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
  });
