// material-ui
import { useTheme } from '@mui/material/styles';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import { Box, useMediaQuery } from '@mui/material';

// Sample data for the donut chart
const data = [
  { value: 60, label: 'Zakat', color: 'primary' },
  { value: 25, label: 'Ramadan', color: 'secondary' },
  { value: 15, label: 'Autres', color: 'warning' },
];

// ==============================|| DONUT CHART ||============================== //

export default function DonutChart() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // Tailles responsives
  const chartSize = {
    width: isMobile ? '100%' : isTablet ? 500 : 600,
    height: isMobile ? 300 : 350,
  };

  const chartSx = {
    width: '100%',
    height: '100%',
    '& .MuiPieArc-root': {
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        filter: 'brightness(1.1)',
        transform: 'scale(1.02)',
      },
    },
    [`& .${pieArcLabelClasses.root}`]: {
      fill: theme.palette.background.paper,
      fontWeight: 600,
      fontSize: '0.8rem',
      filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.3))',
    },
  };

  return (
    <Box sx={{ width: '100%', height: '100%', p: 2 }}>
      <PieChart
        series={[
          {
            data,
            innerRadius: isMobile ? 70 : 100,
            outerRadius: isMobile ? 120 : 150,
            paddingAngle: 5,
            cornerRadius: 8,
            startAngle: -90,
            endAngle: 270,
            cx: '50%',
            cy: '50%',
            highlightScope: { faded: 'global', highlighted: 'item' },
            faded: { innerRadius: 30, additionalRadius: -10, color: 'gray' },
          },
        ]}
        slotProps={{
          legend: {
            direction: isMobile ? 'row' : 'column',
            position: { vertical: 'middle', horizontal: isMobile ? 'middle' : 'right' },
            padding: 0,
            labelStyle: {
              fontSize: 14,
              fontWeight: 500,
              fill: theme.palette.text.primary,
            },
            itemMarkWidth: 12,
            itemMarkHeight: 12,
            markGap: 8,
            itemGap: isMobile ? 10 : 16,
          },
        }}
        sx={chartSx}
        colors={data.map((item) => {
          switch (item.color) {
            case 'primary':
              return `linear-gradient(145deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`;
            case 'secondary':
              return `linear-gradient(145deg, ${theme.palette.secondary.light}, ${theme.palette.secondary.main})`;
            case 'warning':
              return `linear-gradient(145deg, ${theme.palette.warning.light}, ${theme.palette.warning.main})`;
            default:
              return theme.palette.grey[500];
          }
        })}
        {...chartSize}
      >
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="rgba(0,0,0,0.2)" />
          </filter>
        </defs>
      </PieChart>
    </Box>
  );
}
