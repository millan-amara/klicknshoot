const Request = require('../models/request');
const User = require('../models/user');
const Proposal = require('../models/proposal');
const Client = require('../models/client');

exports.getRequests = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      county,
      city,
      category,
      serviceType,
      minBudget,
      maxBudget,
      status = 'open',
      search,
      sortBy = 'createdAt',
      sortOrder = -1
    } = req.query;

    const query = { status };

    // Location filters
    if (county) query['location.county'] = county;
    if (city) query['location.city'] = { $regex: city, $options: 'i' };

    // Category and service filters
    if (category) query.category = category;
    if (serviceType) query.serviceType = serviceType;

    // Budget filters
    if (minBudget || maxBudget) {
      query['budget.min'] = {};
      if (minBudget) query['budget.min'].$gte = parseInt(minBudget);
      if (maxBudget) query['budget.min'].$lte = parseInt(maxBudget);
    }

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const requests = await Request.find(query)
      .populate('client', 'displayName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort);

    // Increment views
    requests.forEach(request => {
      request.metadata.views += 1;
      request.save();
    });

    const total = await Request.countDocuments(query);

    // Get user's subscription to check if they can see budgets
    const user = req.user ? await User.findById(req.user.id) : null;
    const canSeeBudget = user ? user.getLimits().canSeeBudget : false;

    // Hide budget if user cannot see it
    const requestsWithBudget = requests.map(request => {
      const requestObj = request.toObject();
      if (!canSeeBudget && user?.role !== 'admin') {
        requestObj.budget = { currency: 'KES' }; // Hide min/max
      }
      return requestObj;
    });

    res.json({
      success: true,
      requests: requestsWithBudget,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      canSeeBudget
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getFeaturedRequests = async (req, res) => {
  try {
    const featuredRequests = await Request.find({
      status: 'open',
      proposalCount: { $lt: 5 }
    })
    .populate('client', 'displayName')
    .limit(10)
    .sort({ 'metadata.views': -1, createdAt: -1 });

    res.json({
      success: true,
      requests: featuredRequests
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('client', 'displayName company')
      .populate('proposals.creative', 'displayName verification.isVerified rating.average');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Increment views
    request.metadata.views += 1;
    await request.save();

    // Check if user can see budget
    const user = req.user ? await User.findById(req.user.id) : null;
    const canSeeBudget = user ? user.getLimits().canSeeBudget : false;
    
    const requestObj = request.toObject();
    if (!canSeeBudget && user?.role !== 'admin' && user?.id !== request.client._id.toString()) {
      requestObj.budget = { currency: 'KES' }; // Hide min/max
    }

    res.json({
      success: true,
      request: requestObj
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createRequest = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const client = await Client.findOne({ user: req.user.id });

    if (!client) {
      return res.status(400).json({ message: 'Client profile not found' });
    }

    // Check request limits based on subscription
    const limits = user.getLimits();
    const activeRequests = await Request.countDocuments({
      client: req.user.id,
      status: { $in: ['open', 'reviewing'] }
    });

    if (activeRequests >= limits.activeRequests) {
      return res.status(400).json({
        message: `You have reached your limit of ${limits.activeRequests} active requests. Upgrade your subscription to post more.`
      });
    }

    const requestData = {
      ...req.body,
      client: req.user.id
    };

    const request = new Request(requestData);
    await request.save();

    // Update client stats
    client.stats.totalRequests += 1;
    await client.save();

    res.status(201).json({
      success: true,
      request,
      message: 'Request created successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if request exists
    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if requester is authorized
    if (req.user.id !== request.client.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if request can be updated (not if it has accepted proposals)
    if (request.proposals.some(p => p.status === 'accepted')) {
      return res.status(400).json({ 
        message: 'Cannot update request with accepted proposals' 
      });
    }

    const updates = req.body;
    
    // Don't allow changing client
    delete updates.client;

    const updatedRequest = await Request.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('client', 'displayName');

    res.json({
      success: true,
      request: updatedRequest,
      message: 'Request updated successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if request exists
    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if requester is authorized
    if (req.user.id !== request.client.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if request can be deleted
    if (request.proposals.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete request with existing proposals' 
      });
    }

    await request.deleteOne();

    res.json({
      success: true,
      message: 'Request deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.closeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if request exists
    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if requester is authorized
    if (req.user.id !== request.client.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    request.status = 'closed';
    await request.save();

    res.json({
      success: true,
      message: 'Request closed successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.reopenRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if request exists
    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if requester is authorized
    if (req.user.id !== request.client.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if request can be reopened
    if (request.proposalCount >= 5) {
      return res.status(400).json({ 
        message: 'Cannot reopen request with maximum proposals' 
      });
    }

    request.status = 'open';
    await request.save();

    res.json({
      success: true,
      message: 'Request reopened successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getRequestProposals = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if request exists
    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if requester is authorized (client or admin)
    if (req.user.id !== request.client.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const proposals = await Proposal.find({ request: id })
      .populate('creative', 'displayName phoneNumber verification.isVerified rating.average portfolio');

    // Mark proposals as viewed by client
    proposals.forEach(async (proposal) => {
      if (!proposal.clientViewed) {
        proposal.clientViewed = true;
        proposal.metadata.viewedAt = new Date();
        await proposal.save();
      }
    });

    res.json({
      success: true,
      proposals
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};