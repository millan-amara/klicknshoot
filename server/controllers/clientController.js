const Client = require('../models/client');
const User = require('../models/user');
const Request = require('../models/request');
const mongoose = require('mongoose');

exports.getClients = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { displayName: { $regex: search, $options: 'i' } },
        { 'company.name': { $regex: search, $options: 'i' } }
      ];
    }

    const clients = await Client.find(query)
      .populate('user', 'email subscription createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Client.countDocuments(query);

    res.json({
      success: true,
      clients,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate('user', 'email subscription');

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Check if requester is authorized
    if (req.user.id !== client.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      success: true,
      client
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getClientByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('Looking for creative with user ID:', userId);
    
    // Find creative by user reference
    const client = await Client.findOne({ user: userId })
      .populate('user', 'email subscription subscriptionStatus');
    
    if (!client) {
      return res.status(404).json({ 
        success: false, 
        message: 'Client profile not found' 
      });
    }

    // Check authorization (user can only view their own profile)
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    res.json({
      success: true,
      client
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if client exists
    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Check if requester is authorized
    if (req.user.id !== client.user.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updates = req.body;
    
    // Update display name if name changed
    if (updates.firstName || updates.lastName) {
      updates.displayName = `${updates.firstName || client.firstName} ${updates.lastName || client.lastName}`;
    }

    const updatedClient = await Client.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('user', 'email subscription');

    res.json({
      success: true,
      client: updatedClient
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getClientRequests = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, page = 1, limit = 20 } = req.query;
    
    // Check if client exists
    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Check if requester is authorized
    if (req.user.id !== client.user.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const query = { client: client.user._id };
    if (status) query.status = status;

    const requests = await Request.find(query)
      .populate('proposals.proposalId', 'status quote')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Request.countDocuments(query);

    res.json({
      success: true,
      requests,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getClientStats = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id)
    console.log(req.params)

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid client ID" });
    }
    
    // Check if client exists
    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Check if requester is authorized
    if (req.user.id !== client.user.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const requests = await Request.find({ client: client.user._id });
    const proposals = await Request.aggregate([
      { $match: { client: client.user._id } },
      { $unwind: '$proposals' },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);

    const stats = {
      totalRequests: requests.length,
      activeRequests: requests.filter(r => r.status === 'open' || r.status === 'reviewing').length,
      completedRequests: requests.filter(r => r.status === 'completed').length,
      totalProposals: proposals[0]?.count || 0,
      averageProposalsPerRequest: requests.length > 0 ? (proposals[0]?.count || 0) / requests.length : 0,
      totalBudgetSpent: client.stats.totalBudgetSpent || 0,
      favoriteCategory: getMostCommonCategory(requests)
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

function getMostCommonCategory(requests) {
  if (requests.length === 0) return null;
  
  const categories = requests.map(r => r.category);
  const counts = {};
  let maxCount = 0;
  let mostCommon = null;

  categories.forEach(category => {
    counts[category] = (counts[category] || 0) + 1;
    if (counts[category] > maxCount) {
      maxCount = counts[category];
      mostCommon = category;
    }
  });

  return mostCommon;
}