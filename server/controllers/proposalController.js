const Proposal = require('../models/proposal');
const Request = require('../models/request');
const User = require('../models/user');
const Creative = require('../models/creative');

exports.submitProposal = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const creative = await Creative.findOne({ user: req.user.id });

    if (!creative) {
      return res.status(400).json({ message: 'Creative profile not found' });
    }

    const { request: requestId, message, quote, timeline, portfolioLinks } = req.body;

    // Check if request exists
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if request is open
    if (request.status !== 'open') {
      return res.status(400).json({ 
        message: 'Request is not accepting proposals' 
      });
    }

    // Check if creative has already submitted a proposal
    const existingProposal = await Proposal.findOne({
      request: requestId,
      creative: req.user.id
    });

    if (existingProposal) {
      return res.status(400).json({ 
        message: 'You have already submitted a proposal for this request' 
      });
    }

    // Check proposal limits based on subscription
    const limits = user.getLimits();
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyProposals = await Proposal.countDocuments({
      creative: req.user.id,
      'metadata.submittedAt': { $gte: currentMonth }
    });

    if (monthlyProposals >= limits.proposalsPerMonth) {
      return res.status(400).json({
        message: `You have reached your monthly proposal limit of ${limits.proposalsPerMonth}. Upgrade your subscription to submit more proposals.`
      });
    }

    // Check if request has reached max proposals (5)
    if (request.proposalCount >= 5) {
      return res.status(400).json({ 
        message: 'This request has reached the maximum number of proposals' 
      });
    }

    // Create proposal
    const proposal = new Proposal({
      request: requestId,
      creative: req.user.id,
      message,
      quote,
      timeline,
      portfolioLinks,
      whatsappContact: {
        phoneNumber: creative.phoneNumber
      }
    });

    await proposal.save();

    // Update creative stats
    creative.stats.totalProposals += 1;
    await creative.save();

    res.status(201).json({
      success: true,
      proposal,
      message: 'Proposal submitted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getProposalById = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate('request', 'title category client')
      .populate('creative', 'displayName phoneNumber verification.isVerified');

    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    // Check if requester is authorized
    const isCreative = proposal.creative._id.toString() === req.user.id;
    const isClient = proposal.request.client.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isCreative && !isClient && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      success: true,
      proposal
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProposal = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if proposal exists
    const proposal = await Proposal.findById(id);
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    // Check if requester is authorized
    if (req.user.id !== proposal.creative.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if proposal can be updated
    if (proposal.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Cannot update a proposal that has been accepted, rejected, or withdrawn' 
      });
    }

    const updates = req.body;
    
    // Don't allow changing request or creative
    delete updates.request;
    delete updates.creative;

    const updatedProposal = await Proposal.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      proposal: updatedProposal,
      message: 'Proposal updated successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.acceptProposal = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if proposal exists
    const proposal = await Proposal.findById(id)
      .populate('request');
    
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    // Check if requester is authorized (client of the request)
    if (req.user.id !== proposal.request.client.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if proposal can be accepted
    if (proposal.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Proposal has already been processed' 
      });
    }

    // Update proposal status
    proposal.status = 'accepted';
    proposal.metadata.respondedAt = new Date();
    await proposal.save();

    // Update request status and proposals
    const request = await Request.findById(proposal.request._id);
    
    // Update the specific proposal in request
    const proposalIndex = request.proposals.findIndex(
      p => p.proposalId.toString() === id
    );
    
    if (proposalIndex !== -1) {
      request.proposals[proposalIndex].status = 'accepted';
    }

    // Close the request since a proposal has been accepted
    request.status = 'closed';
    await request.save();

    // Reject all other proposals for this request
    await Proposal.updateMany(
      {
        request: proposal.request._id,
        _id: { $ne: id },
        status: 'pending'
      },
      {
        status: 'rejected',
        'metadata.respondedAt': new Date()
      }
    );

    res.json({
      success: true,
      message: 'Proposal accepted successfully',
      whatsappLink: generateWhatsAppLink(proposal)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.rejectProposal = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if proposal exists
    const proposal = await Proposal.findById(id)
      .populate('request');
    
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    // Check if requester is authorized (client of the request)
    if (req.user.id !== proposal.request.client.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if proposal can be rejected
    if (proposal.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Proposal has already been processed' 
      });
    }

    // Update proposal status
    proposal.status = 'rejected';
    proposal.metadata.respondedAt = new Date();
    await proposal.save();

    // Update request proposals
    const request = await Request.findById(proposal.request._id);
    
    const proposalIndex = request.proposals.findIndex(
      p => p.proposalId.toString() === id
    );
    
    if (proposalIndex !== -1) {
      request.proposals[proposalIndex].status = 'rejected';
      await request.save();
    }

    res.json({
      success: true,
      message: 'Proposal rejected successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.withdrawProposal = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if proposal exists
    const proposal = await Proposal.findById(id);
    
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    // Check if requester is authorized
    if (req.user.id !== proposal.creative.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if proposal can be withdrawn
    if (proposal.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Cannot withdraw a proposal that has been accepted or rejected' 
      });
    }

    // Update proposal status
    proposal.status = 'withdrawn';
    await proposal.save();

    // Remove from request proposals
    const request = await Request.findById(proposal.request);
    request.proposals = request.proposals.filter(
      p => p.proposalId.toString() !== id
    );
    await request.save();

    res.json({
      success: true,
      message: 'Proposal withdrawn successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.generateWhatsAppLink = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if proposal exists
    const proposal = await Proposal.findById(id)
      .populate('request', 'title')
      .populate('creative', 'displayName phoneNumber');
    
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    // Check if requester is authorized (client of the request)
    if (req.user.id !== proposal.request.client.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if proposal has been accepted
    if (proposal.status !== 'accepted') {
      return res.status(400).json({ 
        message: 'You can only contact creatives for accepted proposals' 
      });
    }

    // Generate WhatsApp message
    const message = `Hello ${proposal.creative.displayName},\n\n` +
                   `I'm interested in your proposal for "${proposal.request.title}". ` +
                   `Let's discuss the details on WhatsApp.\n\n` +
                   `Best regards,\n` +
                   `FrameFinder Kenya Client`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappLink = `https://wa.me/${proposal.creative.phoneNumber.replace('+', '')}?text=${encodedMessage}`;

    // Update proposal whatsapp contact
    proposal.whatsappContact.messageSent = true;
    proposal.whatsappContact.sentAt = new Date();
    await proposal.save();

    res.json({
      success: true,
      whatsappLink,
      phoneNumber: proposal.creative.phoneNumber
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

function generateWhatsAppLink(proposal) {
  const message = `Hello, I have accepted your proposal for the "${proposal.request.title}" project. ` +
                 `Please contact me to discuss the next steps.`;
  
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${proposal.whatsappContact.phoneNumber.replace('+', '')}?text=${encodedMessage}`;
}