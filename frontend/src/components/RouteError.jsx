import { useRouteError, useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Stack, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';

// ==============================|| ROUTE ERROR ELEMENT ||============================== //

export default function RouteError() {
  const error = useRouteError();
  const navigate = useNavigate();

  const isChunkError = error?.message?.includes('Failed to fetch dynamically imported module') ||
                      error?.message?.includes('Loading chunk') ||
                      error?.message?.includes('ChunkLoadError') ||
                      error?.name === 'ChunkLoadError';

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate('/login', { replace: true });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 3
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 600,
          width: '100%',
          textAlign: 'center'
        }}
      >
        <ErrorOutlineIcon
          sx={{
            fontSize: 64,
            color: 'error.main',
            mb: 2
          }}
        />
        <Typography variant="h4" gutterBottom color="error">
          {isChunkError ? 'Erreur de chargement' : 'Erreur de route'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {isChunkError
            ? 'Le module demandé n\'a pas pu être chargé. Cela peut être dû à une mise à jour de l\'application ou à un problème de connexion. Veuillez recharger la page.'
            : error?.statusText || error?.message || 'Une erreur inattendue s\'est produite lors du chargement de cette page.'}
        </Typography>
        {process.env.NODE_ENV === 'development' && error && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: 'grey.100',
              borderRadius: 1,
              textAlign: 'left',
              maxHeight: 200,
              overflow: 'auto',
              mb: 3
            }}
          >
            <Typography variant="caption" component="pre" sx={{ fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>
              {error.toString()}
              {error.stack && `\n\n${error.stack}`}
            </Typography>
          </Box>
        )}
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={handleReload}
            color="primary"
          >
            Recharger la page
          </Button>
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={handleGoHome}
          >
            Retour à la connexion
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
