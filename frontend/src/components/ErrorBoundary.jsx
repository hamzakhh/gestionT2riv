import React from 'react';
import { Box, Button, Typography, Stack, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';

class ErrorBoundaryClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Check if it's a chunk loading error
    const isChunkError = error?.message?.includes('Failed to fetch dynamically imported module') ||
                        error?.message?.includes('Loading chunk') ||
                        error?.message?.includes('ChunkLoadError') ||
                        error?.name === 'ChunkLoadError';
    
    // Auto-reload for chunk errors (after a short delay to show the error message)
    if (isChunkError) {
      console.warn('Chunk loading error detected. Will attempt to reload...');
      setTimeout(() => {
        // Clear cache before reload
        if ('caches' in window) {
          caches.keys().then((names) => {
            names.forEach((name) => {
              caches.delete(name);
            });
          });
        }
        window.location.reload();
      }, 2000);
    }
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { error } = this.state;
      const isChunkError = error?.message?.includes('Failed to fetch dynamically imported module') ||
                          error?.message?.includes('Loading chunk') ||
                          error?.message?.includes('ChunkLoadError');

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
              {isChunkError ? 'Erreur de chargement' : 'Une erreur est survenue'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {isChunkError
                ? 'Le module demandé n\'a pas pu être chargé. Cela peut être dû à une mise à jour de l\'application ou à un problème de connexion.'
                : 'Une erreur inattendue s\'est produite. Veuillez réessayer.'}
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
                  overflow: 'auto'
                }}
              >
                <Typography variant="caption" component="pre" sx={{ fontSize: '0.75rem' }}>
                  {error.toString()}
                </Typography>
              </Box>
            )}
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={this.handleReset}
                color="primary"
              >
                Recharger la page
              </Button>
              <Button
                variant="outlined"
                startIcon={<HomeIcon />}
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                  window.location.href = '/';
                }}
              >
                Retour à l'accueil
              </Button>
            </Stack>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper with navigation support
export default function ErrorBoundary({ children }) {
  return <ErrorBoundaryClass>{children}</ErrorBoundaryClass>;
}
