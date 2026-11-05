import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import MainCard from 'components/MainCard';
import loanService from 'services/loanService';
import patientService from 'services/patientService';
import equipmentService from 'services/equipmentService';

const LoanForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [equipmentLoading, setEquipmentLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [formData, setFormData] = useState({
    patient: '',
    equipment: '',
    loanDate: new Date().toISOString().split('T')[0],
    expectedReturnDate: '',
    conditionAtLoan: 'good',
    notes: ''
  });
  const [error, setError] = useState('');
  const [equipmentStatus, setEquipmentStatus] = useState('');

  useEffect(() => {
    fetchPatients();
    fetchAvailableEquipment();
  }, []);

  const fetchPatients = async () => {
    try {
      setPatientsLoading(true);
      const response = await patientService.getPatients(1, 1000, '');
      
      // patientService.getPatients returns: { docs: [...], total: ..., totalPages: ..., currentPage: ... }
      const patientsData = response.docs || [];
      
      setPatients(patientsData);
      
      if (patientsData.length === 0) {
        setError('Aucun patient disponible');
      }
    } catch (err) {
      setError('Impossible de charger les patients');
    } finally {
      setPatientsLoading(false);
    }
  };

  const fetchAvailableEquipment = async () => {
    try {
      setEquipmentLoading(true);
      const response = await equipmentService.getAvailableEquipment(1000);
      
      // equipmentService.getAvailableEquipment returns: { success: true, data: [...], count: ... }
      let equipmentData = response.success ? response.data : [];
      
      // Filter out equipment that currently has active loans
      try {
        const activeLoansResponse = await loanService.getAll({ status: 'active' });
        if (activeLoansResponse.success && activeLoansResponse.data) {
          const activeLoanEquipmentIds = new Set(
            activeLoansResponse.data.map(loan => loan.equipment._id || loan.equipment)
          );
          equipmentData = equipmentData.filter(eq => !activeLoanEquipmentIds.has(eq._id));
        }
      } catch (loanError) {
        // If we can't fetch active loans, continue with available equipment
        // The backend will still validate equipment availability during loan creation
      }
      
      setEquipment(equipmentData);
      
      if (equipmentData.length === 0) {
        setError('Aucun équipement disponible');
      }
    } catch (err) {
      setError('Impossible de charger les équipements');
    } finally {
      setEquipmentLoading(false);
    }
  };

  const handleEquipmentChange = (e) => {
    const equipmentId = e.target.value;
    setFormData({ ...formData, equipment: equipmentId });
    
    const selectedEquipment = equipment.find(eq => eq._id === equipmentId);
    if (selectedEquipment) {
      setEquipmentStatus(selectedEquipment.status);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent double submission
    
    setError('');
    setLoading(true);

    try {
      // Prepare loan data according to backend expectations
      const loanData = {
        patient: formData.patient,
        equipment: formData.equipment,
        expectedReturnDate: formData.expectedReturnDate,
        conditionAtLoan: formData.conditionAtLoan,
        notes: formData.notes
      };

      const response = await loanService.create(loanData);

      if (response.success) {
        navigate('/loans');
      } else {
        setError(response.message || 'Erreur lors de la création du prêt');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la création du prêt';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isEquipmentAvailable = !formData.equipment || equipmentStatus === 'available';

  return (
    <MainCard>
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/loans')}
          sx={{ mb: 2 }}
        >
          Retour
        </Button>
        <Typography variant="h4">Nouveau prêt</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {formData.equipment && equipmentStatus && equipmentStatus !== 'available' && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Cet équipement n'est pas disponible (statut: {equipmentStatus})
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <FormControl fullWidth required>
            <InputLabel>Patient</InputLabel>
            <Select
              value={formData.patient}
              onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
              label="Patient"
              disabled={patientsLoading}
            >
              {patientsLoading ? (
                <MenuItem disabled>Chargement des patients...</MenuItem>
              ) : patients.length === 0 ? (
                <MenuItem disabled>Aucun patient disponible</MenuItem>
              ) : (
                patients.map(patient => (
                  <MenuItem key={patient._id} value={patient._id}>
                    {patient.firstName} {patient.lastName}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <FormControl fullWidth required>
            <InputLabel>Équipement</InputLabel>
            <Select
              value={formData.equipment}
              onChange={handleEquipmentChange}
              label="Équipement"
              disabled={equipmentLoading}
            >
              {equipmentLoading ? (
                <MenuItem disabled>Chargement des équipements...</MenuItem>
              ) : equipment.length === 0 ? (
                <MenuItem disabled>Aucun équipement disponible</MenuItem>
              ) : (
                equipment.map(eq => (
                  <MenuItem key={eq._id} value={eq._id}>
                    {eq.assetId} - {eq.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            required
            type="date"
            label="Date du prêt"
            value={formData.loanDate}
            onChange={(e) => setFormData({ ...formData, loanDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            disabled
          />

          <TextField
            fullWidth
            required
            type="date"
            label="Date de retour prévue"
            value={formData.expectedReturnDate}
            onChange={(e) => setFormData({ ...formData, expectedReturnDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />

          <FormControl fullWidth required>
            <InputLabel>Condition au prêt</InputLabel>
            <Select
              value={formData.conditionAtLoan}
              onChange={(e) => setFormData({ ...formData, conditionAtLoan: e.target.value })}
              label="Condition"
            >
              <MenuItem value="new">Neuf</MenuItem>
              <MenuItem value="excellent">Excellent</MenuItem>
              <MenuItem value="good">Bon</MenuItem>
              <MenuItem value="fair">Moyen</MenuItem>
              <MenuItem value="poor">Mauvais</MenuItem>
              <MenuItem value="unusable">Inutilisable</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !formData.patient || !formData.equipment || !isEquipmentAvailable}
            >
              {loading ? <CircularProgress size={24} /> : 'Créer le prêt'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/loans')}
              disabled={loading}
            >
              Annuler
            </Button>
          </Box>
        </Box>
      </form>
    </MainCard>
  );
};

export default LoanForm;
