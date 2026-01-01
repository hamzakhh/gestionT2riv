import { useEffect, useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import Chip from '@mui/material/Chip';

// project imports
import MainCard from 'components/MainCard';
import PrintButton from 'components/PrintButton';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';
import { UserAddOutlined, UserOutlined, ToolOutlined, DollarOutlined, TeamOutlined } from '@ant-design/icons';
import MonthlyBarChart from 'sections/dashboard/default/MonthlyBarChart';
import StatsDonutChart from 'sections/dashboard/default/StatsDonutChart';
 
import orphanService from 'services/orphanService';
import equipmentService from 'services/equipmentService';
import donorService from 'services/donorService';

// assets

 

// ==============================|| DASHBOARD - DEFAULT ||============================== //

export default function DashboardDefault() {
  const [stats, setStats] = useState({
    orphans: {},
    equipment: {},
    donors: {}
  });
  const [loading, setLoading] = useState(false);
 

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const [orph, equip, donors] = await Promise.all([
          orphanService.getStats().catch(() => ({})),
          equipmentService.getStats().catch(() => ({})),
          donorService.getStats().catch(() => ({}))
        ]);
        setStats({ 
          orphans: orph?.data ?? orph, 
          equipment: equip?.data ?? equip,
          donors: donors?.data ?? donors
        });
      } catch (e) {
        // ignore for dashboard; could add toast
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      py: 4
    }}>
      <Grid container rowSpacing={4.5} columnSpacing={2.75} sx={{ maxWidth: '1200px', mx: 'auto', px: 2 }}>
      {/* Ligne des statistiques */}
      <Grid container spacing={2} sx={{ mt: 2, width: '100%', maxWidth: '100%', justifyContent: 'center', flexWrap: 'nowrap' }}>
        {/* Carte Orphelins */}
        <Grid item xs={12} sm={6} lg={3} sx={{ flex: '0 1 280px', maxWidth: '100%' }}>
          <Box sx={{
            p: 3,
            borderRadius: 3,
            background: 'linear-gradient(195deg, #FF6B6B 0%, #FF4D4D 100%)',
            color: 'white',
            boxShadow: '0 6px 20px 0 rgba(0, 0, 0, 0.15), 0 8px 10px -5px rgba(255, 107, 107, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 12px 15px -5px rgba(255, 107, 107, 0.4)',
            }
          }}>
            <Typography variant="h6" sx={{ opacity: 0.8, mb: 1, position: 'relative', zIndex: 1 }}>Orphelins</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{stats.orphans?.total || 0}</Typography>
              <TeamOutlined sx={{ fontSize: '2.5rem', color: 'rgba(255,255,255,0.8)' }} />
            </Box>
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', opacity: 0.8, position: 'relative', zIndex: 1 }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <Box sx={{ height: 4, background: 'rgba(255,255,255,0.3)', borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ width: '70%', height: '100%', background: 'white' }} />
                </Box>
              </Box>
              <Typography variant="body2">70%</Typography>
            </Box>
          </Box>
        </Grid>

        {/* Carte Donateurs */}
        <Grid item xs={12} sm={6} lg={3} sx={{ flex: '0 1 280px', maxWidth: '100%' }}>
          <Box sx={{
            p: 3,
            borderRadius: 3,
            background: 'linear-gradient(195deg, #00BCD4 0%, #0097A7 100%)',
            color: 'white',
            boxShadow: '0 6px 20px 0 rgba(0, 0, 0, 0.15), 0 8px 10px -5px rgba(0, 188, 212, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 12px 15px -5px rgba(0, 188, 212, 0.4)',
            }
          }}>
            <Typography variant="h6" sx={{ opacity: 0.8, mb: 1, position: 'relative', zIndex: 1 }}>Donateurs</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{stats.donors?.total || 0}</Typography>
              <UserOutlined sx={{ fontSize: '2.5rem', color: 'rgba(255,255,255,0.8)' }} />
            </Box>
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', opacity: 0.8, position: 'relative', zIndex: 1 }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <Box sx={{ height: 4, background: 'rgba(255,255,255,0.3)', borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ width: '50%', height: '100%', background: 'white' }} />
                </Box>
              </Box>
              <Typography variant="body2">50%</Typography>
            </Box>
          </Box>
        </Grid>

        {/* Carte Équipements */}
        <Grid item xs={12} sm={6} lg={3} sx={{ flex: '0 1 280px', maxWidth: '100%' }}>
          <Box sx={{
            p: 3,
            borderRadius: 3,
            background: 'linear-gradient(195deg, #9C27B0 0%, #6A1B9A 100%)',
            color: 'white',
            boxShadow: '0 6px 20px 0 rgba(0, 0, 0, 0.15), 0 8px 10px -5px rgba(156, 39, 176, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 12px 15px -5px rgba(156, 39, 176, 0.4)',
            }
          }}>
            <Typography variant="h6" sx={{ opacity: 0.8, mb: 1, position: 'relative', zIndex: 1 }}>Équipements</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{stats.equipment?.total || 0}</Typography>
              <ToolOutlined sx={{ fontSize: '2.5rem', color: 'rgba(255,255,255,0.8)' }} />
            </Box>
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', opacity: 0.8, position: 'relative', zIndex: 1 }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <Box sx={{ height: 4, background: 'rgba(255,255,255,0.3)', borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ width: '90%', height: '100%', background: 'white' }} />
                </Box>
              </Box>
              <Typography variant="body2">90%</Typography>
            </Box>
          </Box>
        </Grid>

        {/* Carte Dons */}
        <Grid item xs={12} sm={6} lg={3} sx={{ flex: '0 1 280px', maxWidth: '100%' }}>
          <Box sx={{
            p: 3,
            borderRadius: 3,
            background: 'linear-gradient(195deg, #FFC107 0%, #FFA000 100%)',
            color: 'white',
            boxShadow: '0 6px 20px 0 rgba(0, 0, 0, 0.15), 0 8px 10px -5px rgba(255, 193, 7, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 12px 15px -5px rgba(255, 193, 7, 0.4)',
            }
          }}>
            <Typography variant="h6" sx={{ opacity: 0.8, mb: 1, position: 'relative', zIndex: 1 }}>Dons Zakat</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{stats.zakat?.total || 25}</Typography>
              <DollarOutlined sx={{ fontSize: '2.5rem', color: 'rgba(255,255,255,0.8)' }} />
            </Box>
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', opacity: 0.8, position: 'relative', zIndex: 1 }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <Box sx={{ height: 4, background: 'rgba(255,255,255,0.3)', borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ width: '85%', height: '100%', background: 'white' }} />
                </Box>
              </Box>
              <Typography variant="body2">85%</Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Graphique Circulaire Moderne */}
      <Grid item xs={12} sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Box
          sx={{
            background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
            borderRadius: '24px',
            boxShadow: '0 20px 40px 0 rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.8)',
            p: 4,
            width: '100%',
            maxWidth: '900px',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              borderRadius: '24px',
              pointerEvents: 'none',
            },
            '&:hover': {
              boxShadow: '0 25px 50px 0 rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.9)',
              transform: 'translateY(-2px)',
              transition: 'all 0.3s ease-in-out'
            },
            transition: 'all 0.3s ease-in-out'
          }}
        >
          <Typography variant="h4" sx={{ mb: 4, textAlign: 'center', color: 'text.primary', fontWeight: 700, position: 'relative', zIndex: 1 }}>
            📊 Analyse des Données
          </Typography>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <Box sx={{ width: { xs: '100%', md: '50%' }, height: '350px', display: 'flex', justifyContent: 'center' }}>
              <PieChart
                series={[
                  {
                    data: [
                      { 
                        value: stats.orphans?.total || 0, 
                        label: 'Orphelins',
                        color: '#FF6B6B'
                      },
                      { 
                        value: stats.equipment?.total || 0, 
                        label: 'Équipements',
                        color: '#9C27B0'
                      },
                      { 
                        value: stats.donors?.total || 0, 
                        label: 'Donateurs',
                        color: '#00BCD4'
                      },
                      { 
                        value: stats.zakat?.total || 25, 
                        label: 'Dons Zakat',
                        color: '#FFC107'
                      }
                    ],
                    innerRadius: 60,
                    outerRadius: 120,
                    paddingAngle: 3,
                    cornerRadius: 8,
                    startAngle: -90,
                    endAngle: 270,
                    cx: 150,
                    cy: 150,
                    highlightScope: { faded: 'global', highlighted: 'item' },
                    faded: { innerRadius: 40, additionalRadius: -20, color: 'rgba(0,0,0,0.1)' },
                    highlighted: { additionalRadius: 10 },
                  },
                ]}
                width={350}
                height={350}
                slotProps={{
                  legend: { hidden: true },
                }}
                sx={{
                  '& .MuiPieArc-root': {
                    stroke: '#ffffff',
                    strokeWidth: 3,
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
                    '&:hover': {
                      filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.2))',
                      transform: 'scale(1.05)',
                      transition: 'all 0.3s ease',
                    },
                    transition: 'all 0.3s ease',
                  },
                }}
              >
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
              </PieChart>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 3, 
              ml: { xs: 0, md: 6 },
              mt: { xs: 4, md: 0 },
              width: { xs: '100%', md: '40%' }
            }}>
              {[
                { label: 'Orphelins', value: stats.orphans?.total || 0, color: '#FF6B6B', icon: '👨‍👧‍👦' },
                { label: 'Équipements', value: stats.equipment?.total || 0, color: '#9C27B0', icon: '🛠️' },
                { label: 'Donateurs', value: stats.donors?.total || 0, color: '#00BCD4', icon: '👥' },
                { label: 'Dons Zakat', value: stats.zakat?.total || 25, color: '#FFC107', icon: '💰' }
              ].map((item, index) => (
                <Box key={index} sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  p: 2,
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateX(5px)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                  }
                }}>
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%',
                    background: item.color,
                    mr: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }} />
                  <Typography variant="body1" sx={{ color: 'text.secondary', minWidth: '120px', fontWeight: 500 }}>
                    {item.icon} {item.label}:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, ml: 1, color: item.color }}>
                    {item.value.toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Grid>

      {/* Graphique à Barres Mensuel */}
      <Grid item xs={12} sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Box
          sx={{
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            borderRadius: '24px',
            boxShadow: '0 20px 40px 0 rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.8)',
            p: 4,
            width: '100%',
            maxWidth: '900px',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              borderRadius: '24px',
              pointerEvents: 'none',
            },
            '&:hover': {
              boxShadow: '0 25px 50px 0 rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.9)',
              transform: 'translateY(-2px)',
              transition: 'all 0.3s ease-in-out'
            },
            transition: 'all 0.3s ease-in-out'
          }}
        >
          <Typography variant="h4" sx={{ mb: 4, textAlign: 'center', color: 'text.primary', fontWeight: 700, position: 'relative', zIndex: 1 }}>
            📈 Tendances Mensuelles
          </Typography>
          <Box sx={{ position: 'relative', zIndex: 1, height: '400px', display: 'flex', justifyContent: 'center' }}>
            <BarChart
              series={[
                {
                  data: [85, 92, 78, 95, 88, 102, 96],
                  label: 'Activités',
                  color: '#FF6B6B',
                },
                {
                  data: [72, 85, 90, 78, 95, 88, 92],
                  label: 'Dons',
                  color: '#00BCD4',
                }
              ]}
              height={350}
              xAxis={[{
                data: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul'],
                scaleType: 'band',
                tickSize: 10,
                disableLine: true,
                categoryGapRatio: 0.6,
              }]}
              yAxis={[{
                position: 'left',
                disableLine: true,
                disableTicks: false,
                tickSize: 8,
              }]}
              slotProps={{
                bar: {
                  rx: 6,
                  ry: 6
                }
              }}
              axisHighlight={{ x: 'none' }}
              margin={{ left: 60, right: 20, top: 20, bottom: 60 }}
              sx={{
                '& .MuiBarElement-root': {
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                  '&:hover': {
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2)) brightness(1.1)',
                    transform: 'scaleY(1.05)',
                    transition: 'all 0.3s ease',
                  },
                  transition: 'all 0.3s ease',
                },
                '& .MuiChartsAxis-root': {
                  '& .MuiChartsAxis-tickLabel': {
                    fill: '#666',
                    fontWeight: 500,
                  },
                  '& .MuiChartsAxis-line': {
                    stroke: '#e0e0e0',
                  }
                },
                '& .MuiChartsLegend-root': {
                  '& .MuiChartsLegend-series': {
                    '& .MuiChartsLegend-mark': {
                      rx: 4,
                      ry: 4,
                    }
                  }
                }
              }}
            />
          </Box>
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 4,
            mt: 2,
            flexWrap: 'wrap'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: '#FF6B6B',
                boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)'
              }} />
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Activités
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: '#00BCD4',
                boxShadow: '0 2px 8px rgba(0, 188, 212, 0.3)'
              }} />
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Dons
              </Typography>
            </Box>
          </Box>
        </Box>
      </Grid>
    </Grid>
  </Box>
  );
}
