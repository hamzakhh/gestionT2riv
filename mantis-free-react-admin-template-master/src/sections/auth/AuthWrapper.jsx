import PropTypes from 'prop-types';

// material-ui
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

// project imports
import AuthFooter from 'components/cards/AuthFooter';
import Logo from 'components/logo';
import AuthCard from './AuthCard';

// ==============================|| AUTHENTICATION - WRAPPER ||============================== //

const StyledBox = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundImage: 'url("/images/backgrounds/auth-bg.jpg")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    zIndex: 0
  }
}));

const ContentBox = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 480,
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[16],
  position: 'relative',
  zIndex: 1,
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255, 255, 255, 0.5)'
}));

const LogoContainer = styled(Box)({
  position: 'relative',
  zIndex: 1,
  marginBottom: 32,
  '& img': {
    height: 60,
    width: 'auto',
    maxWidth: '100%'
  }
});

export default function AuthWrapper({ children }) {
  return (
    <StyledBox>
      <LogoContainer>
        <Logo to="/" />
      </LogoContainer>
      <ContentBox>
        {children}
      </ContentBox>
      <Box sx={{ 
        mt: 4, 
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
        color: 'text.primary'
      }}>
        <AuthFooter />
      </Box>
    </StyledBox>
  );
}

AuthWrapper.propTypes = { children: PropTypes.node };
