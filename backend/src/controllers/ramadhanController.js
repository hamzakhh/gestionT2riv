import RamadhanDonation from '../models/RamadhanDonation.js';
import { formatPaginatedResponse, getPaginationParams } from '../utils/helpers.js';
import logger from '../utils/logger.js';

export const getAllRamadhanDonations = async (req, res, next) => {
  try {
    const { page, limit, category, destination, startDate, endDate, productName } = req.query;
    const { skip, itemsPerPage } = getPaginationParams(page, limit);

    const filter = {};
    if (category) filter.category = category;
    if (destination) filter.destination = destination;
    if (productName) {
      filter.productName = { $regex: productName, $options: 'i' };
    }
    if (startDate || endDate) {
      filter.donationDate = {};
      if (startDate) filter.donationDate.$gte = new Date(startDate);
      if (endDate) filter.donationDate.$lte = new Date(endDate);
    }

    const donations = await RamadhanDonation.find(filter)
      .sort({ donationDate: -1 })
      .skip(skip)
      .limit(itemsPerPage)
      .populate('donor', 'firstName lastName companyName email phone')
      .populate('createdBy', 'firstName lastName');

    const total = await RamadhanDonation.countDocuments(filter);

    res.status(200).json({
      success: true,
      ...formatPaginatedResponse(donations, page, limit, total),
    });
  } catch (error) {
    next(error);
  }
};

export const getRamadhanDonationById = async (req, res, next) => {
  try {
    const donation = await RamadhanDonation.findById(req.params.id)
      .populate('donor')
      .populate('createdBy', 'firstName lastName');

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Don Ramadhan non trouvé',
      });
    }

    res.status(200).json({
      success: true,
      data: donation,
    });
  } catch (error) {
    next(error);
  }
};

export const createRamadhanDonation = async (req, res, next) => {
  try {
    req.body.createdBy = req.user._id;
    
    // Générer un numéro de reçu si non fourni
    if (!req.body.receiptNumber) {
      req.body.receiptNumber = RamadhanDonation.generateReceiptNumber();
    }

    const donation = await RamadhanDonation.create(req.body);
    await donation.populate('donor', 'firstName lastName companyName');

    logger.info(`Don Ramadhan créé: ${donation.productName} (${donation.quantity} unités) par ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Don Ramadhan enregistré avec succès',
      data: donation,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRamadhanDonation = async (req, res, next) => {
  try {
    const donation = await RamadhanDonation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('donor');

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Don Ramadhan non trouvé',
      });
    }

    logger.info(`Don Ramadhan mis à jour: ${donation.receiptNumber} par ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Don Ramadhan mis à jour',
      data: donation,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRamadhanDonation = async (req, res, next) => {
  try {
    const donation = await RamadhanDonation.findByIdAndDelete(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Don Ramadhan non trouvé',
      });
    }

    logger.info(`Don Ramadhan supprimé: ${donation.receiptNumber} par ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Don Ramadhan supprimé',
    });
  } catch (error) {
    next(error);
  }
};

export const getRamadhanStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchStage = {};
    if (startDate || endDate) {
      matchStage.donationDate = {};
      if (startDate) matchStage.donationDate.$gte = new Date(startDate);
      if (endDate) matchStage.donationDate.$lte = new Date(endDate);
    }

    // Statistiques générales
    const generalStats = await RamadhanDonation.aggregate([
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: '$totalPrice' },
          distributedQuantity: { $sum: '$distributedQuantity' },
          distributedValue: { $sum: { $multiply: ['$distributedQuantity', '$unitPrice'] } },
          assignedToRestaurant: { $sum: '$assignedToRestaurant' },
          assignedToKouffa: { $sum: '$assignedToKouffa' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Statistiques par produit
    const productStats = await RamadhanDonation.aggregate([
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: '$productName',
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: '$totalPrice' },
          distributedQuantity: { $sum: '$distributedQuantity' },
          distributedValue: { $sum: { $multiply: ['$distributedQuantity', '$unitPrice'] } },
          assignedToRestaurant: { $sum: '$assignedToRestaurant' },
          assignedToKouffa: { $sum: '$assignedToKouffa' },
          category: { $first: '$category' },
        },
      },
      { $sort: { totalValue: -1 } },
    ]);

    // Statistiques par catégorie
    const categoryStats = await RamadhanDonation.aggregate([
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: '$category',
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: '$totalPrice' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalValue: -1 } },
    ]);

    // Statistiques quotidiennes/hebdomadaires
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const dailyStats = await RamadhanDonation.aggregate([
      { $match: { donationDate: { $gte: startOfDay } } },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: '$totalPrice' },
          distributedQuantity: { $sum: '$distributedQuantity' },
          count: { $sum: 1 },
        },
      },
    ]);

    const weeklyStats = await RamadhanDonation.aggregate([
      { $match: { donationDate: { $gte: last7Days } } },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: '$totalPrice' },
          distributedQuantity: { $sum: '$distributedQuantity' },
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = generalStats[0] || {
      totalQuantity: 0,
      totalValue: 0,
      distributedQuantity: 0,
      distributedValue: 0,
      assignedToRestaurant: 0,
      assignedToKouffa: 0,
      count: 0,
    };

    // Calculer les valeurs restantes
    stats.remainingQuantity = stats.totalQuantity - stats.distributedQuantity - stats.assignedToRestaurant - stats.assignedToKouffa;
    stats.remainingValue = stats.totalValue - stats.distributedValue - (stats.assignedToRestaurant * stats.unitPrice || 0) - (stats.assignedToKouffa * stats.unitPrice || 0);

    res.status(200).json({
      success: true,
      data: {
        overview: stats,
        daily: dailyStats[0] || { totalQuantity: 0, totalValue: 0, distributedQuantity: 0, count: 0 },
        weekly: weeklyStats[0] || { totalQuantity: 0, totalValue: 0, distributedQuantity: 0, count: 0 },
        byProduct: productStats,
        byCategory: categoryStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateDistribution = async (req, res, next) => {
  try {
    const { distributedQuantity, assignedToRestaurant, assignedToKouffa } = req.body;
    const donation = await RamadhanDonation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Don Ramadhan non trouvé',
      });
    }

    // Valider que les quantités distribuées ne dépassent pas la quantité totale
    const totalAssigned = (distributedQuantity || 0) + (assignedToRestaurant || 0) + (assignedToKouffa || 0);
    if (totalAssigned > donation.quantity) {
      return res.status(400).json({
        success: false,
        message: 'La quantité totale distribuée ne peut pas dépasser la quantité disponible',
      });
    }

    const updatedDonation = await RamadhanDonation.findByIdAndUpdate(
      req.params.id,
      {
        distributedQuantity: distributedQuantity || 0,
        assignedToRestaurant: assignedToRestaurant || 0,
        assignedToKouffa: assignedToKouffa || 0,
      },
      { new: true, runValidators: true }
    ).populate('donor');

    logger.info(`Distribution mise à jour pour ${donation.productName}: ${totalAssigned} unités par ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Distribution mise à jour avec succès',
      data: updatedDonation,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductTotals = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchStage = {};
    if (startDate || endDate) {
      matchStage.donationDate = {};
      if (startDate) matchStage.donationDate.$gte = new Date(startDate);
      if (endDate) matchStage.donationDate.$lte = new Date(endDate);
    }

    const productTotals = await RamadhanDonation.aggregate([
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: '$productName',
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: '$totalPrice' },
          distributedQuantity: { $sum: '$distributedQuantity' },
          distributedValue: { $sum: { $multiply: ['$distributedQuantity', '$unitPrice'] } },
          assignedToRestaurant: { $sum: '$assignedToRestaurant' },
          assignedToKouffa: { $sum: '$assignedToKouffa' },
          category: { $first: '$category' },
        },
      },
      {
        $addFields: {
          remainingQuantity: { $subtract: ['$totalQuantity', '$distributedQuantity'] },
          remainingValue: { $subtract: ['$totalValue', '$distributedValue'] },
          restaurantValue: { $multiply: ['$assignedToRestaurant', { $divide: ['$totalValue', '$totalQuantity'] }] },
          kouffaValue: { $multiply: ['$assignedToKouffa', { $divide: ['$totalValue', '$totalQuantity'] }] },
        },
      },
      { $sort: { totalValue: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: productTotals,
    });
  } catch (error) {
    next(error);
  }
};
