import { useState, useEffect } from 'react';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, MinusCircleOutlined, CalendarOutlined, ClockCircleOutlined, PrinterOutlined, GiftOutlined } from '@ant-design/icons';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  LinearProgress,
  Snackbar
} from '@mui/material';
import MainCard from 'components/MainCard';
import logo from 'assets/images/t2riv-logo.jpg';
import zakatService from '../../services/zakatService.js';

const ZakatList = () => {
  const [zakatList, setZakatList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingZakat, setEditingZakat] = useState(null);
  const [formData, setFormData] = useState({
    donorName: '',
    donorPhone: '',
    donorEmail: '',
    donorAddress: '',
    zakatType: 'zakat_mal',
    amount: '',
    currency: 'DZD',
    paymentMethod: 'cash',
    paymentReference: '',
    notes: '',
    beneficiaryInfo: {
      name: '',
      familySize: '',
      address: '',
      phone: '',
      notes: ''
    }
  });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [stats, setStats] = useState(null);

  // Types de Zakat
  const zakatTypes = [
    { value: 'zakat_fitr', label: 'Zakat Al-Fitr' },
    { value: 'zakat_mal', label: 'Zakat Al-Mal' },
    { value: 'ramadan_aid', label: 'Aide Ramadan' }
  ];

  // Méthodes de paiement
  const paymentMethods = [
    { value: 'cash', label: 'Espèces' },
    { value: 'bank_transfer', label: 'Virement bancaire' },
    { value: 'check', label: 'Chèque' },
    { value: 'online', label: 'Paiement en ligne' }
  ];

  // Statuts
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'distributed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'distributed': return 'Distribué';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  // Charger les données
  const loadData = async () => {
    setLoading(true);
    try {
      const [zakatResponse, statsResponse] = await Promise.all([
        zakatService.getAll(),
        zakatService.getStats()
      ]);
      setZakatList(zakatResponse.data || []);
      setStats(statsResponse.data);
    } catch (error) {
      showNotification('Erreur lors du chargement des données', 'error');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Gérer le formulaire
  const handleInputChange = (field, value) => {
    if (field.startsWith('beneficiaryInfo.')) {
      const beneficiaryField = field.replace('beneficiaryInfo.', '');
      setFormData(prev => ({
        ...prev,
        beneficiaryInfo: {
          ...prev.beneficiaryInfo,
          [beneficiaryField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      donorName: '',
      donorPhone: '',
      donorEmail: '',
      donorAddress: '',
      zakatType: 'zakat_mal',
      amount: '',
      currency: 'DZD',
      paymentMethod: 'cash',
      paymentReference: '',
      notes: '',
      beneficiaryInfo: {
        name: '',
        familySize: '',
        address: '',
        phone: '',
        notes: ''
      }
    });
    setEditingZakat(null);
  };

  // Ouvrir le dialogue
  const handleOpenDialog = (zakat = null) => {
    if (zakat) {
      setEditingZakat(zakat);
      setFormData({
        donorName: zakat.donorName || '',
        donorPhone: zakat.donorPhone || '',
        donorEmail: zakat.donorEmail || '',
        donorAddress: zakat.donorAddress || '',
        zakatType: zakat.zakatType || 'zakat_mal',
        amount: zakat.amount || '',
        currency: zakat.currency || 'DZD',
        paymentMethod: zakat.paymentMethod || 'cash',
        paymentReference: zakat.paymentReference || '',
        notes: zakat.notes || '',
        beneficiaryInfo: zakat.beneficiaryInfo || {
          name: '',
          familySize: '',
          address: '',
          phone: '',
          notes: ''
        }
      });
    } else {
      resetForm();
    }
    setOpenDialog(true);
  };

  // Fermer le dialogue
  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  // Sauvegarder
  const handleSave = async () => {
    try {
      const dataToSave = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      if (editingZakat) {
        await zakatService.update(editingZakat._id, dataToSave);
        showNotification('Zakat mis à jour avec succès', 'success');
      } else {
        await zakatService.create(dataToSave);
        showNotification('Zakat créé avec succès', 'success');
      }

      handleCloseDialog();
      loadData();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Erreur lors de la sauvegarde', 'error');
    }
  };

  // Supprimer
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce Zakat ?')) {
      try {
        await zakatService.delete(id);
        showNotification('Zakat supprimé avec succès', 'success');
        loadData();
      } catch (error) {
        showNotification('Erreur lors de la suppression', 'error');
      }
    }
  };

  // Distribuer
  const handleDistribute = async (zakat) => {
    const distributedTo = prompt('Nom du bénéficiaire:');
    if (!distributedTo) return;

    try {
      await zakatService.distribute(zakat._id, {
        distributedTo,
        distributionNotes: prompt('Notes de distribution (optionnel):') || ''
      });
      showNotification('Zakat distribué avec succès', 'success');
      loadData();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Erreur lors de la distribution', 'error');
    }
  };

  // Notification
  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Imprimer
  const handlePrint = () => {
    window.print();
  };

  if (loading && zakatList.length === 0) {
    return <LinearProgress />;
  }

  return (
    <MainCard title="Gestion des Zakat" secondary={
      <Button
        variant="contained"
        startIcon={<PlusOutlined />}
        onClick={() => handleOpenDialog()}
      >
        Ajouter Zakat
      </Button>
    }>
      {/* Statistiques */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">
                  {stats.totalCount}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Zakat
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="success.main">
                  {stats.totalAmount?.toLocaleString()} DZD
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Montant Total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="warning.main">
                  {stats.pendingCount}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  En Attente
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="success.main">
                  {stats.distributedCount}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Distribués
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tableau */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Donateur</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Montant</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {zakatList.map((zakat) => (
              <TableRow key={zakat._id}>
                <TableCell>
                  {new Date(zakat.createdAt).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {zakat.donorName}
                  </Typography>
                  {zakat.donorPhone && (
                    <Typography variant="caption" color="textSecondary">
                      {zakat.donorPhone}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={zakatTypes.find(t => t.value === zakat.zakatType)?.label || zakat.zakatType}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {zakat.amount?.toLocaleString()} {zakat.currency}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(zakat.status)}
                    color={getStatusColor(zakat.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => handleOpenDialog(zakat)}
                    >
                      Modifier
                    </Button>
                    {zakat.status === 'pending' && (
                      <Button
                        size="small"
                        color="success"
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleDistribute(zakat)}
                      >
                        Distribuer
                      </Button>
                    )}
                    <Button
                      size="small"
                      color="error"
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(zakat._id)}
                    >
                      Supprimer
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialogue d'ajout/modification */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingZakat ? 'Modifier Zakat' : 'Ajouter Zakat'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom du donateur"
                value={formData.donorName}
                onChange={(e) => handleInputChange('donorName', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Téléphone"
                value={formData.donorPhone}
                onChange={(e) => handleInputChange('donorPhone', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.donorEmail}
                onChange={(e) => handleInputChange('donorEmail', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Adresse"
                value={formData.donorAddress}
                onChange={(e) => handleInputChange('donorAddress', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type de Zakat</InputLabel>
                <Select
                  value={formData.zakatType}
                  label="Type de Zakat"
                  onChange={(e) => handleInputChange('zakatType', e.target.value)}
                >
                  {zakatTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Montant"
                type="number"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Méthode de paiement</InputLabel>
                <Select
                  value={formData.paymentMethod}
                  label="Méthode de paiement"
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                >
                  {paymentMethods.map((method) => (
                    <MenuItem key={method.value} value={method.value}>
                      {method.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Référence de paiement"
                value={formData.paymentReference}
                onChange={(e) => handleInputChange('paymentReference', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={2}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSave} variant="contained">
            {editingZakat ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </MainCard>
  );
};

export default ZakatList;
