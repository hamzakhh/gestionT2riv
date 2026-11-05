import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Chip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  KeyboardReturn as ReturnIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import MainCard from 'components/MainCard';
import loanService from 'services/loanService';
import { useNavigate } from 'react-router-dom';
import LoanForm from './LoanForm';
import LoanDetail from './LoanDetail';
import LoanReturnModal from './LoanReturnModal';
import LoanCancelModal from './LoanCancelModal';

const LoanList = () => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [overdueFilter, setOverdueFilter] = useState('');
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [summary, setSummary] = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [equipmentList, setEquipmentList] = useState([]);
  const [equipmentLoading, setEquipmentLoading] = useState(false);
  const [equipmentFilter, setEquipmentFilter] = useState('all');

  useEffect(() => {
    fetchLoans();
    fetchSummary();
  }, [statusFilter, overdueFilter]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (overdueFilter === 'true') params.overdue = 'true';

      const response = await loanService.getAll(params);

      if (response.success) {
        setLoans(response.data || []);
      } else {
        setLoans([]);
      }
    } catch (error) {
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      setSummaryLoading(true);
      setSummaryError('');

      const response = await loanService.getEquipmentSummary();

      if (response && response.success && response.data) {
        setSummary(response.data);
      } else if (Array.isArray(response)) {
        setSummary(response);
      } else {
        setSummary([]);
      }
    } catch (err) {
      setSummaryError('Impossible de charger les statistiques des équipements');
      setSummary([]);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleViewSummary = async (summaryItem) => {
    setSelectedSummary(summaryItem);
    setViewModalOpen(true);
    setEquipmentFilter('all');
    await fetchEquipmentList(summaryItem.type, summaryItem.category, 'all');
  };

  const fetchEquipmentList = async (type, category, filter) => {
    try {
      setEquipmentLoading(true);

      const response = await loanService.getEquipmentByTypeCategory(type, category, filter);

      if (response && response.success && response.data) {
        setEquipmentList(response.data);
      } else if (Array.isArray(response)) {
        setEquipmentList(response);
      } else {
        setEquipmentList([]);
      }
    } catch (err) {
      setEquipmentList([]);
    } finally {
      setEquipmentLoading(false);
    }
  };

  const handleEquipmentFilterChange = async (newFilter) => {
    setEquipmentFilter(newFilter);
    await fetchEquipmentList(selectedSummary.type, selectedSummary.category, newFilter);
  };

  const handleViewDetails = (loan) => {
    setSelectedLoan(loan);
    setDetailModalOpen(true);
  };

  const handleReturn = async (returnData) => {
    if (!selectedLoan || !selectedLoan._id) return;

    try {
      await loanService.return(selectedLoan._id, returnData);
      setReturnModalOpen(false);
      fetchLoans();
      fetchSummary(); // Rafraîchir le tableau de synthèse
    } catch (error) {
      console.error('Erreur lors du retour:', error);
      throw error; // Throw error so modal can catch and display it
    }
  };

  const handleCancel = async (cancelData) => {
    if (!selectedLoan || !selectedLoan._id) return;

    try {
      await loanService.cancel(selectedLoan._id, cancelData);
      setCancelModalOpen(false);
      fetchLoans();
      fetchSummary(); // Rafraîchir le tableau de synthèse
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      throw error; // Throw error so modal can catch and display it
    }
  };

  const handleCreate = () => {
    setCreateModalOpen(true);
  };

  const handleCreateSuccess = () => {
    setCreateModalOpen(false);
    fetchLoans();
    fetchSummary(); // Rafraîchir le tableau de synthèse
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'returned': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'En cours';
      case 'returned': return 'Retourné';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <MainCard>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Gestion des prêts</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/loans/create')}
        >
          Nouveau prêt
        </Button>
      </Box>

      {/* Tableau de synthèse des équipements */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Synthèse par type d'équipement
        </Typography>
        {summaryLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : summaryError ? (
          <Typography variant="body2" color="error" sx={{ py: 2 }}>
            {summaryError}
          </Typography>
        ) : summary.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            Aucun équipement trouvé.
          </Typography>
        ) : (
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Type équipement</TableCell>
                  <TableCell>Catégorie</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="right">Disponibles</TableCell>
                  <TableCell align="right">En cours</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {summary.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell align="right">{item.total}</TableCell>
                    <TableCell align="right">{item.available}</TableCell>
                    <TableCell align="right">{item.active}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleViewSummary(item)}
                        title="Voir les équipements"
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Statut</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Statut"
          >
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="active">En cours</MenuItem>
            <MenuItem value="returned">Retournés</MenuItem>
            <MenuItem value="cancelled">Annulés</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Retard</InputLabel>
          <Select
            value={overdueFilter}
            onChange={(e) => setOverdueFilter(e.target.value)}
            label="Retard"
          >
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="true">En retard</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient</TableCell>
              <TableCell>Équipement</TableCell>
              <TableCell>Asset ID</TableCell>
              <TableCell>Date de prêt</TableCell>
              <TableCell>Retour prévu</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>En retard</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loans.length > 0 ? (
              loans.map((loan) => (
                <TableRow key={loan._id}>
                  <TableCell>
                    {loan.patient?.firstName} {loan.patient?.lastName}
                  </TableCell>
                  <TableCell>{loan.equipment?.name}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>
                    {loan.equipment?.assetId}
                  </TableCell>
                  <TableCell>
                    {new Date(loan.loanDate).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    {new Date(loan.expectedReturnDate).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(loan.status)}
                      color={getStatusColor(loan.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {loan.isOverdue && (
                      <Chip
                        label="En retard"
                        color="error"
                        size="small"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(loan)}
                        title="Voir détails"
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      {loan.status === 'active' && (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => { setSelectedLoan(loan); setReturnModalOpen(true); }}
                            title="Retourner"
                          >
                            <ReturnIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => { setSelectedLoan(loan); setCancelModalOpen(true); }}
                            title="Annuler"
                          >
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" sx={{ py: 3, color: 'text.secondary' }}>
                    Aucun prêt trouvé
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modals */}
      <LoanDetail
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        loan={selectedLoan}
      />

      <LoanReturnModal
        open={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        loan={selectedLoan}
        onConfirm={handleReturn}
      />

      <LoanCancelModal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        loan={selectedLoan}
        onConfirm={handleCancel}
      />

      {/* Modal de vue détaillée des équipements */}
      <Dialog
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedSummary && (
            <Box>
              <Typography variant="h6">
                {selectedSummary.type} — {selectedSummary.category}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total : {selectedSummary.total} | Disponibles : {selectedSummary.available} | En cours : {selectedSummary.active}
              </Typography>
            </Box>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Tabs
              value={equipmentFilter}
              onChange={(e, newValue) => handleEquipmentFilterChange(newValue)}
              sx={{ mb: 2 }}
            >
              <Tab label="Tous" value="all" />
              <Tab label="Disponibles" value="available" />
              <Tab label="En cours" value="active" />
            </Tabs>
          </Box>

          {equipmentLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : equipmentList.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              Aucun équipement trouvé pour ce filtre.
            </Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Asset ID</TableCell>
                    <TableCell>Statut</TableCell>
                    {equipmentFilter === 'active' && (
                      <>
                        <TableCell>Patient</TableCell>
                        <TableCell>Prêt depuis</TableCell>
                        <TableCell>Retour prévu</TableCell>
                      </>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {equipmentList.map((equipment) => (
                    <TableRow key={equipment._id}>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() => {
                            setViewModalOpen(false);
                            navigate(`/equipment/${equipment.assetId}`);
                          }}
                          sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}
                        >
                          {equipment.assetId}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={equipment.status === 'available' ? 'Disponible' : equipment.status}
                          color={equipment.status === 'available' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      {equipmentFilter === 'active' && equipment.activeLoan && (
                        <>
                          <TableCell>
                            {equipment.activeLoan.patient?.firstName} {equipment.activeLoan.patient?.lastName}
                          </TableCell>
                          <TableCell>
                            {new Date(equipment.activeLoan.loanDate).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>
                            {new Date(equipment.activeLoan.expectedReturnDate).toLocaleDateString('fr-FR')}
                          </TableCell>
                        </>
                      )}
                      {equipmentFilter === 'active' && !equipment.activeLoan && (
                        <>
                          <TableCell colSpan={3}>—</TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewModalOpen(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default LoanList;
