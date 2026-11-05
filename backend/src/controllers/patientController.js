import Patient from '../models/Patient.js';
import asyncHandler from 'express-async-handler';
import logger from '../utils/logger.js';
import { uploadToSupabase, deleteFromSupabase } from '../middleware/upload.js';

// @desc    Récupérer tous les patients
// @route   GET /api/patients
// @access  Privé
const getPatients = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '', lean = true } = req.query;

  const query = {};

  if (search) {
    query.$text = { $search: search };
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
    lean: lean === 'true' // Optimisation: lean pour éviter la création d'instances Mongoose
  };

  // Projection pour optimiser la taille de la réponse (champs uniquement nécessaires pour l'affichage)
  const projection = {
    firstName: 1,
    lastName: 1,
    phone: 1,
    patientType: 1,
    createdAt: 1,
    entryDate: 1
  };

  const patients = await Patient.paginate(query, { ...options, projection });

  res.json({
    success: true,
    count: patients.totalDocs,
    data: patients.docs,
    totalPages: patients.totalPages,
    currentPage: patients.page
  });
});

// @desc    Récupérer un patient par ID
// @route   GET /api/patients/:id
// @access  Privé
const getPatientById = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);

  if (!patient) {
    res.status(404);
    throw new Error('Patient non trouvé');
  }

  res.json({
    success: true,
    data: patient
  });
});

// @desc    Créer un patient
// @route   POST /api/patients
// @access  Privé
const createPatient = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    address,
    phone,
    guardianFirstName,
    guardianLastName,
    patientType,
    specificEquipment,
    entryDate,
    exitDate
  } = req.body;

  // Upload des fichiers vers Supabase
  const uploadedFiles = [];
  if (req.files) {
    for (const [fieldName, files] of Object.entries(req.files)) {
      for (const file of files) {
        try {
          const uploadedFile = await uploadToSupabase(file, 'patients', 'patient');
          uploadedFiles.push({
            ...uploadedFile,
            fieldName // Pour identifier quel champ correspond (cinPhoto, contractPhoto, etc.)
          });
        } catch (error) {
          logger.error(`Erreur upload fichier ${fieldName}:`, error);
          return res.status(500).json({
            success: false,
            message: `Erreur lors de l'upload du fichier ${fieldName}: ${error.message}`
          });
        }
      }
    }
  }

  try {
    const patientData = {
      firstName,
      lastName,
      address,
      phone,
      guardianFirstName,
      guardianLastName,
      patientType,
      specificEquipment: patientType === 'spécifique' ? specificEquipment : '',
      ...(entryDate && { entryDate }),
      ...(exitDate && { exitDate }),
      files: uploadedFiles
    };

    const patient = await Patient.create(patientData);

    res.status(201).json({
      success: true,
      data: patient
    });
  } catch (error) {
    // Cleanup Supabase files in case of error
    for (const file of uploadedFiles) {
      try {
        await deleteFromSupabase(file.path);
      } catch (err) {
        logger.error(`Failed to delete Supabase file: ${file.path}`, err);
      }
    }

    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Mettre à jour un patient
// @route   PUT /api/patients/:id
// @access  Privé
const updatePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);

  if (!patient) {
    res.status(404);
    throw new Error('Patient non trouvé');
  }

  const {
    firstName,
    lastName,
    address,
    phone,
    guardianFirstName,
    guardianLastName,
    patientType,
    specificEquipment,
    entryDate,
    exitDate
  } = req.body;

  // Upload des nouveaux fichiers vers Supabase
  const uploadedFiles = [];
  if (req.files) {
    for (const [fieldName, files] of Object.entries(req.files)) {
      for (const file of files) {
        try {
          const uploadedFile = await uploadToSupabase(file, 'patients', 'patient');
          uploadedFiles.push({
            ...uploadedFile,
            fieldName
          });
        } catch (error) {
          logger.error(`Erreur upload fichier ${fieldName}:`, error);
          return res.status(500).json({
            success: false,
            message: `Erreur lors de l'upload du fichier ${fieldName}: ${error.message}`
          });
        }
      }
    }
  }

  patient.firstName = firstName || patient.firstName;
  patient.lastName = lastName || patient.lastName;
  patient.address = address || patient.address;
  patient.phone = phone || patient.phone;
  patient.guardianFirstName = guardianFirstName || patient.guardianFirstName;
  patient.guardianLastName = guardianLastName || patient.guardianLastName;
  patient.patientType = patientType || patient.patientType;
  patient.specificEquipment = patient.patientType === 'spécifique' ? (specificEquipment || patient.specificEquipment) : '';
  patient.entryDate = entryDate || patient.entryDate;
  patient.exitDate = exitDate || patient.exitDate;

  if (uploadedFiles.length > 0) {
    patient.files = patient.files.concat(uploadedFiles);
  }

  const updatedPatient = await patient.save();

  res.json({
    success: true,
    data: updatedPatient
  });
});

// @desc    Supprimer un patient
// @route   DELETE /api/patients/:id
// @access  Privé/Admin
const deletePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);

  if (!patient) {
    res.status(404);
    throw new Error('Patient non trouvé');
  }

  // Delete associated files from Supabase
  if (patient.files && patient.files.length > 0) {
    for (const file of patient.files) {
      try {
        await deleteFromSupabase(file.path);
      } catch (err) {
        logger.error(`Failed to delete Supabase file: ${file.path}`, err);
      }
    }
  }

  await patient.deleteOne();

  res.json({ success: true, data: {} });
});

// @desc    Obtenir les statistiques des patients
// @route   GET /api/patients/stats
// @access  Privé
const getPatientStats = asyncHandler(async (req, res) => {
  const stats = await Patient.aggregate([
    {
      $group: {
        _id: null,

        total: { $sum: 1 },

        withEquipment: {
          $sum: {
            $cond: [
              { $gt: [{ $size: { $ifNull: ['$borrowedEquipment', []] } }, 0] },
              1,
              0
            ]
          }
        },

        withGuardians: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ['$guardianFirstName', null] },
                  { $ne: ['$guardianFirstName', ''] },
                  { $ne: ['$guardianLastName', null] },
                  { $ne: ['$guardianLastName', ''] }
                ]
              },
              1,
              0
            ]
          }
        },

        withSpecificEquipment: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ['$specificEquipment', null] },
                  { $ne: ['$specificEquipment', ''] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  res.json({
    success: true,
    data: stats[0] || {
      total: 0,
      withEquipment: 0,
      withGuardians: 0,
      withSpecificEquipment: 0
    }
  });
});

export {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientStats
};
