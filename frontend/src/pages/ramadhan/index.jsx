import { Grid, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MainCard from 'components/MainCard';

const RamadhanPage = () => {
  const navigate = useNavigate();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <MainCard title="Ramadhan">
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/don-ramadhan')}
              sx={{ minWidth: 200 }}
            >
              Gestion des Dons Alimentaires
            </Button>
          </Box>
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default RamadhanPage;
