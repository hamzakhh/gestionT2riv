// material-ui
import { useTheme } from '@mui/material/styles';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import { Box, useMediaQuery, Typography } from '@mui/material';

// ==============================|| STATS DONUT CHART ||============================== //

export default function StatsDonutChart({ stats }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // Données pour le graphique
  const data = [
    { 
      id: 'orphans', 
      value: stats.orphans?.total || 0, 
      label: 'Orphelins',
      color: 'primary',
      icon: '👨‍👧‍👦'
    },
    { 
      id: 'equipment', 
      value: stats.equipment?.total || 0, 
      label: 'Équipements', 
      color: 'warning',
      icon: '🛠️'
    }
  ];

  // Tailles responsives
  const chartSize = {
    width: isMobile ? '100%' : isTablet ? 400 : 400,
    height: isMobile ? 250 : 300,
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
      fontWeight: 700,
      fontSize: '0.85rem',
      background: 'linear-gradient(45deg, #2196F3, #4CAF50, #FFC107, #9C27B0)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '1px 1px 2px rgba(255,255,255,0.5)',
    },
  };

  // Dégradé de couleurs vives pour chaque section
  const getColor = (color) => {
    switch (color) {
      case 'primary':
        return 'linear-gradient(135deg, #4CAF50, #8BC34A)'; // Dégradé de vert
      case 'success':
        return 'linear-gradient(135deg, #2196F3, #03A9F4)'; // Dégradé de bleu
      case 'warning':
        return 'linear-gradient(135deg, #FFC107, #FF9800)'; // Dégradé d'orange
      case 'info':
        return 'linear-gradient(135deg, #9C27B0, #E91E63)'; // Dégradé de violet à rose
      default:
        return 'linear-gradient(135deg, #00BCD4, #00E5FF)'; // Dégradé de cyan
    }
  };
  
  // Couleurs de fond plus claires pour la légende
  const getLightColor = (color) => {
    switch (color) {
      case 'primary':
        return 'rgba(76, 175, 80, 0.1)';
      case 'success':
        return 'rgba(33, 150, 243, 0.1)';
      case 'warning':
        return 'rgba(255, 193, 7, 0.1)';
      case 'info':
        return 'rgba(156, 39, 176, 0.1)';
      default:
        return 'rgba(0, 188, 212, 0.1)';
    }
  };

  // Formatage des données pour la légende personnalisée
  const renderCustomLegend = () => (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: isMobile ? 'row' : 'column',
      flexWrap: 'wrap',
      gap: 2,
      justifyContent: 'center',
      mt: isMobile ? 2 : 0,
      ml: isMobile ? 0 : 2,
      maxWidth: isMobile ? '100%' : 200
    }}>
      {data.map((item) => (
        <Box 
          key={item.id} 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            p: 1.5,
            borderRadius: 2,
            bgcolor: getLightColor(item.color),
            width: isMobile ? '45%' : '100%',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 2
            }
          }}
        >
          <Box sx={{
            width: 36, 
            height: 36, 
            background: getColor(item.color),
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.1) rotate(5deg)'
            }
          }}>
            {item.icon}
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2" color="text.secondary">
              {item.label}
            </Typography>
            <Typography variant="h6" fontWeight="bold" color={getColor(item.color)}>
              {item.value.toLocaleString()}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%', 
      p: 2,
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2
    }}>
      <Box sx={{ flex: 1, maxWidth: 300 }}>
        <PieChart
          series={[
            {
              data: data.map(item => ({
                ...item,
                value: item.value || 0.1, // Évite les erreurs avec des valeurs à zéro
              })),
              innerRadius: 60,
              outerRadius: 120,
              paddingAngle: 2,
              cornerRadius: 5,
              startAngle: -90,
              endAngle: 270,
              cx: 150,
              cy: 150,
              highlightScope: { faded: 'global', highlighted: 'item' },
              faded: { innerRadius: 30, additionalRadius: -10, color: 'gray' },
            },
          ]}
          slotProps={{
            legend: { hidden: true },
          }}
          sx={chartSx}
          colors={data.map(item => getColor(item.color))}
          {...chartSize}
        >
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="rgba(0,0,0,0.2)" />
            </filter>
          </defs>
        </PieChart>
      </Box>
      {renderCustomLegend()}
    </Box>
  );
}
