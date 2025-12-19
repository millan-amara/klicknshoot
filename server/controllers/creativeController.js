const Creative = require('../models/creative');
const User = require('../models/user');
const VerificationQueue = require('../models/verificationqueue');
const Proposal = require('../models/proposal');

exports.getCreatives = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      county,
      city,
      services,
      verified,
      minRating,
      search
    } = req.query;

    const query = { isActive: true };

    // Location filters
    if (city) query['location.city'] = { $regex: city, $options: 'i' };

    // Service filters
    if (services) {
      const serviceArray = services.split(',');
      query.services = { $in: serviceArray };
    }

    // Verification filter
    if (verified === 'true') {
      query['verification.isVerified'] = true;
    }

    // Rating filter
    if (minRating) {
      query['rating.average'] = { $gte: parseFloat(minRating) };
    }

    // Search filter
    if (search) {
      query.$or = [
        { displayName: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }

    const creatives = await Creative.find(query)
      .populate('user', 'email subscription')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ 
        'verification.isVerified': -1,
        'rating.average': -1,
        'rating.count': -1 
      });

    // Increment profile views
    creatives.forEach(creative => {
      creative.metadata.profileViews += 1;
      creative.save();
    });

    const total = await Creative.countDocuments(query);

    res.json({
      success: true,
      creatives,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getFeaturedCreatives = async (req, res) => {
  try {
    const featuredCreatives = await Creative.find({
      isActive: true,
      'verification.isVerified': true,
      'rating.average': { $gte: 4 },
      'rating.count': { $gte: 3 }
    })
    .populate('user', 'email subscription')
    .limit(10)
    .sort({ 'rating.average': -1, 'stats.completedProjects': -1 });

    res.json({
      success: true,
      creatives: featuredCreatives
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCreativeById = async (req, res) => {
  try {
    const creative = await Creative.findById(req.params.id)
      .populate('user', 'email subscription');

    if (!creative) {
      return res.status(404).json({ message: 'Creative not found' });
    }

    // Increment profile view
    creative.metadata.profileViews += 1;
    creative.metadata.lastActive = new Date();
    await creative.save();

    // Get user's active proposals count
    const proposals = await Proposal.countDocuments({
      creative: creative.user._id,
      status: 'pending'
    });

    res.json({
      success: true,
      creative: {
        ...creative.toObject(),
        activeProposals: proposals
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// creativeController.js
exports.getCreativeByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('Looking for creative with user ID:', userId);
    
    // Find creative by user reference
    const creative = await Creative.findOne({ user: userId })
      .populate('user', 'email subscription subscriptionStatus');
    
    if (!creative) {
      return res.status(404).json({ 
        success: false, 
        message: 'Creative profile not found' 
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
      creative
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateCreative = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if creative exists
    const creative = await Creative.findById(id);
    if (!creative) {
      return res.status(404).json({ message: 'Creative not found' });
    }

    // Check if requester is authorized
    if (req.user.id !== creative.user.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updates = req.body;
    
    // Update basic info
    if (updates.firstName || updates.lastName) {
      updates.displayName = `${updates.firstName || creative.firstName} ${updates.lastName || creative.lastName}`;
    }

    // Update verification status if admin
    if (req.user.role === 'admin' && updates.verification !== undefined) {
      if (updates.verification.isVerified === true) {
        updates.verification.verifiedBy = req.user.id;
        updates.verification.verifiedAt = new Date();
      }
    }

    const updatedCreative = await Creative.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('user', 'email subscription');

    // Update user profileComplete status
    if (updates.bio || updates.services || updates.portfolio) {
      await User.findByIdAndUpdate(creative.user, { profileComplete: true });
    }

    res.json({
      success: true,
      creative: updatedCreative
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addPortfolioItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, mediaType } = req.body;
    
    // Check if creative exists
    const creative = await Creative.findById(id);
    if (!creative) {
      return res.status(404).json({ message: 'Creative not found' });
    }

    // Check if requester is authorized
    if (req.user.id !== creative.user.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // In production, you'd upload to Cloudinary/S3 and get URL
    const portfolioItem = {
      title,
      description,
      mediaType,
      url: req.file ? `/uploads/${req.file.filename}` : req.body.url,
      thumbnail: req.body.thumbnail || `/uploads/${req.file.filename}`,
      uploadedAt: new Date()
    };

    creative.portfolio.push(portfolioItem);
    await creative.save();

    // Update user profileComplete status
    await User.findByIdAndUpdate(creative.user, { profileComplete: true });

    res.json({
      success: true,
      portfolioItem,
      message: 'Portfolio item added successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.removePortfolioItem = async (req, res) => {
  try {
    const { id, itemId } = req.params;
    
    // Check if creative exists
    const creative = await Creative.findById(id);
    if (!creative) {
      return res.status(404).json({ message: 'Creative not found' });
    }

    // Check if requester is authorized
    if (req.user.id !== creative.user.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Remove portfolio item
    creative.portfolio = creative.portfolio.filter(item => 
      item._id.toString() !== itemId
    );

    await creative.save();

    res.json({
      success: true,
      message: 'Portfolio item removed successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.submitForVerification = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if creative exists
    const creative = await Creative.findById(id);
    if (!creative) {
      return res.status(404).json({ message: 'Creative not found' });
    }

    // Check if requester is authorized
    if (req.user.id !== creative.user.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if already verified
    if (creative.verification.isVerified) {
      return res.status(400).json({ message: 'Already verified' });
    }

    // Check if already in queue
    const existingQueue = await VerificationQueue.findOne({ creative: id });
    if (existingQueue) {
      return res.status(400).json({ message: 'Already in verification queue' });
    }

    // Create verification queue entry
    const verificationQueue = new VerificationQueue({
      creative: id,
      user: creative.user,
      socialLinks: Object.entries(creative.socialLinks || {})
        .filter(([_, url]) => url)
        .map(([platform, url]) => ({
          platform,
          url,
          verified: false
        })),
      status: 'pending',
      priority: creative.rating.count >= 5 ? 3 : 1
    });

    await verificationQueue.save();

    res.json({
      success: true,
      message: 'Submitted for verification. Our team will review your profile.',
      queueId: verificationQueue._id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCreativeProposals = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, page = 1, limit = 20 } = req.query;
    
    // Check if creative exists
    const creative = await Creative.findById(id);
    if (!creative) {
      return res.status(404).json({ message: 'Creative not found' });
    }

    // Check if requester is authorized
    if (req.user.id !== creative.user.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const query = { creative: creative.user._id };
    if (status) query.status = status;

    const proposals = await Proposal.find(query)
      .populate('request', 'title category status')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ 'metadata.submittedAt': -1 });

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