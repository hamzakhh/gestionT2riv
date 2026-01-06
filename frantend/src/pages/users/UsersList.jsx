import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  Avatar,
  Fab,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as ManagerIcon,
  Person as UserIcon,
  CheckCircle as ActiveIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import MainCard from 'components/MainCard';
import userService from 'api/userService';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await userService.getUsers();
        console.log('Réponse API users:', data);
        console.log('Array.isArray(data):', Array.isArray(data));
        console.log('data.data existe?', !!data.data);
        
        // Gérer différents formats de réponse
        let usersData = [];
        if (data && data.data && Array.isArray(data.data)) {
          usersData = data.data;
        } else if (data && Array.isArray(data)) {
          usersData = data;
        } else if (data && data.docs && Array.isArray(data.docs)) {
          usersData = data.docs;
        }
        
        console.log('Données utilisateurs finales:', usersData);
        setUsers(usersData);
      } catch (err) {
        setError(err.message || 'Erreur lors du chargement des utilisateurs');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await userService.deleteUser(id);
        setUsers(Array.isArray(users) ? users.filter(user => user._id !== id) : []);
      } catch (err) {
        setError('Erreur lors de la suppression de l\'utilisateur');
      }
    }
  };

  const filteredUsers = Array.isArray(users) ? users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Chargement des utilisateurs...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <MainCard title="Gestion des utilisateurs">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </MainCard>
    );
  }

  return (
    <MainCard title="Gestion des utilisateurs">
      <Grid container alignItems="center" justifyContent="space-between" mb={2}>
        <Grid item>
          <Typography variant="h3">Liste des Utilisateurs</Typography>
        </Grid>
      </Grid>

      {/* Modern Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Rechercher par nom, email ou nom d'utilisateur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon style={{ marginRight: 8, color: 'text.secondary' }} />
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: 'background.paper',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
              '&.Mui-focused': {
                backgroundColor: 'background.paper',
                boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
              }
            }
          }}
        />
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 3,
            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)'
            }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <PeopleIcon style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.8 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {Array.isArray(users) ? users.length : 0}
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Total des Utilisateurs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            borderRadius: 3,
            boxShadow: '0 8px 25px rgba(245, 87, 108, 0.3)',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)'
            }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <ActiveIcon style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.8 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {Array.isArray(users) ? users.filter(u => u.isActive).length : 0}
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Utilisateurs Actifs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            borderRadius: 3,
            boxShadow: '0 8px 25px rgba(79, 172, 254, 0.3)',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)'
            }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <SecurityIcon style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.8 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {Array.isArray(users) ? users.filter(u => u.role === 'admin').length : 0}
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Administrateurs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Cards Grid */}
      {filteredUsers.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Aucun utilisateur trouvé
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            {searchTerm ? 'Aucun utilisateur ne correspond à votre recherche.' : 'Aucun utilisateur n\'est enregistré.'}
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate('/users/create')}
            startIcon={<PersonAddIcon />}
            sx={{ borderRadius: 2 }}
          >
            Créer le premier utilisateur
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredUsers.map((user) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={user._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: user.isActive
                      ? 'linear-gradient(90deg, #4caf50, #66bb6a)'
                      : 'linear-gradient(90deg, #9e9e9e, #bdbdbd)',
                  },
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
                  }
                }}
              >
                <CardContent sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                  {/* Header with Avatar and Status */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 70,
                        height: 70,
                        mr: 2,
                        bgcolor: user.isActive ? getRoleColor(user.role) + '.main' : 'grey.400',
                        fontSize: '1.2rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {getInitials(user.firstName, user.lastName)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Chip
                        icon={getRoleIcon(user.role)}
                        label={user.role}
                        size="small"
                        color={getRoleColor(user.role)}
                        sx={{ mb: 1, fontWeight: 500 }}
                      />
                      <Chip
                        label={user.isActive ? 'Actif' : 'Inactif'}
                        size="small"
                        color={user.isActive ? 'success' : 'error'}
                      />
                    </Box>
                  </Box>

                  {/* User Info */}
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                    {user.firstName} {user.lastName}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                    @{user.username}
                  </Typography>

                  {/* Contact Info */}
                  {user.email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EmailIcon style={{ fontSize: '16px', marginRight: 8, color: '#666' }} />
                      <Typography variant="body2" color="text.secondary" sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {user.email}
                      </Typography>
                    </Box>
                  )}

                  {user.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PhoneIcon style={{ fontSize: '16px', marginRight: 8, color: '#666' }} />
                      <Typography variant="body2" color="text.secondary">
                        {user.phone}
                      </Typography>
                    </Box>
                  )}

                  {/* Actions */}
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 'auto', pt: 2 }}>
                    <Tooltip title="Modifier">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/users/edit/${user._id}`)}
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'white',
                          '&:hover': { bgcolor: 'primary.dark' },
                          width: 40,
                          height: 40
                        }}
                      >
                        <EditIcon style={{ fontSize: '16px' }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(user._id)}
                        sx={{
                          bgcolor: 'error.main',
                          color: 'white',
                          '&:hover': { bgcolor: 'error.dark' },
                          width: 40,
                          height: 40
                        }}
                      >
                        <DeleteIcon style={{ fontSize: '16px' }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={() => navigate('/users/create')}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 64,
          height: 64,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          '&:hover': {
            transform: 'scale(1.1)',
          },
          transition: 'transform 0.2s ease',
        }}
      >
        <AddIcon style={{ fontSize: '24px' }} />
      </Fab>
    </MainCard>
  );
};

export default UsersList;
