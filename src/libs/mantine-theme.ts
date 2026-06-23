import { createTheme, type MantineColorsTuple } from '@mantine/core';

const dodamYellow: MantineColorsTuple = [
  '#fffbe4',
  '#fff5c2',
  '#ffed99',
  '#ffe566',
  '#ffdd33',
  '#FFD600',
  '#e6c100',
  '#ccab00',
  '#b39600',
  '#998000',
];

export const theme = createTheme({
  primaryColor: 'dodamYellow',
  colors: { dodamYellow },
  defaultRadius: 'md',
  fontFamily: "'210OmniGothic035', sans-serif",
  headings: { fontFamily: "'210OmniGothic045', sans-serif" },
  focusRing: 'auto',
  components: {
    Button: {
      defaultProps: {
        color: 'dodamYellow',
      },
    },
    ActionIcon: {
      defaultProps: {
        color: 'dodamYellow',
      },
    },
    Checkbox: {
      defaultProps: {
        color: 'dodamYellow',
      },
    },
    Radio: {
      defaultProps: {
        color: 'dodamYellow',
      },
    },
    Badge: {
      defaultProps: {
        color: 'dodamYellow',
      },
    },
    Tabs: {
      defaultProps: {
        color: 'dodamYellow',
      },
    },
    Loader: {
      defaultProps: {
        color: 'dodamYellow',
      },
    },
  },
});
