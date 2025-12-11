const User = require('../models/user');

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if requester is authorized (own profile or admin)
    if (req.user.id !== user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if requester is authorized (own profile or admin)
    if (req.user.id !== user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update allowed fields
    const allowedUpdates = ['subscription', 'isVerified', 'profileComplete'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow self-deletion for admin
    if (req.user.id === user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if requester is authorized
    if (req.user.id !== user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    let stats = {};
    
    if (user.role === 'creative') {
      const Creative = require('../models/creative');
      const Proposal = require('../models/proposal');
      
      const creativeProfile = await Creative.findOne({ user: user._id });
      const proposals = await Proposal.find({ creative: user._id });
      
      const acceptedProposals = proposals.filter(p => p.status === 'accepted').length;
      const pendingProposals = proposals.filter(p => p.status === 'pending').length;
      
      stats = {
        profileViews: creativeProfile?.metadata?.profileViews || 0,
        totalProposals: proposals.length,
        acceptedProposals,
        pendingProposals,
        acceptanceRate: proposals.length > 0 ? (acceptedProposals / proposals.length * 100).toFixed(1) : 0,
        portfolioItems: creativeProfile?.portfolio?.length || 0
      };
    } else if (user.role === 'client') {
      const Client = require('../models/client');
      const Request = require('../models/request');
      
      const clientProfile = await Client.findOne({ user: user._id });
      const requests = await Request.find({ client: user._id });
      
      stats = {
        totalRequests: requests.length,
        activeRequests: requests.filter(r => r.status === 'open' || r.status === 'reviewing').length,
        completedProjects: requests.filter(r => r.status === 'completed').length,
        totalBudget: clientProfile?.stats?.totalBudgetSpent || 0
      };
    }

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};