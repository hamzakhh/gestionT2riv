import PropTypes from 'prop-types';
// material-ui
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'components/MainCard';

// assets
import RiseOutlined from '@ant-design/icons/RiseOutlined';
import FallOutlined from '@ant-design/icons/FallOutlined';

const iconSX = { fontSize: '0.75rem', color: 'inherit', marginLeft: 0, marginRight: 0 };

export default function AnalyticEcommerce({ color = 'primary', title, count, percentage, isLoss, extra, icon, cardSx }) {
  return (
    <MainCard contentSX={{ p: 2.25 }} sx={cardSx}>
      <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Grid sx={{ flex: 1, minWidth: 0 }}>
          <Stack sx={{ gap: 0.5 }}>
            <Typography variant="h6" color="text.secondary">
              {title}
            </Typography>
            <Grid container sx={{ alignItems: 'center' }}>
              <Grid>
                <Typography variant="h4" color="inherit">
                  {count}
                </Typography>
              </Grid>
              {percentage !== undefined && percentage !== 0 && (
                <Grid>
                  <Chip
                    variant="combined"
                    color={color}
                    icon={isLoss ? <FallOutlined style={iconSX} /> : <RiseOutlined style={iconSX} />}
                    label={`${percentage}%`}
                    sx={{ ml: 1.25, pl: 1 }}
                    size="small"
                  />
                </Grid>
              )}
            </Grid>
          </Stack>
        </Grid>
        {icon && (
          <Grid>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: `${color}.lighter`,
                color: `${color}.darker`
              }}
            >
              {icon}
            </Box>
          </Grid>
        )}
      </Grid>
      
    </MainCard>
  );
}

AnalyticEcommerce.propTypes = {
  color: PropTypes.string,
  title: PropTypes.string,
  count: PropTypes.string,
  percentage: PropTypes.number,
  isLoss: PropTypes.bool,
  extra: PropTypes.string,
  icon: PropTypes.node,
  cardSx: PropTypes.object
};
