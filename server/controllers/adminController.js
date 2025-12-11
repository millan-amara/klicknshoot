const User = require('../models/user');
const Creative = require('../models/creative');
const Client = require('../models/client');
const Request = require('../models/request');
const Proposal = require('../models/proposal');
const Subscription = require('../models/subscription');
const VerificationQueue = require('../models/verificationqueue');

exports.getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments();
    const totalCreatives = await Creative.countDocuments();
    const totalClients = await Client.countDocuments();
    const totalRequests = await Request.countDocuments();
    const totalProposals = await Proposal.countDocuments();
    
    // Get active counts
    const activeUsers = await User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } });
    const activeRequests = await Request.countDocuments({ status: { $in: ['open', 'reviewing'] } });
    const pendingVerifications = await VerificationQueue.countDocuments({ status: 'pending' });
    
    // Get subscription counts
    const subscriptionCounts = await User.aggregate([
      { $group: { _id: '$subscription', count: { $sum: 1 } } }
    ]);
    
    // Get recent activity
    const recentRequests = await Request.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('client', 'displayName');
    
    const recentProposals = await Proposal.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('creative', 'displayName')
      .populate('request', 'title');
    
    const recentVerifications = await VerificationQueue.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('creative', 'displayName');

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        creatives: totalCreatives,
        clients: totalClients,
        subscriptions: subscriptionCounts.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {})
      },
      marketplace: {
        totalRequests,
        activeRequests,
        totalProposals,
        averageProposalsPerRequest: totalRequests > 0 ? (totalProposals / totalRequests).toFixed(2) : 0
      },
      moderation: {
        pendingVerifications
      },
      recentActivity: {
        requests: recentRequests,
        proposals: recentProposals,
        verifications: recentVerifications
      }
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

exports.getVerificationQueue = async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;
    
    const query = { status };
    
    const queue = await VerificationQueue.find(query)
      .populate('creative', 'displayName bio portfolio')
      .populate('user', 'email createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ 
        priority: -1,
        'metadata.submittedAt': 1 
      });

    // Increment views
    queue.forEach(item => {
      item.metadata.views += 1;
      item.metadata.lastViewedAt = new Date();
      item.save();
    });

    const total = await VerificationQueue.countDocuments(query);

    res.json({
      success: true,
      queue,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.approveVerification = async (req, res) => {
  try {
    const { queueId } = req.params;
    const { notes } = req.body;
    
    // Find verification queue item
    const queueItem = await VerificationQueue.findById(queueId)
      .populate('creative');
    
    if (!queueItem) {
      return res.status(404).json({ message: 'Verification queue item not found' });
    }

    if (queueItem.status !== 'pending') {
      return res.status(400).json({ message: 'Already processed' });
    }

    // Update queue item
    queueItem.status = 'approved';
    queueItem.reviewedBy = req.user.id;
    queueItem.reviewedAt = new Date();
    queueItem.notes = notes;
    await queueItem.save();

    // Update creative verification status
    const creative = queueItem.creative;
    creative.verification.isVerified = true;
    creative.verification.verifiedBy = req.user.id;
    creative.verification.verifiedAt = new Date();
    creative.verification.socialProof = queueItem.socialLinks;
    await creative.save();

    // Update user verification status
    await User.findByIdAndUpdate(creative.user, { isVerified: true });

    res.json({
      success: true,
      message: 'Creative verified successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.rejectVerification = async (req, res) => {
  try {
    const { queueId } = req.params;
    const { rejectionReason, notes } = req.body;
    
    // Find verification queue item
    const queueItem = await VerificationQueue.findById(queueId)
      .populate('creative');
    
    if (!queueItem) {
      return res.status(404).json({ message: 'Verification queue item not found' });
    }

    if (queueItem.status !== 'pending') {
      return res.status(400).json({ message: 'Already processed' });
    }

    // Update queue item
    queueItem.status = 'rejected';
    queueItem.reviewedBy = req.user.id;
    queueItem.reviewedAt = new Date();
    queueItem.rejectionReason = rejectionReason;
    queueItem.notes = notes;
    await queueItem.save();

    res.json({
      success: true,
      message: 'Verification rejected successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      role, 
      verified, 
      subscription,
      search,
      sortBy = 'createdAt',
      sortOrder = -1
    } = req.query;
    
    const query = {};
    
    if (role) query.role = role;
    if (verified !== undefined) query.isVerified = verified === 'true';
    if (subscription) query.subscription = subscription;
    
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { _id: search } // Allow searching by ID
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort);

    // Get profiles for users
    const usersWithProfiles = await Promise.all(users.map(async (user) => {
      let profile = null;
      
      if (user.role === 'creative') {
        profile = await Creative.findOne({ user: user._id });
      } else if (user.role === 'client') {
        profile = await Client.findOne({ user: user._id });
      }
      
      return {
        ...user.toObject(),
        profile
      };
    }));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users: usersWithProfiles,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.verifyUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Toggle verification
    user.isVerified = !user.isVerified;
    
    // If user is creative, update creative profile too
    if (user.role === 'creative') {
      const creative = await Creative.findOne({ user: id });
      if (creative) {
        creative.verification.isVerified = user.isVerified;
        creative.verification.verifiedBy = req.user.id;
        creative.verification.verifiedAt = new Date();
        await creative.save();
      }
    }

    await user.save();

    res.json({
      success: true,
      message: `User ${user.isVerified ? 'verified' : 'unverified'} successfully`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      status,
      category,
      county,
      sortBy = 'createdAt',
      sortOrder = -1
    } = req.query;
    
    const query = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (county) query['location.county'] = county;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const requests = await Request.find(query)
      .populate('client', 'displayName email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort);

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

exports.getAllProposals = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      status,
      sortBy = 'metadata.submittedAt',
      sortOrder = -1
    } = req.query;
    
    const query = {};
    
    if (status) query.status = status;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const proposals = await Proposal.find(query)
      .populate('creative', 'displayName')
      .populate('request', 'title client')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort);

    const total = await Proposal.countDocuments(query);

    res.json({
      success: true,
      proposals,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllSubscriptions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      status,
      plan,
      sortBy = 'createdAt',
      sortOrder = -1
    } = req.query;
    
    const query = {};
    
    if (status) query.status = status;
    if (plan) query.plan = plan;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const subscriptions = await Subscription.find(query)
      .populate('user', 'email role')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort);

    const total = await Subscription.countDocuments(query);

    // Calculate revenue stats
    const revenueStats = await Subscription.aggregate([
      { $match: { 'payment.status': 'success', plan: { $ne: 'free' } } },
      { $group: {
        _id: null,
        totalRevenue: { $sum: '$payment.amount' },
        averageRevenue: { $avg: '$payment.amount' },
        count: { $sum: 1 }
      }}
    ]);

    res.json({
      success: true,
      subscriptions,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      revenueStats: revenueStats[0] || { totalRevenue: 0, averageRevenue: 0, count: 0 }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let days;
    switch (period) {
      case '7d': days = 7; break;
      case '30d': days = 30; break;
      case '90d': days = 90; break;
      case '365d': days = 365; break;
      default: days = 30;
    }

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // User growth
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: {
        _id: { 
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Request growth
    const requestGrowth = await Request.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: {
        _id: { 
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Proposal growth
    const proposalGrowth = await Proposal.aggregate([
      { $match: { 'metadata.submittedAt': { $gte: startDate } } },
      { $group: {
        _id: { 
          year: { $year: '$metadata.submittedAt' },
          month: { $month: '$metadata.submittedAt' },
          day: { $dayOfMonth: '$metadata.submittedAt' }
        },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Category distribution
    const categoryDistribution = await Request.aggregate([
      { $group: {
        _id: '$category',
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } }
    ]);

    // Location distribution
    const locationDistribution = await Request.aggregate([
      { $match: { 'location.county': { $exists: true, $ne: null } } },
      { $group: {
        _id: '$location.county',
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Subscription distribution
    const subscriptionDistribution = await User.aggregate([
      { $group: {
        _id: '$subscription',
        count: { $sum: 1 }
      }}
    ]);

    // Proposal success rate
    const proposalStats = await Proposal.aggregate([
      { $group: {
        _id: '$status',
        count: { $sum: 1 }
      }}
    ]);

    const analytics = {
      userGrowth,
      requestGrowth,
      proposalGrowth,
      categoryDistribution,
      locationDistribution,
      subscriptionDistribution,
      proposalStats
    };

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};