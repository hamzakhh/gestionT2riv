import Zakat from '../models/Zakat.js';
import { formatPaginatedResponse, getPaginationParams } from '../utils/helpers.js';
import logger from '../utils/logger.js';

export const getAllZakat = async (req, res, next) => {
  try {
    const { page, limit, zakatType, status, startDate, endDate, donorName } = req.query;
    const { skip, itemsPerPage } = getPaginationParams(page, limit);

    const filter = {};
    if (zakatType) filter.zakatType = zakatType;
    if (status) filter.status = status;
    if (donorName) {
      filter.donorName = { $regex: donorName, $options: 'i' };
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const zakatRecords = await Zakat.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(itemsPerPage)
      .populate('donor', 'firstName lastName companyName email phone')
      .populate('createdBy', 'firstName lastName');

    const total = await Zakat.countDocuments(filter);

    res.status(200).json({
      success: true,
      ...formatPaginatedResponse(zakatRecords, page, limit, total),
    });
  } catch (error) {
    next(error);
  }
};

export const getZakatById = async (req, res, next) => {
  try {
    const zakat = await Zakat.findById(req.params.id)
      .populate('donor')
      .populate('createdBy', 'firstName lastName');

    if (!zakat) {
      return res.status(404).json({
        success: false,
        message: 'Zakat non trouvé',
      });
    }

    res.status(200).json({
      success: true,
      data: zakat,
    });
  } catch (error) {
    next(error);
  }
};

export const createZakat = async (req, res, next) => {
  try {
    const zakatData = {
      ...req.body,
      createdBy: req.user.id,
    };

    // Générer une référence automatique si non fournie
    if (!zakatData.paymentReference) {
      zakatData.paymentReference = Zakat.generateReference();
    }

    const zakat = new Zakat(zakatData);
    await zakat.save();

    const populatedZakat = await Zakat.findById(zakat._id)
      .populate('donor', 'firstName lastName companyName email phone')
      .populate('createdBy', 'firstName lastName');

    logger.info(`Nouveau Zakat créé: ${zakat._id} par ${req.user.id}`);

    res.status(201).json({
      success: true,
      message: 'Zakat créé avec succès',
      data: populatedZakat,
    });
  } catch (error) {
    next(error);
  }
};

export const updateZakat = async (req, res, next) => {
  try {
    const zakat = await Zakat.findById(req.params.id);

    if (!zakat) {
      return res.status(404).json({
        success: false,
        message: 'Zakat non trouvé',
      });
    }

    // Mettre à jour les champs
    Object.assign(zakat, req.body);
    await zakat.save();

    const updatedZakat = await Zakat.findById(zakat._id)
      .populate('donor', 'firstName lastName companyName email phone')
      .populate('createdBy', 'firstName lastName');

    logger.info(`Zakat mis à jour: ${zakat._id} par ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: 'Zakat mis à jour avec succès',
      data: updatedZakat,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteZakat = async (req, res, next) => {
  try {
    const zakat = await Zakat.findById(req.params.id);

    if (!zakat) {
      return res.status(404).json({
        success: false,
        message: 'Zakat non trouvé',
      });
    }

    await Zakat.findByIdAndDelete(req.params.id);

    logger.info(`Zakat supprimé: ${req.params.id} par ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: 'Zakat supprimé avec succès',
    });
  } catch (error) {
    next(error);
  }
};

export const distributeZakat = async (req, res, next) => {
  try {
    const { distributedTo, distributionNotes, beneficiaryInfo } = req.body;
    
    const zakat = await Zakat.findById(req.params.id);

    if (!zakat) {
      return res.status(404).json({
        success: false,
        message: 'Zakat non trouvé',
      });
    }

    if (zakat.status === 'distributed') {
      return res.status(400).json({
        success: false,
        message: 'Ce Zakat est déjà distribué',
      });
    }

    if (zakat.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Impossible de distribuer un Zakat annulé',
      });
    }

    // Mettre à jour les informations de distribution
    zakat.status = 'distributed';
    zakat.distributedTo = distributedTo;
    zakat.distributionDate = new Date();
    zakat.distributionNotes = distributionNotes;
    
    if (beneficiaryInfo) {
      zakat.beneficiaryInfo = { ...zakat.beneficiaryInfo, ...beneficiaryInfo };
    }

    await zakat.save();

    const updatedZakat = await Zakat.findById(zakat._id)
      .populate('donor', 'firstName lastName companyName email phone')
      .populate('createdBy', 'firstName lastName');

    logger.info(`Zakat distribué: ${zakat._id} à ${distributedTo} par ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: 'Zakat distribué avec succès',
      data: updatedZakat,
    });
  } catch (error) {
    next(error);
  }
};

export const getZakatStats = async (req, res, next) => {
  try {
    const stats = await Zakat.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalCount: { $sum: 1 },
          pendingCount: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          distributedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'distributed'] }, 1, 0] }
          },
          cancelledCount: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          pendingAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] }
          },
          distributedAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'distributed'] }, '$amount', 0] }
          },
        }
      }
    ]);

    const typeStats = await Zakat.aggregate([
      {
        $group: {
          _id: '$zakatType',
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      }
    ]);

    const result = stats[0] || {
      totalAmount: 0,
      totalCount: 0,
      pendingCount: 0,
      distributedCount: 0,
      cancelledCount: 0,
      pendingAmount: 0,
      distributedAmount: 0,
    };

    res.status(200).json({
      success: true,
      data: {
        ...result,
        typeStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getZakatReport = async (req, res, next) => {
  try {
    const { startDate, endDate, zakatType, status } = req.query;
    
    const matchStage = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }
    if (zakatType) matchStage.zakatType = zakatType;
    if (status) matchStage.status = status;

    const report = await Zakat.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            zakatType: '$zakatType',
            status: '$status'
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          averageAmount: { $avg: '$amount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};
