import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  ListItemText,
  TableSortLabel,
  Menu,
  Divider,
  FormGroup,
  FormControlLabel,
  Switch,
  Toolbar
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Cancel as CancelIcon,
  AssignmentReturn as ReturnIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ArrowDownward as ArrowDownwardIcon,
  ArrowUpward as ArrowUpwardIcon,
  FileDownload as FileDownloadIcon,
  MoreVert as MoreVertIcon,
  Sort as SortIcon,
  FilterAlt as FilterAltIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import MainCard from 'components/MainCard';
import loanService from 'api/loanService';
import useConfirm from 'hooks/useConfirm.jsx';

// Table columns configuration
const columns = [
  { id: 'id', label: 'ID', sortable: true, width: 80 },
  { id: 'borrowerName', label: 'Borrower', sortable: true },
  { id: 'equipmentName', label: 'Equipment', sortable: true },
  { id: 'startDate', label: 'Start Date', sortable: true, align: 'right' },
  { id: 'dueDate', label: 'Due Date', sortable: true, align: 'right' },
  { id: 'status', label: 'Status', sortable: true, align: 'center' },
  { id: 'actions', label: 'Actions', align: 'center', width: 120 }
];

// Status options for filtering
const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active', color: 'primary' },
  { value: 'overdue', label: 'Overdue', color: 'error' },
  { value: 'returned', label: 'Returned', color: 'success' },
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'cancelled', label: 'Cancelled', color: 'default' }
];

const LoanList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const anchorRef = useRef(null);
  
  // States for data and loading
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loans, setLoans] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  
  // Status options
  const statusOptions = [
    { value: 'active', label: 'Actif', color: 'success' },
    { value: 'overdue', label: 'En retard', color: 'error' },
    { value: 'completed', label: 'Terminé', color: 'info' },
    { value: 'cancelled', label: 'Annulé', color: 'warning' },
    { value: 'pending', label: 'En attente', color: 'default' }
  ];

  // States for filtering and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    startDate: null,
    endDate: null,
    equipmentType: '',
    borrowerType: ''
  });
  const [sortConfig, setSortConfig] = useState({
    field: 'createdAt',
    direction: 'desc'
  });
  
  // UI States
  const [selected, setSelected] = useState([]);
  const [openFilters, setOpenFilters] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState(
    columns.reduce((acc, col) => ({ ...acc, [col.id]: true }), {})
  );
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const { showConfirm, ConfirmDialog } = useConfirm();
  
  // Fetch loans with pagination, filtering, and sorting
  const fetchLoans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        status: filters.status === 'all' ? '' : filters.status,
        startDate: filters.startDate,
        endDate: filters.endDate,
        sortBy: sortConfig.field,
        sortOrder: sortConfig.direction
      };
      
      const response = await loanService.getLoans(params);
      
      setLoans(response.data || []);
      setTotalItems(response.count || 0);
    } catch (error) {
      console.error('Error loading loans:', error);
      setError(error.message || 'An error occurred while loading loans');
      setSnackbar({
        open: true,
        message: error.message || 'Failed to load loans',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, filters, sortConfig]);

  // Handle sort request
  const handleSort = (field) => {
    const isAsc = sortConfig.field === field && sortConfig.direction === 'asc';
    setSortConfig({
      field,
      direction: isAsc ? 'desc' : 'asc'
    });
  };

  // Handle row selection
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = loans.map((loan) => loan.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  // Handle single row selection
  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  // Handle filter change
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      status: 'all',
      startDate: null,
      endDate: null,
      equipmentType: '',
      borrowerType: ''
    });
    setSearchTerm('');
    setSortConfig({ field: 'createdAt', direction: 'desc' });
  };

  // Export data
  const handleExport = async (format) => {
    try {
      let data;
      const exportFilters = {
        ...filters,
        status: filters.status === 'all' ? '' : filters.status,
        search: searchTerm
      };

      if (format === 'csv') {
        data = await loanService.exportToCSV(exportFilters);
        downloadFile(data, 'loans.csv', 'text/csv');
      } else if (format === 'pdf') {
        data = await loanService.exportToPDF(exportFilters);
        downloadFile(data, 'loans.pdf', 'application/pdf');
      }

      setSnackbar({
        open: true,
        message: `Exported to ${format.toUpperCase()} successfully`,
        severity: 'success'
      });
    } catch (error) {
      console.error(`Error exporting to ${format}:`, error);
      setSnackbar({
        open: true,
        message: `Failed to export to ${format}`,
        severity: 'error'
      });
    }
  };

  // Download file helper
  const downloadFile = (data, filename, type) => {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Bulk update status
  const handleBulkStatusUpdate = async (status) => {
    if (selected.length === 0) return;
    
    try {
      await loanService.bulkUpdateStatus(selected, status);
      await fetchLoans();
      setSelected([]);
      setSnackbar({
        open: true,
        message: `Updated ${selected.length} loan(s) to ${status}`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating loan statuses:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update loan statuses',
        severity: 'error'
      });
    }
  };

  // Toggle column visibility
  const toggleColumnVisibility = (columnId) => {
    setColumnVisibility(prev => ({
      ...prev,
      [columnId]: !prev[columnId]
    }));
  };

  // Load loans on component mount and when dependencies change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLoans();
    }, 500); // Debounce search
    
    return () => clearTimeout(timer);
  }, [fetchLoans]);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search input change with debounce
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Handle status filter change
  const handleStatusChange = (event) => {
    handleFilterChange('status', event.target.value);
    setPage(0);
  };

  // Toggle filters menu
  const handleFilterMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Close filters menu
  const handleFilterMenuClose = () => {
    setAnchorEl(null);
  };

  // Toggle column visibility menu
  const handleColumnMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Close column visibility menu
  const handleColumnMenuClose = () => {
    setAnchorEl(null);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Handle delete loan
  const handleDeleteLoan = async (loanId) => {
    const confirm = await showConfirm({
      title: 'Supprimer le prêt',
      message: 'Êtes-vous sûr de vouloir supprimer définitivement ce prêt ? Cette action est irréversible.',
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      confirmColor: 'error'
    });

    if (confirm) {
      try {
        await loanService.deleteLoan(loanId);
        await fetchLoans();
        setSnackbar({
          open: true,
          message: 'Prêt supprimé avec succès',
          severity: 'success'
        });
      } catch (error) {
        console.error('Error deleting loan:', error);
        let errorMessage = 'Erreur lors de la suppression du prêt';
        
        if (error.response) {
          // La requête a été faite et le serveur a répondu avec un statut d'erreur
          if (error.response.status === 500) {
            errorMessage = 'Erreur serveur : Impossible de supprimer le prêt. Veuillez réessayer plus tard.';
          } else if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        } else if (error.request) {
          // La requête a été faite mais aucune réponse n'a été reçue
          errorMessage = 'Pas de réponse du serveur. Vérifiez votre connexion Internet.';
        }
        
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error',
          autoHideDuration: 10000 // Afficher plus longtemps pour permettre la lecture du message
        });
      }
    }
  };

  // Handle cancel loan
  const handleCancelLoan = async (loanId) => {
    const confirm = await showConfirm({
      title: 'Annuler le prêt',
      message: 'Êtes-vous sûr de vouloir annuler ce prêt ? Cette action est irréversible.',
      confirmText: 'Annuler le prêt',
      cancelText: 'Ne pas annuler',
      confirmColor: 'warning'
    });

    if (confirm) {
      try {
        await loanService.cancelLoan(loanId, 'Annulé par l\'utilisateur');
        await fetchLoans();
        setSnackbar({
          open: true,
          message: 'Prêt annulé avec succès',
          severity: 'success'
        });
      } catch (error) {
        console.error('Error cancelling loan:', error);
        let errorMessage = 'Erreur lors de l\'annulation du prêt';
        
        if (error.response) {
          // La requête a été faite et le serveur a répondu avec un statut d'erreur
          if (error.response.status === 500) {
            errorMessage = 'Erreur serveur : Impossible d\'annuler le prêt. Veuillez réessayer plus tard.';
          } else if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        } else if (error.request) {
          // La requête a été faite mais aucune réponse n'a été reçue
          errorMessage = 'Pas de réponse du serveur. Vérifiez votre connexion Internet.';
        } else {
          // Une erreur s'est produite lors de la configuration de la requête
          errorMessage = 'Erreur de configuration de la requête';
        }
        
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error',
          autoHideDuration: 10000 // Afficher plus longtemps pour permettre la lecture du message
        });
      }
    }
  };


  // Get status chip color based on status and loan data
  const getStatusColor = (status, loan) => {
    const now = new Date();
    const isOverdue = status === 'active' &&
      loan?.expectedReturnDate &&
      new Date(loan.expectedReturnDate) < now;

    if (isOverdue) return 'error';

    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.color : 'default';
  };

  // Translate status to user-friendly text
  const translateStatus = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.label : status;
  };
  
  // Show loading state
  if (loading && loans.length === 0) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Show error state
  if (error && loans.length === 0) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ my: 3 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          onClick={fetchLoans}
          startIcon={<RefreshIcon />}
        >
          Réessayer
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <ConfirmDialog />
      <Stack spacing={3}>
        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity} 
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
        
        {/* Header with title and action buttons */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Typography variant="h4">Gestion des prêts</Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchLoans}
              disabled={loading}
            >
              Actualiser
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/loans/new')}
            >
              Nouveau prêt
            </Button>
          </Stack>
        </Stack>

        <MainCard title={`Prêts ${filters.status === 'all' ? '' : translateStatus(filters.status).toLowerCase()}`}>
          {/* Filters and search */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Rechercher un équipement ou un patient..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-filter-label">Statut</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={filters.status}
                  label="Statut"
                  onChange={handleStatusChange}
                >
                  <MenuItem value="all">Tous les statuts</MenuItem>
                  <MenuItem value="active">Actifs</MenuItem>
                  <MenuItem value="overdue">En retard</MenuItem>
                  <MenuItem value="completed">Terminés</MenuItem>
                  <MenuItem value="cancelled">Annulés</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                sx={{ height: '40px' }}
                onClick={() => {
                  // TODO: Implement advanced filters
                  setSnackbar({
                    open: true,
                    message: 'Fonctionnalité de filtrage avancé à venir',
                    severity: 'info'
                  });
                }}
              >
                Plus de filtres
              </Button>
            </Grid>
          </Grid>
          
          {/* Error message */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {/* Loading indicator */}
          {loading && (
            <Box display="flex" justifyContent="center" my={2}>
              <CircularProgress size={24} />
            </Box>
          )}

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Équipement</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Date de prêt</TableCell>
                  <TableCell>Retour prévu</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Box textAlign="center" p={2}>
                        <InfoIcon color="disabled" fontSize="large" />
                        <Typography variant="subtitle1" color="textSecondary" mt={1}>
                          Aucun prêt trouvé
                        </Typography>
                        <Typography variant="body2" color="textSecondary" mt={1}>
                          {searchTerm || filters.status !== 'all' ? (
                            'Aucun résultat ne correspond à vos critères de recherche.'
                          ) : (
                            'Aucun prêt n\'a été enregistré pour le moment.'
                          )}
                        </Typography>
                        {(searchTerm || filters.status !== 'all') && (
                          <Button 
                            variant="outlined" 
                            color="primary" 
                            sx={{ mt: 2 }}
                            onClick={() => {
                              setSearchTerm('');
                              handleFilterChange('status', 'all');
                            }}
                          >
                            Réinitialiser les filtres
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  loans.map((loan) => {
                    const isOverdue = loan.status === 'active' && 
                      loan.expectedReturnDate && 
                      new Date(loan.expectedReturnDate) < new Date();
                      
                    return (
                      <TableRow 
                        key={loan._id} 
                        hover 
                        sx={{
                          '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                            cursor: 'pointer'
                          },
                          ...(isOverdue && {
                            backgroundColor: theme.palette.error.veryLight,
                            '&:hover': {
                              backgroundColor: theme.palette.error.light
                            }
                          })
                        }}
                        onClick={() => navigate(`/loans/${loan._id}`)}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            {isOverdue && (
                              <WarningIcon 
                                color="error" 
                                fontSize="small" 
                                sx={{ mr: 1 }} 
                              />
                            )}
                            <Box>
                              <Typography variant="subtitle1">
                                {loan.equipment?.name || 'N/A'}
                              </Typography>
                              {loan.equipment?.serialNumber && (
                                <Typography variant="body2" color="textSecondary">
                                  S/N: {loan.equipment.serialNumber}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle1">
                            {loan.patient?.firstName} {loan.patient?.lastName}
                          </Typography>
                          {loan.patient?.phone && (
                            <Typography variant="body2" color="textSecondary">
                              {loan.patient.phone}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(loan.startDate)}</TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            {isOverdue && (
                              <WarningIcon 
                                color="error" 
                                fontSize="small" 
                                sx={{ mr: 0.5 }} 
                              />
                            )}
                            {formatDate(loan.expectedReturnDate)}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={translateStatus(loan.status)}
                            color={getStatusColor(loan.status, loan)}
                            size="small"
                            variant={isOverdue ? 'filled' : 'outlined'}
                          />
                        </TableCell>
                        <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                          <Tooltip title="Voir les détails">
                            <IconButton
                              color="primary"
                              onClick={() => navigate(`/loans/${loan._id}`)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          {loan.status === 'active' && (
                            <>
                              <Tooltip title="Retourner l'équipement">
                                <IconButton
                                  color="secondary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/loans/${loan._id}/return`);
                                  }}
                                >
                                  <ReturnIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Annuler le prêt">
                                <IconButton
                                  color="warning"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    await handleCancelLoan(loan._id);
                                  }}
                                >
                                  <CancelIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          {loan.status === 'completed' || loan.status === 'cancelled' ? (
                            <Tooltip title="Supprimer le prêt">
                              <IconButton
                                color="error"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await handleDeleteLoan(loan._id);
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {loans.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalItems}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Lignes par page :"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
              }
              sx={{
                '& .MuiTablePagination-toolbar': {
                  flexWrap: 'wrap',
                  justifyContent: 'flex-end',
                  p: 1
                },
                '& .MuiTablePagination-actions': {
                  ml: 1
                }
              }}
            />
          )}
        </MainCard>

      </Stack>
    </Container>
  );
};

// Prop types validation
LoanList.propTypes = {
  // Add any props if needed
};

export default React.memo(LoanList);
