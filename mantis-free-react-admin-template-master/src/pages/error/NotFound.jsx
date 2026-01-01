import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center'
        }}
      >
        <Typography variant="h1" sx={{ fontSize: '6rem', fontWeight: 'bold', color: 'primary.main' }}>
          404
        </Typography>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Page non trouvée
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </Typography>
        <Button
          variant="contained"
          startIcon={<HomeOutlined />}
          onClick={() => navigate('/dashboard/default')}
          size="large"
        >
          Retour à l'accueil
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;
