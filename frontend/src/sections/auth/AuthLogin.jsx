import PropTypes from 'prop-types';
import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

// material-ui
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';

// third-party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';
import { useAuth } from 'contexts/AuthContext';

// assets
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';
import MailOutlined from '@ant-design/icons/MailOutlined';
import LockOutlined from '@ant-design/icons/LockOutlined';

// ============================|| STYLES ||============================ //

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
  backdropFilter: 'blur(4px)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  backgroundColor: theme.palette.background.paper
}));

const StyledButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1),
  textTransform: 'none',
  fontWeight: 600,
  letterSpacing: '0.5px',
  fontSize: '1rem',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4]
  }
}));

const StyledInput = styled(OutlinedInput)(({ theme }) => ({
  '& .MuiOutlinedInput-input': {
    padding: '12px 14px',
    borderRadius: theme.spacing(1)
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderWidth: '1px',
    boxShadow: `0 0 0 3px ${theme.palette.primary.light}`
  }
}));

// ============================|| JWT - LOGIN ||============================ //

export default function AuthLogin({ isDemo = false }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [checked, setChecked] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <StyledPaper elevation={0}>
      <Box mb={4} textAlign="center">
        <Typography variant="h3" color="primary" fontWeight={700} gutterBottom>
          Bienvenue !
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Connectez-vous pour accéder à votre espace
        </Typography>
      </Box>

      <Formik
        initialValues={{
          email: 'admin@creative.dz',
          password: 'admin123',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().email('Email invalide').max(255).required('Email requis'),
          password: Yup.string().required('Mot de passe requis').min(6, 'Au moins 6 caractères')
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          console.log('🔐 Tentative de connexion...', values.email);
          try {
            setLoading(true);
            const response = await login(values.email, values.password);
            
            console.log('📦 Réponse login:', response);
            
            if (response.success && response.data) {
              console.log('✅ Connexion réussie!');
              
              setStatus({ success: true });
              navigate('/dashboard/default');
            } else {
              console.error('❌ Format de réponse invalide:', response);
              setStatus({ success: false });
              setErrors({ submit: response.message || 'Échec de connexion' });
            }
          } catch (err) {
            console.error('❌ Erreur de connexion:', err);
            setStatus({ success: false });
            setErrors({ submit: err.response?.data?.message || 'Email ou mot de passe incorrect' });
          } finally {
            setLoading(false);
            setSubmitting(false);
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Stack spacing={1.5}>
                  <InputLabel htmlFor="email-login" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    Adresse email
                  </InputLabel>
                  <StyledInput
                    id="email-login"
                    type="email"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="saisir@votre-email.com"
                    fullWidth
                    error={Boolean(touched.email && errors.email)}
                    startAdornment={
                      <InputAdornment position="start" sx={{ color: 'text.secondary', mr: 1 }}>
                        <MailOutlined />
                      </InputAdornment>
                    }
                  />
                  {touched.email && errors.email && (
                    <FormHelperText error sx={{ ml: 1.5 }}>
                      {errors.email}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>
              
              <Grid item xs={12}>
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <InputLabel htmlFor="password-login" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      Mot de passe
                    </InputLabel>
                    <Link 
                      component={RouterLink} 
                      to="/forgot-password" 
                      variant="caption" 
                      color="primary"
                      sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    >
                      Mot de passe oublié ?
                    </Link>
                  </Stack>
                  <StyledInput
                    fullWidth
                    error={Boolean(touched.password && errors.password)}
                    id="password-login"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    name="password"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    startAdornment={
                      <InputAdornment position="start" sx={{ color: 'text.secondary', mr: 1 }}>
                        <LockOutlined />
                      </InputAdornment>
                    }
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          color="secondary"
                          size="large"
                        >
                          {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                        </IconButton>
                      </InputAdornment>
                    }
                    placeholder="••••••••"
                  />
                  {touched.password && errors.password && (
                    <FormHelperText error sx={{ ml: 1.5 }}>
                      {errors.password}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={checked}
                      onChange={(event) => setChecked(event.target.checked)}
                      name="checked"
                      color="primary"
                      size="small"
                      sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }}
                    />
                  }
                  label={
                    <Typography variant="body2" color="textSecondary">
                      Se souvenir de moi
                    </Typography>
                  }
                />
              </Grid>

              {errors.submit && (
                <Grid item xs={12}>
                  <Box 
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: 'error.lighter',
                      border: '1px solid',
                      borderColor: 'error.light',
                      color: 'error.dark'
                    }}
                  >
                    <Typography variant="body2" align="center">
                      {errors.submit}
                    </Typography>
                  </Box>
                </Grid>
              )}

              <Grid item xs={12}>
                <AnimateButton>
                  <StyledButton 
                    fullWidth 
                    size="large" 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    disabled={loading}
                    sx={{
                      background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                        boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)'
                      }
                    }}
                  >
                    {loading ? 'Connexion en cours...' : 'Se connecter'}
                  </StyledButton>
                </AnimateButton>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    OU
                  </Typography>
                </Divider>
              </Grid>

              <Grid item xs={12}>
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Typography variant="body2" color="textSecondary">
                    Vous n'avez pas de compte ?
                  </Typography>
                  <Link 
                    component={RouterLink} 
                    to="/register" 
                    variant="body2" 
                    color="primary"
                    sx={{ fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    S'inscrire
                  </Link>
                </Stack>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </StyledPaper>
  );
}

AuthLogin.propTypes = { isDemo: PropTypes.bool };
