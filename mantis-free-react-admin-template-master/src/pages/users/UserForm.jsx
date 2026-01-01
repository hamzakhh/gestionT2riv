import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  FormHelperText,
  Divider,
  Card,
  CardContent,
  Avatar,
  Alert,
  CircularProgress,
  Fab,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as ManagerIcon,
  Person as UserIcon,
  CheckCircle as ActiveIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import MainCard from 'components/MainCard';
import { createUser, updateUser, getUser } from 'services/userService';
import { ROLES, PAGES } from 'config';
import { useAuth } from 'contexts/AuthContext';

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: ROLES.USER,
    isActive: true,
    pagePermissions: []
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit) {
      const fetchUser = async () => {
        try {
          const user = await getUser(id);
          setFormData({
            username: user.username,
            email: user.email,
            password: '',
            confirmPassword: '',
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone || '',
            role: user.role,
            isActive: user.isActive,
            pagePermissions: user.pagePermissions || []
          });
        } catch (err) {
          setError('Erreur lors du chargement des données de l\'utilisateur');
        } finally {
          setLoading(false);
        }
      };

      fetchUser();
    }
  }, [id, isEdit]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) newErrors.username = 'Le nom d\'utilisateur est requis';
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    if (!isEdit || formData.password) {
      if (!formData.password) {
        newErrors.password = 'Le mot de passe est requis';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }
    if (!formData.firstName.trim()) newErrors.firstName = 'Le prénom est requis';
    if (!formData.lastName.trim()) newErrors.lastName = 'Le nom est requis';
    if (!formData.role) newErrors.role = 'Le rôle est requis';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePagePermissionChange = (pageKey) => (event) => {
    const { checked } = event.target;
    setFormData(prev => ({
      ...prev,
      pagePermissions: checked 
        ? [...prev.pagePermissions, pageKey]
        : prev.pagePermissions.filter(p => p !== pageKey)
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: newValue,
      };
      
      // If role changes, reset pagePermissions
      if (name === 'role') {
        newData.pagePermissions = [];
      }
      
      return newData;
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      const userData = { ...formData };
      
      // Remove confirmPassword before sending
      delete userData.confirmPassword;
      
      // Handle pagePermissions based on role
      if (userData.role === ROLES.ADMIN) {
        // Admin gets all pages
        userData.pagePermissions = Object.values(PAGES);
      } else if (userData.role === ROLES.USER) {
        // User keeps selected pages, or empty array if none
        userData.pagePermissions = userData.pagePermissions || [];
      } else {
        // For other roles, remove pagePermissions
        delete userData.pagePermissions;
      }
      
      // If it's an edit and password is empty, remove it from the data
      if (isEdit && !userData.password) {
        delete userData.password;
      }

      if (isEdit) {
        await updateUser(id, userData);
        setSuccess('Utilisateur mis à jour avec succès');
      } else {
        await createUser(userData);
        setSuccess('Utilisateur créé avec succès');
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: '',
          phone: '',
          role: ROLES.USER,
          isActive: true,
          pagePermissions: []
        });
      }

      // Rediriger vers la liste après un court délai
      setTimeout(() => {
        navigate('/users');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <AdminIcon />;
      case 'manager':
        return <ManagerIcon />;
      default:
        return <UserIcon />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'primary';
      case 'manager':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?';
  };

  return (
    <MainCard title={isEdit ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}>
      {/* Modern Header */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4,
        pb: 3,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{
            width: 60,
            height: 60,
            mr: 3,
            bgcolor: getRoleColor(formData.role) + '.main'
          }}>
            {getInitials(formData.firstName, formData.lastName)}
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              {isEdit ? 'Modifier l\'utilisateur' : 'Créer un utilisateur'}
            </Typography>
            <Chip
              icon={getRoleIcon(formData.role)}
              label={formData.role || 'Sélectionner un rôle'}
              color={getRoleColor(formData.role)}
              size="medium"
              sx={{ fontWeight: 500 }}
            />
          </Box>
        </Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/users')}
          variant="outlined"
          sx={{
            borderRadius: 2,
            textTransform: 'none'
          }}
        >
          Retour à la liste
        </Button>
      </Box>

      {/* Alert Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          {/* Left Column - Personal Information */}
          <Grid item xs={12} md={8}>
            <Card sx={{
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              mb: 4
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3,
                  pb: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}>
                  <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Informations personnelles
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nom d'utilisateur"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      error={!!errors.username}
                      helperText={errors.username}
                      margin="normal"
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                      InputProps={{
                        startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary', fontSize: '1.2rem' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={!!errors.email}
                      helperText={errors.email}
                      margin="normal"
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                      InputProps={{
                        startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary', fontSize: '1.2rem' }} />
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Prénom"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      error={!!errors.firstName}
                      helperText={errors.firstName}
                      margin="normal"
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nom"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      error={!!errors.lastName}
                      helperText={errors.lastName}
                      margin="normal"
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Téléphone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      margin="normal"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                      InputProps={{
                        startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary', fontSize: '1.2rem' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl
                      fullWidth
                      margin="normal"
                      error={!!errors.role}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    >
                      <InputLabel id="role-label">Rôle *</InputLabel>
                      <Select
                        labelId="role-label"
                        name="role"
                        value={formData.role}
                        label="Rôle *"
                        onChange={handleChange}
                        required
                        startAdornment={
                          formData.role && (
                            <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                              {getRoleIcon(formData.role)}
                            </Box>
                          )
                        }
                      >
                        {Object.values(ROLES).map((role) => (
                          <MenuItem key={role} value={role}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {getRoleIcon(role)}
                              <Typography sx={{ ml: 1 }}>{role}</Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Password Section */}
            <Card sx={{
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              mb: 4
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3,
                  pb: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}>
                  <SecurityIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {isEdit ? 'Changer le mot de passe (laisser vide pour ne pas modifier)' : 'Mot de passe'}
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Mot de passe"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      error={!!errors.password}
                      helperText={errors.password || (isEdit ? 'Laisser vide pour ne pas modifier' : '')}
                      margin="normal"
                      required={!isEdit}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Confirmer le mot de passe"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword}
                      margin="normal"
                      required={!isEdit}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - Settings & Permissions */}
          <Grid item xs={12} md={4}>
            {/* Status Card */}
            <Card sx={{
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              mb: 3
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Statut du compte
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isActive}
                      onChange={handleChange}
                      name="isActive"
                      color="primary"
                      icon={<ActiveIcon sx={{ color: 'grey.400' }} />}
                      checkedIcon={<ActiveIcon sx={{ color: 'success.main' }} />}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography sx={{ mr: 1 }}>
                        {formData.isActive ? 'Compte actif' : 'Compte inactif'}
                      </Typography>
                      {formData.isActive && (
                        <Chip
                          label="Actif"
                          size="small"
                          color="success"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                  }
                />
              </CardContent>
            </Card>

            {/* Page Permissions - Only show for Admin users creating/editing USER role */}
            {currentUser?.role === ROLES.ADMIN && formData.role === ROLES.USER && (
              <Card sx={{
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                mb: 3
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Permissions d'accès
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Sélectionnez les pages auxquelles cet utilisateur aura accès
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {Object.entries(PAGES).map(([key, value]) => (
                      <FormControlLabel
                        key={key}
                        control={
                          <Checkbox
                            checked={formData.pagePermissions.includes(value)}
                            onChange={handlePagePermissionChange(value)}
                            color="primary"
                            size="small"
                          />
                        }
                        label={
                          <Typography variant="body2">
                            {value.charAt(0).toUpperCase() + value.slice(1).replace('-', ' ')}
                          </Typography>
                        }
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <Card sx={{
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  disabled={loading}
                  sx={{
                    width: '100%',
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  {loading ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer l\'utilisateur'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </form>
    </MainCard>
  );
};

export default UserForm;
