import { useState, useEffect } from 'react';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, MinusCircleOutlined, CalendarOutlined, ClockCircleOutlined, PrinterOutlined } from '@ant-design/icons';
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
import ramadhanService from '../../services/ramadhanService.js';

const DonRamadhan = () => {
  // Options de produits prédéfinis
  const productOptions = [
    // الأساسيات (المواد الجافة) - Les bases (matières sèches)
    { value: 'دقيق (فرينة)', label: 'دقيق (فرينة)', category: 'الأساسيات (المواد الجافة)' },
    { value: 'سميد', label: 'سميد', category: 'الأساسيات (المواد الجافة)' },
    { value: 'أرز', label: 'أرز', category: 'الأساسيات (المواد الجافة)' },
    { value: 'كسكسي', label: 'كسكسي', category: 'الأساسيات (المواد الجافة)' },
    { value: 'شعيرية', label: 'شعيرية', category: 'الأساسيات (المواد الجافة)' },
    { value: 'مقرونة (مكرونة)', label: 'مقرونة (مكرونة)', category: 'الأساسيات (المواد الجافة)' },
    { value: 'عدس', label: 'عدس', category: 'الأساسيات (المواد الجافة)' },
    { value: 'لوبيا (فاصوليا)', label: 'لوبيا (فاصوليا)', category: 'الأساسيات (المواد الجافة)' },
    { value: 'حمص', label: 'حمص', category: 'الأساسيات (المواد الجافة)' },
    { value: 'فول', label: 'فول', category: 'الأساسيات (المواد الجافة)' },
    { value: 'رز بالحليب', label: 'رز بالحليب', category: 'الأساسيات (المواد الجافة)' },
    { value: 'برغل', label: 'برغل', category: 'الأساسيات (المواد الجافة)' },

    // المواد الغذائية الأساسية - Matières alimentaires de base
    { value: 'سكر', label: 'سكر', category: 'المواد الغذائية الأساسية' },
    { value: 'ملح', label: 'ملح', category: 'المواد الغذائية الأساسية' },
    { value: 'زيت نباتي', label: 'زيت نباتي', category: 'المواد الغذائية الأساسية' },
    { value: 'زيت زيتون', label: 'زيت زيتون', category: 'المواد الغذائية الأساسية' },
    { value: 'طماطم معجونة', label: 'طماطم معجونة', category: 'المواد الغذائية الأساسية' },
    { value: 'حليب', label: 'حليب', category: 'المواد الغذائية الأساسية' },
    { value: 'شاي', label: 'شاي', category: 'المواد الغذائية الأساسية' },
    { value: 'قهوة', label: 'قهوة', category: 'المواد الغذائية الأساسية' },
    { value: 'خميرة', label: 'خميرة', category: 'المواد الغذائية الأساسية' },
    { value: 'ماء ورد', label: 'ماء ورد', category: 'المواد الغذائية الأساسية' },

    // منتجات غذائية إضافية (رمضانية) - Produits alimentaires supplémentaires (ramadan)
    { value: 'تمر', label: 'تمر', category: 'منتجات غذائية إضافية (رمضانية)' },
    { value: 'عسل', label: 'عسل', category: 'منتجات غذائية إضافية (رمضانية)' },
    { value: 'مربى', label: 'مربى', category: 'منتجات غذائية إضافية (رمضانية)' },
    { value: 'زبدة', label: 'زبدة', category: 'منتجات غذائية إضافية (رمضانية)' },
    { value: 'سمن', label: 'سمن', category: 'منتجات غذائية إضافية (رمضانية)' },
    { value: 'شوكولاتة قابلة للدهن', label: 'شوكولاتة قابلة للدهن', category: 'منتجات غذائية إضافية (رمضانية)' },
    { value: 'فواكه جافة (لوز، فستق، جوز، زبيب)', label: 'فواكه جافة (لوز، فستق، جوز، زبيب)', category: 'منتجات غذائية إضافية (رمضانية)' },
    { value: 'مشروبات (عصير، ماء معدني)', label: 'مشروبات (عصير، ماء معدني)', category: 'منتجات غذائية إضافية (رمضانية)' },

    // مواد غذائية قابلة للطهي - Matières alimentaires cuisinables
    { value: 'لحم (غنم، دجاج، بقر)', label: 'لحم (غنم، دجاج، بقر)', category: 'مواد غذائية قابلة للطهي' },
    { value: 'سمك', label: 'سمك', category: 'مواد غذائية قابلة للطهي' },
    { value: 'بطاطا', label: 'بطاطا', category: 'مواد غذائية قابلة للطهي' },
    { value: 'بصل', label: 'بصل', category: 'مواد غذائية قابلة للطهي' },
    { value: 'ثوم', label: 'ثوم', category: 'مواد غذائية قابلة للطهي' },
    { value: 'طماطم', label: 'طماطم', category: 'مواد غذائية قابلة للطهي' },
    { value: 'فلفل', label: 'فلفل', category: 'مواد غذائية قابلة للطهي' },
    { value: 'جزر', label: 'جزر', category: 'مواد غذائية قابلة للطهي' },
    { value: 'كوسة', label: 'كوسة', category: 'مواد غذائية قابلة للطهي' },
    { value: 'قرع', label: 'قرع', category: 'مواد غذائية قابلة للطهي' },
    { value: 'بقدونس', label: 'بقدونس', category: 'مواد غذائية قابلة للطهي' },
    { value: 'نعناع', label: 'نعناع', category: 'مواد غذائية قابلة للطهي' },

    // منتجات المخابز والمعجنات - Produits de boulangerie et pâtisserie
    { value: 'خبز', label: 'خبز', category: 'منتجات المخابز والمعجنات' },
    { value: 'بوريك', label: 'بوريك', category: 'منتجات المخابز والمعجنات' },
    { value: 'عجينة مورقة', label: 'عجينة مورقة', category: 'منتجات المخابز والمعجنات' },
    { value: 'فطائر', label: 'فطائر', category: 'منتجات المخابز والمعجنات' },
    { value: 'معجنات', label: 'معجنات', category: 'منتجات المخابز والمعجنات' },

    // مواد غذائية خاصة بالسحور - Matières alimentaires spéciales pour le suhoor
    { value: 'لبن (روب)', label: 'لبن (روب)', category: 'مواد غذائية خاصة بالسحور' },
    { value: 'جبن', label: 'جبن', category: 'مواد غذائية خاصة بالسحور' },
    { value: 'شوربة جاهزة', label: 'شوربة جاهزة', category: 'مواد غذائية خاصة بالسحور' },
    { value: 'شوفان', label: 'شوفان', category: 'مواد غذائية خاصة بالسحور' },
    { value: 'دقيق الذرة', label: 'دقيق الذرة', category: 'مواد غذائية خاصة بالسحور' }
  ];
  const [donations, setDonations] = useState([]);
  const [productTotals, setProductTotals] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [editingDistributed, setEditingDistributed] = useState({});
  const [openQuantityDialog, setOpenQuantityDialog] = useState(false);
  const [selectedProductForQuantity, setSelectedProductForQuantity] = useState('');
  const [quantityInput, setQuantityInput] = useState('');
  const [openAssignmentDialog, setOpenAssignmentDialog] = useState(false);
  const [selectedProductForAssignment, setSelectedProductForAssignment] = useState('');
  const [assignmentDestination, setAssignmentDestination] = useState('');
  const [assignmentQuantity, setAssignmentQuantity] = useState('');
  const [formData, setFormData] = useState({
    productName: '',
    unitPrice: '',
    quantity: '',
    destination: 'association' // destination par défaut : association
  });
  const [totals, setTotals] = useState({
    dailyTotal: 0,
    dailyQuantity: 0,
    dailyDistributedTotal: 0,
    dailyDistributedQuantity: 0,
    dailyRemainingTotal: 0,
    dailyRemainingQuantity: 0,
    weeklyTotal: 0,
    weeklyQuantity: 0,
    weeklyDistributedTotal: 0,
    weeklyDistributedQuantity: 0,
    weeklyRemainingTotal: 0,
    weeklyRemainingQuantity: 0,
    monthlyTotal: 0,
    monthlyQuantity: 0,
    monthlyDistributedTotal: 0,
    monthlyDistributedQuantity: 0,
    monthlyRemainingTotal: 0,
    monthlyRemainingQuantity: 0
  });

  // Calculer les totaux par produit
  const calculateProductTotals = (donationsList) => {
    const productTotals = {};

    donationsList.forEach(donation => {
      const productName = donation.productName;
      if (!productTotals[productName]) {
        productTotals[productName] = {
          totalQuantity: 0,
          distributedQuantity: 0,
          remainingQuantity: 0,
          totalValue: 0,
          distributedValue: 0,
          remainingValue: 0,
          assignedToRestaurant: 0,
          assignedToKouffa: 0,
          restaurantValue: 0,
          kouffaValue: 0
        };
      }

      productTotals[productName].totalQuantity += donation.quantity;
      productTotals[productName].totalValue += donation.totalPrice;

      productTotals[productName].distributedQuantity += donation.distributedQuantity || 0;
      productTotals[productName].distributedValue += (donation.unitPrice * (donation.distributedQuantity || 0));

      productTotals[productName].assignedToRestaurant += donation.assignedToRestaurant || 0;
      productTotals[productName].assignedToKouffa += donation.assignedToKouffa || 0;
      productTotals[productName].restaurantValue += (donation.unitPrice * (donation.assignedToRestaurant || 0));
      productTotals[productName].kouffaValue += (donation.unitPrice * (donation.assignedToKouffa || 0));

      productTotals[productName].remainingQuantity = productTotals[productName].totalQuantity - productTotals[productName].distributedQuantity;
      productTotals[productName].remainingValue = productTotals[productName].totalValue - productTotals[productName].distributedValue;
    });

    return productTotals;
  };

  // Calculer les totaux
  const calculateTotals = (donationsList) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let dailyTotal = 0;
    let dailyQuantity = 0;
    let dailyDistributedTotal = 0;
    let dailyDistributedQuantity = 0;
    let dailyRemainingTotal = 0;
    let dailyRemainingQuantity = 0;

    let weeklyTotal = 0;
    let weeklyQuantity = 0;
    let weeklyDistributedTotal = 0;
    let weeklyDistributedQuantity = 0;
    let weeklyRemainingTotal = 0;
    let weeklyRemainingQuantity = 0;

    let monthlyTotal = 0;
    let monthlyQuantity = 0;
    let monthlyDistributedTotal = 0;
    let monthlyDistributedQuantity = 0;
    let monthlyRemainingTotal = 0;
    let monthlyRemainingQuantity = 0;

    donationsList.forEach(donation => {
      const donationDate = new Date(donation.donationDate || donation.date);
      const total = donation.unitPrice * donation.quantity;
      const distributedQuantity = donation.distributedQuantity || 0;
      const distributedTotal = donation.unitPrice * distributedQuantity;

      // Totaux quotidiens
      if (donationDate >= startOfDay) {
        dailyTotal += total;
        dailyQuantity += donation.quantity;

        dailyDistributedTotal += distributedTotal;
        dailyDistributedQuantity += distributedQuantity;
        dailyRemainingTotal += total - distributedTotal;
        dailyRemainingQuantity += donation.quantity - distributedQuantity;
      }

      // Totaux hebdomadaires (derniers 7 jours)
      if (donationDate >= last7Days) {
        weeklyTotal += total;
        weeklyQuantity += donation.quantity;

        weeklyDistributedTotal += distributedTotal;
        weeklyDistributedQuantity += distributedQuantity;
        weeklyRemainingTotal += total - distributedTotal;
        weeklyRemainingQuantity += donation.quantity - distributedQuantity;
      }

      // Totaux mensuels (depuis le début du mois)
      if (donationDate >= startOfMonth) {
        monthlyTotal += total;
        monthlyQuantity += donation.quantity;

        monthlyDistributedTotal += distributedTotal;
        monthlyDistributedQuantity += distributedQuantity;
        monthlyRemainingTotal += total - distributedTotal;
        monthlyRemainingQuantity += donation.quantity - distributedQuantity;
      }
    });

    setTotals({
      dailyTotal,
      dailyQuantity,
      dailyDistributedTotal,
      dailyDistributedQuantity,
      dailyRemainingTotal,
      dailyRemainingQuantity,
      weeklyTotal,
      weeklyQuantity,
      weeklyDistributedTotal,
      weeklyDistributedQuantity,
      weeklyRemainingTotal,
      weeklyRemainingQuantity,
      monthlyTotal,
      monthlyQuantity,
      monthlyDistributedTotal,
      monthlyDistributedQuantity,
      monthlyRemainingTotal,
      monthlyRemainingQuantity
    });
  };

  // Charger les données depuis l'API
  const loadDonations = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await ramadhanService.getAll();
      
      if (response.success) {
        const donationsData = response.data?.data || response.data || [];
        setDonations(donationsData);
        calculateTotals(donationsData);
        setProductTotals(calculateProductTotals(donationsData));
        
      }
    } catch (err) {
      setError('Erreur lors du chargement des données');
      setSnackbar({
        open: true,
        message: 'Erreur lors du chargement des données',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonations();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenDialog = (donation = null) => {
    if (donation) {
      setSelectedDonation(donation);

      // Check if the product name is in the predefined options
      const predefinedOption = productOptions.find(option => option.value === donation.productName);
      const productValue = predefinedOption ? donation.productName : 'custom';

      setFormData({
        productName: productValue,
        customProductName: productValue === 'custom' ? donation.productName : '',
        unitPrice: donation.unitPrice,
        quantity: donation.quantity,
        destination: donation.destination
      });
    } else {
      setSelectedDonation(null);
      setFormData({
        productName: '',
        customProductName: '',
        unitPrice: '',
        quantity: '',
        destination: 'association'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDonation(null);
  };

  const handleSubmit = async () => {
    const unitPrice = parseFloat(formData.unitPrice);
    const quantity = parseInt(formData.quantity);

    // Determine the actual product name
    let actualProductName = formData.productName;
    if (formData.productName === 'custom') {
      actualProductName = formData.customProductName || '';
    }

    if (!actualProductName || !unitPrice || !quantity) {
      setSnackbar({
        open: true,
        message: 'Veuillez remplir tous les champs obligatoires',
        severity: 'error'
      });
      return;
    }

    try {
      const donationData = {
        productName: actualProductName,
        category: productOptions.find(opt => opt.value === actualProductName)?.category || 'Non catégorisé',
        unitPrice,
        quantity,
        totalPrice: unitPrice * quantity,
        destination: formData.destination,
        distributedQuantity: selectedDonation ? selectedDonation.distributedQuantity : 0,
        assignedToRestaurant: selectedDonation ? selectedDonation.assignedToRestaurant : 0,
        assignedToKouffa: selectedDonation ? selectedDonation.assignedToKouffa : 0,
        donationDate: selectedDonation ? selectedDonation.donationDate : new Date().toISOString()
      };

      let response;
      if (selectedDonation) {
        response = await ramadhanService.update(selectedDonation._id, donationData);
      } else {
        response = await ramadhanService.create(donationData);
      }

      if (response.success) {
        setSnackbar({
          open: true,
          message: selectedDonation ? 'Don mis à jour avec succès' : 'Don créé avec succès',
          severity: 'success'
        });
        loadDonations(); // Recharger les données
        handleCloseDialog();
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Erreur lors de l\'enregistrement du don',
        severity: 'error'
      });
    }
  };

  const handleToggleDistributed = (id) => {
    const updatedDonations = donations.map(donation =>
      donation.id === id
        ? { ...donation, distributedQuantity: donation.distributedQuantity > 0 ? 0 : donation.quantity }
        : donation
    );
    setDonations(updatedDonations);
    calculateTotals(updatedDonations);
    setProductTotals(calculateProductTotals(updatedDonations));
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce don ?')) {
      try {
        const response = await ramadhanService.delete(id);
        if (response.success) {
          setSnackbar({
            open: true,
            message: 'Don supprimé avec succès',
            severity: 'success'
          });
          loadDonations(); // Recharger les données
        }
      } catch (err) {
        setSnackbar({
          open: true,
          message: 'Erreur lors de la suppression du don',
          severity: 'error'
        });
      }
    }
  };

  const handleDistributedQuantityChange = (productName, newDistributedQuantity) => {
    const quantity = parseInt(newDistributedQuantity);
    if (isNaN(quantity) || quantity < 0) return;

    const totalQuantity = productTotals[productName]?.totalQuantity || 0;
    if (quantity > totalQuantity) return; // Cannot distribute more than available

    // Get all donations for this product
    const productDonations = donations
      .filter(d => d.productName === productName)
      .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date (oldest first)

    let updatedDonations = [...donations];
    let remainingToDistribute = quantity;

    // First, reset all distributed quantities to 0 for this product
    productDonations.forEach(donation => {
      updatedDonations = updatedDonations.map(d =>
        d.id === donation.id ? { ...d, distributedQuantity: 0 } : d
      );
    });

    // Then distribute the new total quantity across donations from oldest to newest
    for (const donation of productDonations) {
      if (remainingToDistribute <= 0) break;

      const toDistributeFromThis = Math.min(remainingToDistribute, donation.quantity);

      if (toDistributeFromThis > 0) {
        updatedDonations = updatedDonations.map(d =>
          d.id === donation.id
            ? { ...d, distributedQuantity: toDistributeFromThis }
            : d
        );
        remainingToDistribute -= toDistributeFromThis;
      }
    }

    setDonations(updatedDonations);
    calculateTotals(updatedDonations);
    setProductTotals(calculateProductTotals(updatedDonations));
  };

  const handleAssignmentQuantityChange = (productName, destination, newQuantity) => {
    const quantity = parseInt(newQuantity);
    if (isNaN(quantity) || quantity < 0) return;

    const totalAvailable = productTotals[productName]?.totalQuantity || 0;
    const currentlyAssignedToRestaurant = productTotals[productName]?.assignedToRestaurant || 0;
    const currentlyAssignedToKouffa = productTotals[productName]?.assignedToKouffa || 0;

    // Calculate the new total assigned if we apply this change
    let newTotalAssigned;
    if (destination === 'restaurant') {
      newTotalAssigned = quantity + currentlyAssignedToKouffa;
    } else {
      newTotalAssigned = currentlyAssignedToRestaurant + quantity;
    }

    if (newTotalAssigned > totalAvailable) {
      alert(`Impossible d'assigner cette quantité. Total disponible: ${totalAvailable}, Total assigné serait: ${newTotalAssigned}`);
      return;
    }

    // Get all donations for this product
    const productDonations = donations.filter(d => d.productName === productName);

    let updatedDonations = [...donations];
    let remainingToAssign = quantity;

    // First, reset all assignments for this destination for this product
    productDonations.forEach(donation => {
      if (destination === 'restaurant') {
        updatedDonations = updatedDonations.map(d =>
          d.id === donation.id ? { ...d, assignedToRestaurant: 0 } : d
        );
      } else {
        updatedDonations = updatedDonations.map(d =>
          d.id === donation.id ? { ...d, assignedToKouffa: 0 } : d
        );
      }
    });

    // Then assign the new total quantity across donations from oldest to newest
    for (const donation of productDonations) {
      if (remainingToAssign <= 0) break;

      const toAssignFromThis = Math.min(remainingToAssign, donation.quantity);

      if (toAssignFromThis > 0) {
        updatedDonations = updatedDonations.map(d =>
          d.id === donation.id
            ? {
                ...d,
                [destination === 'restaurant' ? 'assignedToRestaurant' : 'assignedToKouffa']: toAssignFromThis
              }
            : d
        );
        remainingToAssign -= toAssignFromThis;
      }
    }

    setDonations(updatedDonations);
    calculateTotals(updatedDonations);
    setProductTotals(calculateProductTotals(updatedDonations));
  };

  const handlePrintProductTotals = () => {
    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleDateString('fr-FR');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Totaux par Produit - Dons Ramadhan</title>
          <style>
            @page {
              size: A4;
              margin: 20mm;
            }

            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
              color: #333;
            }

            .header {
              text-align: center;
              position: relative;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px 20px;
              border-radius: 10px;
              margin: -20px -20px 30px -20px;
              overflow: hidden;
            }

            .header::before {
              content: '';
              position: absolute;
              top: -50%;
              left: -50%;
              width: 200%;
              height: 200%;
              background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
              animation: pulse 3s ease-in-out infinite;
            }

            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 0.5; }
              50% { transform: scale(1.05); opacity: 0.8; }
            }

            .logo {
              display: flex;
              justify-content: center;
              align-items: center;
              margin-bottom: 15px;
            }

            .footer-logo {
              display: flex;
              justify-content: center;
              align-items: center;
              margin-bottom: 15px;
            }

            .header h1 {
              margin: 10px 0;
              font-size: 32px;
              font-weight: bold;
              text-shadow: 1px 1px 3px rgba(0,0,0,0.3);
              z-index: 2;
              position: relative;
            }

            .header .subtitle {
              margin-top: 5px;
              opacity: 0.9;
              font-size: 18px;
              font-weight: 300;
              z-index: 2;
              position: relative;
            }

            .header .date {
              margin-top: 15px;
              opacity: 0.8;
              font-size: 14px;
              font-style: italic;
              z-index: 2;
              position: relative;
            }

            .summary {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
              gap: 20px;
            }

            .summary-card {
              flex: 1;
              padding: 25px 20px;
              border-radius: 15px;
              text-align: center;
              box-shadow: 0 8px 25px rgba(0,0,0,0.15);
              transition: transform 0.3s ease;
              position: relative;
              overflow: hidden;
            }

            .summary-card::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 4px;
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
            }

            .summary-card.total {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }

            .summary-card.distributed {
              background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
              color: white;
            }

            .summary-card.remaining {
              background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
              color: white;
            }

            .summary-card h3 {
              margin: 0 0 15px 0;
              font-size: 20px;
              font-weight: 600;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
            }

            .summary-card .value {
              font-size: 28px;
              font-weight: bold;
              margin: 8px 0;
              text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
            }

            .summary-card .subtitle {
              font-size: 16px;
              opacity: 0.9;
              font-weight: 500;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              box-shadow: 0 8px 25px rgba(0,0,0,0.15);
              border-radius: 15px;
              overflow: hidden;
              border: 2px solid #667eea;
            }

            thead {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }

            th, td {
              padding: 15px;
              text-align: left;
              border-bottom: 1px solid rgba(255,255,255,0.2);
            }

            th {
              font-weight: bold;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              position: relative;
            }

            tbody tr:nth-child(even) {
              background: linear-gradient(90deg, #f8f9fa 0%, #e9ecef 100%);
            }

            tbody tr:nth-child(odd) {
              background: white;
            }

            tbody tr:hover {
              background: linear-gradient(90deg, #e3f2fd 0%, #bbdefb 100%);
              transform: scale(1.01);
              transition: all 0.2s ease;
            }

            .product-name {
              font-weight: bold;
              color: #333;
              font-size: 15px;
            }

            .quantity {
              text-align: center;
              font-weight: bold;
              font-size: 16px;
            }

            .distributed {
              color: #22c55e;
              font-weight: bold;
              background: rgba(34, 197, 94, 0.1);
              padding: 4px 8px;
              border-radius: 6px;
            }

            .remaining {
              color: #f59e0b;
              font-weight: bold;
              background: rgba(245, 158, 11, 0.1);
              padding: 4px 8px;
              border-radius: 6px;
            }

            .total {
              font-weight: bold;
              color: #667eea;
              background: rgba(102, 126, 234, 0.1);
              padding: 4px 8px;
              border-radius: 6px;
            }

            .footer {
              margin-top: 50px;
              text-align: center;
              padding: 30px 20px;
              background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
              border-radius: 15px;
              border: 2px solid #667eea;
            }

            .footer-logo {
              display: flex;
              justify-content: center;
              align-items: center;
              margin-bottom: 15px;
            }

            .footer p {
              margin: 8px 0;
              font-size: 14px;
              color: #666;
              font-weight: 500;
            }

            .footer .main-text {
              font-size: 16px;
              font-weight: bold;
              color: #667eea;
              margin-bottom: 10px;
            }

            @media print {
              body {
                margin: 0;
                padding: 15px;
              }

              .header {
                margin: 0 0 20px 0 !important;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }

              .summary-card {
                box-shadow: none !important;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }

              table {
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }

              .footer {
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">
              <img src="${logo}" alt="Logo" style="width: 80px; height: auto;" />
            </div>
            <h1>Association des Dons Ramadhan</h1>
            <div class="subtitle">📊 Rapport des Totaux par Produit</div>
            <div class="date">📅 Date d'impression: ${currentDate}</div>
          </div>

          <div class="summary">
            <div class="summary-card total">
              <h3>📦 Total Général</h3>
              <div class="value">${Object.values(productTotals).reduce((sum, product) => sum + product.totalQuantity, 0)} unités</div>
              <div class="subtitle">${Object.values(productTotals).reduce((sum, product) => sum + product.totalValue, 0).toFixed(2)} TND</div>
            </div>
            <div class="summary-card distributed">
              <h3>✅ Distribué</h3>
              <div class="value">${Object.values(productTotals).reduce((sum, product) => sum + product.distributedQuantity, 0)} unités</div>
              <div class="subtitle">${Object.values(productTotals).reduce((sum, product) => sum + product.distributedValue, 0).toFixed(2)} TND</div>
            </div>
            <div class="summary-card remaining">
              <h3>⏳ Restant</h3>
              <div class="value">${Object.values(productTotals).reduce((sum, product) => sum + (product.totalQuantity - product.distributedQuantity), 0)} unités</div>
              <div class="subtitle">${Object.values(productTotals).reduce((sum, product) => sum + (product.totalValue - product.distributedValue), 0).toFixed(2)} TND</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>🏷️ Produit</th>
                <th style="text-align: center;">📊 Quantité Totale</th>
                <th style="text-align: center;">✅ Quantité Distribuée</th>
                <th style="text-align: center;">⏳ Quantité Restante</th>
                <th style="text-align: center;">💰 Valeur Totale (TND)</th>
                <th style="text-align: center;">✅ Valeur Distribuée (TND)</th>
                <th style="text-align: center;">⏳ Valeur Restante (TND)</th>
              </tr>
            </thead>
            <tbody>
    `);

    // Add table rows for each product
    Object.entries(productTotals).forEach(([productName, totals]) => {
      printWindow.document.write(`
        <tr>
          <td class="product-name">${productName}</td>
          <td class="quantity total">${totals.totalQuantity}</td>
          <td class="quantity distributed">${totals.distributedQuantity}</td>
          <td class="quantity remaining">${totals.totalQuantity - totals.distributedQuantity}</td>
          <td class="quantity total">${totals.totalValue.toFixed(2)}</td>
          <td class="quantity distributed">${totals.distributedValue.toFixed(2)}</td>
          <td class="quantity remaining">${(totals.totalValue - totals.distributedValue).toFixed(2)}</td>
        </tr>
      `);
    });

    printWindow.document.write(`
            </tbody>
          </table>

          <div class="distribution-results" style="margin-top: 40px; page-break-before: always;">
            <h2 style="text-align: center; color: #667eea; margin-bottom: 30px; font-size: 24px; border-bottom: 3px solid #667eea; padding-bottom: 10px;">
              📊 RÉSULTATS DE DISTRIBUTION - ÉTAT FINAL
            </h2>

            <div class="results-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px;">
              <div class="result-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 15px; box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);">
                <h3 style="margin: 0 0 15px 0; font-size: 18px;">✅ PRODUITS DISTRIBUÉS</h3>
                <div style="font-size: 32px; font-weight: bold; margin-bottom: 10px;">
                  ${Object.values(productTotals).filter(product => product.distributedQuantity > 0).length}
                </div>
                <div style="opacity: 0.9; font-size: 14px;">
                  Produits ayant fait l'objet d'une distribution
                </div>
              </div>

              <div class="result-card" style="background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); color: white; padding: 25px; border-radius: 15px; box-shadow: 0 8px 25px rgba(74, 222, 128, 0.3);">
                <h3 style="margin: 0 0 15px 0; font-size: 18px;">📦 TOTAL DISTRIBUÉ</h3>
                <div style="font-size: 32px; font-weight: bold; margin-bottom: 10px;">
                  ${Object.values(productTotals).reduce((sum, product) => sum + product.distributedQuantity, 0)} unités
                </div>
                <div style="opacity: 0.9; font-size: 14px;">
                  Quantité totale distribuée à ce jour
                </div>
              </div>

              <div class="result-card" style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; padding: 25px; border-radius: 15px; box-shadow: 0 8px 25px rgba(251, 191, 36, 0.3);">
                <h3 style="margin: 0 0 15px 0; font-size: 18px;">⏳ STOCK RESTANT</h3>
                <div style="font-size: 32px; font-weight: bold; margin-bottom: 10px;">
                  ${Object.values(productTotals).reduce((sum, product) => sum + (product.totalQuantity - product.distributedQuantity), 0)} unités
                </div>
                <div style="opacity: 0.9; font-size: 14px;">
                  Quantité restante en stock
                </div>
              </div>

              <div class="result-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 25px; border-radius: 15px; box-shadow: 0 8px 25px rgba(240, 147, 251, 0.3);">
                <h3 style="margin: 0 0 15px 0; font-size: 18px;">💰 VALEUR DISTRIBUÉE</h3>
                <div style="font-size: 32px; font-weight: bold; margin-bottom: 10px;">
                  ${Object.values(productTotals).reduce((sum, product) => sum + product.distributedValue, 0).toFixed(2)} TND
                </div>
                <div style="opacity: 0.9; font-size: 14px;">
                  Valeur totale des produits distribués
                </div>
              </div>
            </div>

            <h3 style="color: #333; margin-bottom: 20px; font-size: 20px;">📋 DÉTAIL PAR PRODUIT APRÈS DISTRIBUTION</h3>

            <div class="product-details" style="margin-bottom: 30px;">
              ${Object.entries(productTotals).map(([productName, totals]) => {
                const distributedPercent = totals.totalQuantity > 0 ? Math.round((totals.distributedQuantity / totals.totalQuantity) * 100) : 0;
                const remainingPercent = 100 - distributedPercent;
                return `
                  <div class="product-item" style="border: 1px solid #e0e0e0; border-radius: 10px; padding: 20px; margin-bottom: 15px; background: white;">
                    <div class="product-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                      <h4 style="margin: 0; color: #667eea; font-size: 18px; font-weight: bold;">${productName}</h4>
                      <div class="progress-indicator" style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 100px; height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden;">
                          <div style="width: ${distributedPercent}%; height: 100%; background: linear-gradient(90deg, #4ade80, #22c55e); border-radius: 4px;"></div>
                        </div>
                        <span style="font-size: 12px; color: #666;">${distributedPercent}% distribué</span>
                      </div>
                    </div>

                    <div class="product-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                      <div class="stat-item" style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                        <div style="font-size: 16px; font-weight: bold; color: #667eea;">${totals.totalQuantity}</div>
                        <div style="font-size: 12px; color: #666;">Total disponible</div>
                      </div>
                      <div class="stat-item" style="text-align: center; padding: 10px; background: #d4edda; border-radius: 8px;">
                        <div style="font-size: 16px; font-weight: bold; color: #22c55e;">${totals.distributedQuantity}</div>
                        <div style="font-size: 12px; color: #666;">Distribué</div>
                      </div>
                      <div class="stat-item" style="text-align: center; padding: 10px; background: #fff3cd; border-radius: 8px;">
                        <div style="font-size: 16px; font-weight: bold; color: #f59e0b;">${totals.totalQuantity - totals.distributedQuantity}</div>
                        <div style="font-size: 12px; color: #666;">Restant</div>
                      </div>
                      <div class="stat-item" style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                        <div style="font-size: 16px; font-weight: bold; color: #667eea;">${totals.totalValue.toFixed(2)} TND</div>
                        <div style="font-size: 12px; color: #666;">Valeur totale</div>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <div class="distribution-summary" style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 15px; border: 2px solid #667eea;">
              <h3 style="margin: 0 0 20px 0; color: #667eea; font-size: 20px; text-align: center;">📈 RÉSUMÉ DE DISTRIBUTION</h3>
              <div class="summary-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                <div class="summary-item" style="text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: #22c55e; margin-bottom: 5px;">
                    ${Math.round((Object.values(productTotals).reduce((sum, product) => sum + product.distributedQuantity, 0) / Object.values(productTotals).reduce((sum, product) => sum + product.totalQuantity, 0)) * 100) || 0}%
                  </div>
                  <div style="font-size: 14px; color: #666;">Taux de distribution global</div>
                </div>
                <div class="summary-item" style="text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: #667eea; margin-bottom: 5px;">
                    ${Object.values(productTotals).reduce((sum, product) => sum + product.distributedValue, 0).toFixed(2)} TND
                  </div>
                  <div style="font-size: 14px; color: #666;">Valeur distribuée totale</div>
                </div>
                <div class="summary-item" style="text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: #f59e0b; margin-bottom: 5px;">
                    ${(Object.values(productTotals).reduce((sum, product) => sum + product.totalValue, 0) - Object.values(productTotals).reduce((sum, product) => sum + product.distributedValue, 0)).toFixed(2)} TND
                  </div>
                  <div style="font-size: 14px; color: #666;">Valeur restante en stock</div>
                </div>
              </div>
            </div>
          </div>

          <div class="footer">
            <div class="footer-logo">
              <img src="${logo}" alt="Logo" style="width: 48px; height: auto;" />
            </div>
            <p class="main-text">📄 Rapport généré automatiquement</p>
            <p>Système de Gestion des Dons Ramadhan</p>
            <p>🏢 Association des Dons Alimentaires - ${new Date().getFullYear()}</p>
            <p style="font-size: 12px; margin-top: 15px; opacity: 0.7;">
              Ce rapport a été généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
            </p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <MainCard title={
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h4" sx={{ fontSize: '2rem' }}>🕌🌙</Typography>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Dons Ramadhan - Produits Alimentaires
        </Typography>
      </Box>
    }>
      {/* Résumé des totaux */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
              },
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100px',
                height: '100px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                transform: 'translate(30px, -30px)',
              }
            }}
          >
            <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ClockCircleOutlined style={{ fontSize: '24px', marginRight: '12px' }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Totaux Journaliers
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1, opacity: 0.9 }}>
                  Total: {totals.dailyTotal.toFixed(2)} TND
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {totals.dailyQuantity} unités disponibles
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Progress de Distribution
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {totals.dailyQuantity > 0 ? Math.round((totals.dailyDistributedQuantity / totals.dailyQuantity) * 100) : 0}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={totals.dailyQuantity > 0 ? (totals.dailyDistributedQuantity / totals.dailyQuantity) * 100 : 0}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#4ade80',
                      borderRadius: 4,
                    }
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
                    Distribué
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#4ade80', fontWeight: 'bold' }}>
                    {totals.dailyDistributedTotal.toFixed(2)} TND
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {totals.dailyDistributedQuantity} unités
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
                    Restant
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#fbbf24', fontWeight: 'bold' }}>
                    {totals.dailyRemainingTotal.toFixed(2)} TND
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {totals.dailyRemainingQuantity} unités
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(245, 87, 108, 0.3)',
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(245, 87, 108, 0.4)',
              },
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100px',
                height: '100px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                transform: 'translate(30px, -30px)',
              }
            }}
          >
            <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarOutlined style={{ fontSize: '24px', marginRight: '12px' }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Totaux Hebdomadaires
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1, opacity: 0.9 }}>
                  Total: {totals.weeklyTotal.toFixed(2)} TND
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {totals.weeklyQuantity} unités disponibles
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Progress de Distribution
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {totals.weeklyQuantity > 0 ? Math.round((totals.weeklyDistributedQuantity / totals.weeklyQuantity) * 100) : 0}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={totals.weeklyQuantity > 0 ? (totals.weeklyDistributedQuantity / totals.weeklyQuantity) * 100 : 0}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#4ade80',
                      borderRadius: 4,
                    }
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
                    Distribué
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#4ade80', fontWeight: 'bold' }}>
                    {totals.weeklyDistributedTotal.toFixed(2)} TND
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {totals.weeklyDistributedQuantity} unités
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
                    Restant
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#fbbf24', fontWeight: 'bold' }}>
                    {totals.weeklyRemainingTotal.toFixed(2)} TND
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {totals.weeklyRemainingQuantity} unités
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)',
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(139, 92, 246, 0.4)',
              },
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100px',
                height: '100px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                transform: 'translate(30px, -30px)',
              }
            }}
          >
            <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarOutlined style={{ fontSize: '24px', marginRight: '12px' }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Totaux Mensuels
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1, opacity: 0.9 }}>
                  Total: {totals.monthlyTotal.toFixed(2)} TND
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {totals.monthlyQuantity} unités disponibles
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Progress de Distribution
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {totals.monthlyQuantity > 0 ? Math.round((totals.monthlyDistributedQuantity / totals.monthlyQuantity) * 100) : 0}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={totals.monthlyQuantity > 0 ? (totals.monthlyDistributedQuantity / totals.monthlyQuantity) * 100 : 0}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#4ade80',
                      borderRadius: 4,
                    }
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
                    Distribué
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#4ade80', fontWeight: 'bold' }}>
                    {totals.monthlyDistributedTotal.toFixed(2)} TND
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {totals.monthlyDistributedQuantity} unités
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
                    Restant
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#fbbf24', fontWeight: 'bold' }}>
                    {totals.monthlyRemainingTotal.toFixed(2)} TND
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {totals.monthlyRemainingQuantity} unités
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Résumé des assignations aux destinations */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(25, 118, 210, 0.4)',
              },
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100px',
                height: '100px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                transform: 'translate(30px, -30px)',
              }
            }}
          >
            <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography sx={{ fontSize: '24px', marginRight: '12px' }}>🍽️</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Assigné au Restaurant
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ mb: 1, opacity: 0.9 }}>
                  Quantité: {Object.values(productTotals).reduce((sum, product) => sum + (product.assignedToRestaurant || 0), 0)} unités
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Valeur: {Object.values(productTotals).reduce((sum, product) => sum + (product.restaurantValue || 0), 0).toFixed(2)} TND
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
                    Produits assignés
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#4ade80', fontWeight: 'bold' }}>
                    {Object.values(productTotals).filter(product => (product.assignedToRestaurant || 0) > 0).length}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
                    Taux d'assignation
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#fbbf24', fontWeight: 'bold' }}>
                    {Object.values(productTotals).reduce((sum, product) => sum + product.totalQuantity, 0) > 0
                      ? Math.round((Object.values(productTotals).reduce((sum, product) => sum + (product.assignedToRestaurant || 0), 0) /
                          Object.values(productTotals).reduce((sum, product) => sum + product.totalQuantity, 0)) * 100)
                      : 0}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(156, 39, 176, 0.3)',
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(156, 39, 176, 0.4)',
              },
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100px',
                height: '100px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                transform: 'translate(30px, -30px)',
              }
            }}
          >
            <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography sx={{ fontSize: '24px', marginRight: '12px' }}>🏕️</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Assigné à la Kouffa Ramadan
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ mb: 1, opacity: 0.9 }}>
                  Quantité: {Object.values(productTotals).reduce((sum, product) => sum + (product.assignedToKouffa || 0), 0)} unités
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Valeur: {Object.values(productTotals).reduce((sum, product) => sum + (product.kouffaValue || 0), 0).toFixed(2)} TND
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
                    Produits assignés
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#4ade80', fontWeight: 'bold' }}>
                    {Object.values(productTotals).filter(product => (product.assignedToKouffa || 0) > 0).length}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
                    Taux d'assignation
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#fbbf24', fontWeight: 'bold' }}>
                    {Object.values(productTotals).reduce((sum, product) => sum + product.totalQuantity, 0) > 0
                      ? Math.round((Object.values(productTotals).reduce((sum, product) => sum + (product.assignedToKouffa || 0), 0) /
                          Object.values(productTotals).reduce((sum, product) => sum + product.totalQuantity, 0)) * 100)
                      : 0}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Loading indicator */}
      {loading && (
        <Box sx={{ width: '100%', mb: 3 }}>
          <LinearProgress />
        </Box>
      )}

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Bouton d'ajout */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          onClick={() => {
            setSelectedDonation(null);
            setFormData({
              productName: '',
              customProductName: '',
              unitPrice: '',
              quantity: '',
              destination: 'association'
            });
            setOpenDialog(true);
          }}
          disabled={loading}
        >
          Ajouter un don
        </Button>
      </Box>

      {/* Table des dons */}
      <Card variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Produit</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Prix Unitaire (TND)</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Quantité</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Prix Total (TND)</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Destination</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {donations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Aucun don enregistré
                  </TableCell>
                </TableRow>
              ) : (
                donations.map((donation) => (
                  <TableRow key={donation._id || donation.id} hover>
                    <TableCell>{donation.productName}</TableCell>
                    <TableCell>{donation.unitPrice.toFixed(2)} TND</TableCell>
                    <TableCell>{donation.quantity}</TableCell>
                    <TableCell>{donation.totalPrice.toFixed(2)} TND</TableCell>
                    <TableCell>
                      <Chip
                        label={
                          donation.destination === 'restaurant' ? 'Restaurant' :
                          donation.destination === 'kouffa' ? 'Kouffa Ramadan' :
                          'Association'
                        }
                        size="small"
                        color={
                          donation.destination === 'restaurant' ? 'primary' :
                          donation.destination === 'kouffa' ? 'secondary' :
                          'default'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={(donation.distributedQuantity || 0) > 0 ? <CheckCircleOutlined /> : <MinusCircleOutlined />}
                        label={(donation.distributedQuantity || 0) > 0 ? `Distribué (${donation.distributedQuantity}/${donation.quantity})` : 'En Stock'}
                        size="small"
                        color={(donation.distributedQuantity || 0) > 0 ? 'success' : 'warning'}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(donation.donationDate || donation.date).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          size="small"
                          onClick={() => handleToggleDistributed(donation._id || donation.id)}
                          color={(donation.distributedQuantity || 0) > 0 ? 'warning' : 'success'}
                          startIcon={(donation.distributedQuantity || 0) > 0 ? <MinusCircleOutlined /> : <CheckCircleOutlined />}
                        >
                          {(donation.distributedQuantity || 0) > 0 ? 'Annuler Distribution' : 'Distribuer Tout'}
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleOpenDialog(donation)}
                          startIcon={<EditOutlined />}
                        >
                          Modifier
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleDelete(donation._id || donation.id)}
                          startIcon={<DeleteOutlined />}
                        >
                          Supprimer
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Totaux par produit */}
      <Box sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
            Totaux par Produit
          </Typography>
          <Button
            variant="contained"
            startIcon={<PrinterOutlined />}
            onClick={handlePrintProductTotals}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 2,
              px: 3,
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Imprimer
          </Button>
        </Box>
        <Card variant="outlined">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Produit</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Quantité Totale</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Quantité Distribuée</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Quantité Restante</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Valeur Totale (TND)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Valeur Distribuée (TND)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Valeur Restante (TND)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(productTotals).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Aucun produit enregistré
                    </TableCell>
                  </TableRow>
                ) : (
                  Object.entries(productTotals).map(([productName, totals]) => (
                    <TableRow key={productName} hover>
                      <TableCell sx={{ fontWeight: 'medium' }}>{productName}</TableCell>
                      <TableCell>{totals.totalQuantity}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          onClick={() => {
                            setSelectedProductForQuantity(productName);
                            setQuantityInput(totals.distributedQuantity.toString());
                            setOpenQuantityDialog(true);
                          }}
                          sx={{
                            minWidth: '80px',
                            fontWeight: 'medium',
                            borderRadius: 2,
                            '&:hover': {
                              backgroundColor: 'primary.main',
                              color: 'white'
                            }
                          }}
                        >
                          {totals.distributedQuantity}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Typography color="warning.main" fontWeight="medium">
                          {totals.totalQuantity - totals.distributedQuantity}
                        </Typography>
                      </TableCell>
                      <TableCell>{totals.totalValue.toFixed(2)} TND</TableCell>
                      <TableCell>
                        <Typography color="success.main" fontWeight="medium">
                          {totals.distributedValue.toFixed(2)} TND
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography color="warning.main" fontWeight="medium">
                          {(totals.totalValue - totals.distributedValue).toFixed(2)} TND
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>

      {/* Gestion d'Inventaire - Assignation aux destinations */}
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
            🏪 Gestion d'Inventaire - Assignation aux Destinations
          </Typography>
        </Box>
        <Card variant="outlined">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Produit</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Stock Total</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Restaurant</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Kouffa Ramadan</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Valeur Restaurant (TND)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Valeur Kouffa (TND)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Restant à Assigner</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(productTotals).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      Aucun produit enregistré
                    </TableCell>
                  </TableRow>
                ) : (
                  Object.entries(productTotals).map(([productName, totals]) => {
                    const remainingToAssign = totals.totalQuantity - totals.assignedToRestaurant - totals.assignedToKouffa;
                    return (
                      <TableRow key={productName} hover>
                        <TableCell sx={{ fontWeight: 'medium' }}>{productName}</TableCell>
                        <TableCell>{totals.totalQuantity} unités</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            onClick={() => {
                              setSelectedProductForAssignment(productName);
                              setAssignmentDestination('restaurant');
                              setAssignmentQuantity(totals.assignedToRestaurant.toString());
                              setOpenAssignmentDialog(true);
                            }}
                            sx={{
                              minWidth: '80px',
                              fontWeight: 'medium',
                              borderRadius: 2,
                              '&:hover': {
                                backgroundColor: 'primary.main',
                                color: 'white'
                              }
                            }}
                          >
                            {totals.assignedToRestaurant}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            color="secondary"
                            onClick={() => {
                              setSelectedProductForAssignment(productName);
                              setAssignmentDestination('kouffa');
                              setAssignmentQuantity(totals.assignedToKouffa.toString());
                              setOpenAssignmentDialog(true);
                            }}
                            sx={{
                              minWidth: '80px',
                              fontWeight: 'medium',
                              borderRadius: 2,
                              '&:hover': {
                                backgroundColor: 'secondary.main',
                                color: 'white'
                              }
                            }}
                          >
                            {totals.assignedToKouffa}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Typography color="primary.main" fontWeight="medium">
                            {totals.restaurantValue.toFixed(2)} TND
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography color="secondary.main" fontWeight="medium">
                            {totals.kouffaValue.toFixed(2)} TND
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            color={remainingToAssign > 0 ? "warning.main" : "success.main"}
                            fontWeight="medium"
                          >
                            {remainingToAssign} unités
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              size="small"
                              onClick={() => {
                                setSelectedProductForAssignment(productName);
                                setAssignmentDestination('restaurant');
                                setAssignmentQuantity('0');
                                setOpenAssignmentDialog(true);
                              }}
                              color="primary"
                              variant="contained"
                              sx={{ borderRadius: 2 }}
                            >
                              + Restaurant
                            </Button>
                            <Button
                              size="small"
                              onClick={() => {
                                setSelectedProductForAssignment(productName);
                                setAssignmentDestination('kouffa');
                                setAssignmentQuantity('0');
                                setOpenAssignmentDialog(true);
                              }}
                              color="secondary"
                              variant="contained"
                              sx={{ borderRadius: 2 }}
                            >
                              + Kouffa
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedDonation ? 'Modifier le don' : 'Nouveau don alimentaire'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Nom du produit alimentaire *</InputLabel>
                  <Select
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    label="Nom du produit alimentaire *"
                  >
                    {productOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                    <MenuItem value="custom">Autre (personnalisé)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {formData.productName === 'custom' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nom du produit personnalisé"
                    name="customProductName"
                    value={formData.customProductName || ''}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Prix unitaire (TND)"
                  name="unitPrice"
                  type="number"
                  value={formData.unitPrice}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Quantité"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Destination</InputLabel>
                  <Select
                    name="destination"
                    value={formData.destination}
                    onChange={handleInputChange}
                    label="Destination"
                  >
                    <MenuItem value="association">Association</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {formData.unitPrice && formData.quantity && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    Prix total: {(parseFloat(formData.unitPrice) * parseInt(formData.quantity)).toFixed(2)} TND
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedDonation ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog pour modifier la quantité distribuée */}
      <Dialog
        open={openQuantityDialog}
        onClose={() => setOpenQuantityDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textAlign: 'center',
            py: 2
          }}
        >
          Modifier Quantité Distribuée
          <Typography variant="subtitle1" sx={{ mt: 1, opacity: 0.9 }}>
            {selectedProductForQuantity}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              Quantité Actuellement Distribuée
            </Typography>
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {productTotals[selectedProductForQuantity]?.distributedQuantity || 0} unités
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" gutterBottom sx={{ fontWeight: 'medium' }}>
              Quantité Totale Disponible: {productTotals[selectedProductForQuantity]?.totalQuantity || 0} unités
            </Typography>
            <Typography variant="body2" color="warning.main">
              Restant en Stock: {productTotals[selectedProductForQuantity]?.totalQuantity - productTotals[selectedProductForQuantity]?.distributedQuantity || 0} unités
            </Typography>
          </Box>

          <TextField
            fullWidth
            label="Nouvelle Quantité Distribuée"
            type="number"
            value={quantityInput}
            onChange={(e) => setQuantityInput(e.target.value)}
            inputProps={{
              min: 0,
              max: productTotals[selectedProductForQuantity]?.totalQuantity || 0
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                }
              }
            }}
            helperText={`Valeur entre 0 et ${productTotals[selectedProductForQuantity]?.totalQuantity || 0}`}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'space-between' }}>
          <Button
            onClick={() => setOpenQuantityDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Annuler
          </Button>
          <Button
            onClick={() => {
              handleDistributedQuantityChange(selectedProductForQuantity, quantityInput);
              setOpenQuantityDialog(false);
            }}
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
              }
            }}
          >
            Appliquer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog pour assigner les quantités aux destinations */}
      <Dialog
        open={openAssignmentDialog}
        onClose={() => setOpenAssignmentDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle
          sx={{
            background: assignmentDestination === 'restaurant'
              ? 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
              : 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
            color: 'white',
            textAlign: 'center',
            py: 2
          }}
        >
          Assigner au {assignmentDestination === 'restaurant' ? 'Restaurant' : 'Kouffa Ramadan'}
          <Typography variant="subtitle1" sx={{ mt: 1, opacity: 0.9 }}>
            {selectedProductForAssignment}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              Quantité Actuellement Assignée
            </Typography>
            <Typography
              variant="h4"
              color={assignmentDestination === 'restaurant' ? 'primary.main' : 'secondary.main'}
              fontWeight="bold"
            >
              {assignmentDestination === 'restaurant'
                ? (productTotals[selectedProductForAssignment]?.assignedToRestaurant || 0)
                : (productTotals[selectedProductForAssignment]?.assignedToKouffa || 0)
              } unités
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" gutterBottom sx={{ fontWeight: 'medium' }}>
              Quantité Totale Disponible: {productTotals[selectedProductForAssignment]?.totalQuantity || 0} unités
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Déjà assigné au Restaurant: {productTotals[selectedProductForAssignment]?.assignedToRestaurant || 0} unités
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Déjà assigné à la Kouffa: {productTotals[selectedProductForAssignment]?.assignedToKouffa || 0} unités
            </Typography>
            <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
              Restant disponible: {
                (productTotals[selectedProductForAssignment]?.totalQuantity || 0) -
                (productTotals[selectedProductForAssignment]?.assignedToRestaurant || 0) -
                (productTotals[selectedProductForAssignment]?.assignedToKouffa || 0) +
                (assignmentDestination === 'restaurant'
                  ? (productTotals[selectedProductForAssignment]?.assignedToRestaurant || 0)
                  : (productTotals[selectedProductForAssignment]?.assignedToKouffa || 0)
                )
              } unités
            </Typography>
          </Box>

          <TextField
            fullWidth
            label={`Nouvelle Quantité pour ${assignmentDestination === 'restaurant' ? 'Restaurant' : 'Kouffa Ramadan'}`}
            type="number"
            value={assignmentQuantity}
            onChange={(e) => setAssignmentQuantity(e.target.value)}
            inputProps={{
              min: 0,
              max: (productTotals[selectedProductForAssignment]?.totalQuantity || 0) -
                    (assignmentDestination === 'restaurant'
                      ? (productTotals[selectedProductForAssignment]?.assignedToKouffa || 0)
                      : (productTotals[selectedProductForAssignment]?.assignedToRestaurant || 0)
                    )
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: assignmentDestination === 'restaurant' ? 'primary.main' : 'secondary.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: assignmentDestination === 'restaurant' ? 'primary.main' : 'secondary.main',
                }
              }
            }}
            helperText={`Valeur entre 0 et ${
              (productTotals[selectedProductForAssignment]?.totalQuantity || 0) -
              (assignmentDestination === 'restaurant'
                ? (productTotals[selectedProductForAssignment]?.assignedToKouffa || 0)
                : (productTotals[selectedProductForAssignment]?.assignedToRestaurant || 0)
              )
            }`}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'space-between' }}>
          <Button
            onClick={() => setOpenAssignmentDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Annuler
          </Button>
          <Button
            onClick={() => {
              handleAssignmentQuantityChange(selectedProductForAssignment, assignmentDestination, assignmentQuantity);
              setOpenAssignmentDialog(false);
            }}
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 3,
              background: assignmentDestination === 'restaurant'
                ? 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
                : 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
              '&:hover': {
                background: assignmentDestination === 'restaurant'
                  ? 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)'
                  : 'linear-gradient(135deg, #7b1fa2 0%, #4a148c 100%)'
              }
            }}
          >
            Assigner
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainCard>
  );
};

export default DonRamadhan;
