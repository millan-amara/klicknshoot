const Subscription = require('../models/subscription');
const User = require('../models/user');
const Paystack = require('paystack')(process.env.PAYSTACK_SECRET_KEY);
const crypto = require('crypto');

exports.getPlans = (req, res) => {
  const plans = {
    free: {
      name: 'Free',
      price: 0,
      currency: 'KES',
      features: [
        'Basic profile',
        'Standard listing',
        'Email support'
      ],
      limits: {
        proposalsPerMonth: 3,
        activeRequests: 3,
        canSeeBudget: false,
        priority: 'low'
      }
    },
    basic: {
      name: 'Basic',
      price: 500, // KES per month
      currency: 'KES',
      features: [
        'Priority listing',
        'WhatsApp support'
      ],
      limits: {
        proposalsPerMonth: 40,
        activeRequests: 10,
        canSeeBudget: true,
        priority: 'medium'
      }
    },
    pro: {
      name: 'Professional',
      price: 1500, // KES per month
      currency: 'KES',
      features: [
        'Top priority listing',
        'Featured in search',
        '24/7 priority support'
      ],
      limits: {
        proposalsPerMonth: 200,
        activeRequests: 30,
        canSeeBudget: true,
        priority: 'high'
      }
    }
  };

  res.json({
    success: true,
    plans
  });
};

exports.getUserSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      subscriptions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Subscription controller (backend)
exports.createSubscription = async (req, res) => {
  try {
    const { plan, period = 'monthly', autoRenew = true } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user already has an active subscription
    const activeSubscription = await Subscription.findOne({
      user: req.user.id,
      status: 'active',
      endDate: { $gt: new Date() }
    });

    if (activeSubscription && plan !== 'free') {
      return res.status(400).json({
        success: false,
        message: 'You already have an active subscription. Please cancel it first or upgrade.'
      });
    }

    // FREE PLAN: Direct activation without payment
    if (plan === 'free') {
      // Deactivate any existing paid subscriptions
      await Subscription.updateMany(
        { user: req.user.id, plan: { $ne: 'free' } },
        { status: 'cancelled' }
      );

      const subscription = new Subscription({
        user: req.user.id,
        plan: 'free',
        period: 'monthly',
        status: 'active',
        autoRenew: true,
        features: {
          proposalsPerMonth: 10,
          activeRequests: 3,
          canSeeBudget: false,
          priority: 'low',
          verificationBadge: false
        }
      });

      await subscription.save();

      // Update user subscription
      user.subscription = 'free';
      user.subscriptionStatus = 'active';
      await user.save();

      return res.json({
        success: true,
        subscription,
        message: 'Free subscription activated successfully',
        isFree: true
      });
    }

    // PAID PLANS: Create Paystack payment
    const amount = plan === 'basic' ? 50000 : 150000; // in kobo (500 KES = 50000 kobo)
  

    const paystackResponse = await Paystack.transaction.initialize({
      email: user.email,
      amount: amount,
      currency: 'KES',
      reference: `SUB-${Date.now()}-${req.user.id}`,
      callback_url: `${process.env.FRONTEND_URL}/subscription/callback`,
      metadata: {
        userId: req.user.id.toString(),
        plan: plan,
        period: period
      }
    });

    if (!paystackResponse.status) {
      throw new Error(paystackResponse.message || 'Failed to initialize payment');
    }

    // Create pending subscription
    const subscription = new Subscription({
      user: req.user.id,
      plan,
      period,
      status: 'pending',
      autoRenew,
      payment: {
        provider: 'paystack',
        reference: paystackResponse.data.reference,
        amount: amount / 100, // Convert back to KES
        currency: 'KES',
        status: 'pending'
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      }
    });

    await subscription.save();
    console.log(`PAYSTACK: ${paystackResponse.data.authorization_url}`);

    res.json({
      success: true,
      authorization_url: paystackResponse.data.authorization_url,
      reference: paystackResponse.data.reference,
      access_code: paystackResponse.data.access_code,
      subscription,
      message: 'Payment initialized. Redirect to Paystack to complete payment.',
      isFree: false
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// subscriptionController.js - Update paystackWebhook
exports.paystackWebhook = async (req, res) => {
  try {
    // Verify it's from Paystack
    const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');
    
    if (hash !== req.headers['x-paystack-signature']) {
      console.error('Invalid webhook signature');
      return res.status(400).send('Invalid signature');
    }

    const event = req.body;
    console.log('Webhook event received:', event.event, 'Reference:', event.data?.reference);
    
    if (event.event === 'charge.success') {
      const { reference, amount, customer } = event.data;
      
      // Find subscription by reference
      const subscription = await Subscription.findOne({ 
        'payment.reference': reference 
      }).populate('user');

      if (!subscription) {
        console.error('Subscription not found for reference:', reference);
        return res.status(404).json({ message: 'Subscription not found' });
      }

      if (subscription.payment.status === 'success') {
        console.log('Payment already processed for reference:', reference);
        return res.status(200).send('Already processed');
      }

      // Update subscription payment
      subscription.payment.status = 'success';
      subscription.payment.transactionId = event.data.id;
      subscription.payment.paidAt = new Date();
      subscription.status = 'active';
      
      // Set end date based on period
      const endDate = new Date();
      switch (subscription.period) {
        case 'monthly':
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case 'quarterly':
          endDate.setMonth(endDate.getMonth() + 3);
          break;
        case 'yearly':
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
      }
      subscription.endDate = endDate;
      
      // Update features
      subscription.features = subscription.getFeatures();
      
      await subscription.save();

      // Update user subscription
      const user = subscription.user;
      user.subscription = subscription.plan;
      user.subscriptionStatus = 'active';
      user.subscriptionExpiry = subscription.endDate;
      await user.save();

      console.log(`✅ Subscription ${subscription._id} activated for user ${user._id}, Plan: ${subscription.plan}`);
    } else if (event.event === 'charge.failed') {
      const { reference } = event.data;
      
      // Update subscription to failed status
      const subscription = await Subscription.findOne({ 
        'payment.reference': reference 
      });
      
      if (subscription) {
        subscription.payment.status = 'failed';
        subscription.status = 'pending';
        await subscription.save();
        console.log(`❌ Payment failed for subscription ${subscription._id}`);
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Paystack webhook error:', error);
    res.status(500).send('Webhook error');
  }
};


// subscriptionController.js - SIMPLIFIED verifyPayment
exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment reference is required' 
      });
    }

    // Check if subscription exists and is paid
    const subscription = await Subscription.findOne({
      'payment.reference': reference
    }).populate('user');

    if (!subscription) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subscription not found' 
      });
    }

    // Return current status
    res.json({
      success: subscription.payment.status === 'success',
      status: subscription.payment.status,
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        isActive: subscription.isActive()
      },
      message: subscription.payment.status === 'success' 
        ? 'Payment verified' 
        : 'Payment pending'
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};


exports.cancelSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if subscription exists
    const subscription = await Subscription.findById(id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Check if requester is authorized
    if (req.user.id !== subscription.user.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if subscription can be cancelled
    if (subscription.plan === 'free') {
      return res.status(400).json({ 
        message: 'Free subscription cannot be cancelled' 
      });
    }

    if (subscription.status !== 'active') {
      return res.status(400).json({ 
        message: 'Subscription is not active' 
      });
    }

    // Update subscription
    subscription.status = 'cancelled';
    subscription.autoRenew = false;
    await subscription.save();

    // Update user subscription to free after expiry
    const user = await User.findById(subscription.user);
    user.subscriptionStatus = 'cancelled';
    await user.save();

    res.json({
      success: true,
      message: 'Subscription cancelled successfully. You can continue using premium features until the end of your billing period.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.upgradeSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPlan, period = 'monthly' } = req.body;
    
    // Check if subscription exists
    const subscription = await Subscription.findById(id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Check if requester is authorized
    if (req.user.id !== subscription.user.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if it's actually an upgrade
    const planHierarchy = { free: 0, basic: 1, pro: 2 };
    if (planHierarchy[newPlan] <= planHierarchy[subscription.plan]) {
      return res.status(400).json({ 
        message: 'New plan must be higher than current plan' 
      });
    }

    // Calculate prorated amount
    const planPrices = { basic: 500, pro: 1500 };
    const daysUsed = Math.floor((new Date() - subscription.startDate) / (1000 * 60 * 60 * 24));
    const daysInPeriod = subscription.period === 'monthly' ? 30 : 
                        subscription.period === 'quarterly' ? 90 : 365;
    
    const unusedAmount = (planPrices[subscription.plan] * (daysInPeriod - daysUsed)) / daysInPeriod;
    const newPlanPrice = planPrices[newPlan];
    const amountToPay = Math.max(0, newPlanPrice - unusedAmount);

    if (amountToPay === 0) {
      // Free upgrade (unlikely but possible)
      subscription.plan = newPlan;
      subscription.period = period;
      await subscription.save();

      // Update user
      const user = await User.findById(subscription.user);
      user.subscription = newPlan;
      await user.save();

      return res.json({
        success: true,
        message: 'Subscription upgraded successfully'
      });
    }

    // Create Paystack transaction for upgrade difference
    const paystackResponse = await Paystack.transaction.initialize({
      email: req.user.email,
      amount: amountToPay * 100, // Convert to kobo
      currency: 'KES',
      reference: `UPG-${Date.now()}-${req.user.id}`,
      callback_url: `${process.env.FRONTEND_URL}/subscription/upgrade-callback`,
      metadata: {
        userId: req.user.id,
        subscriptionId: id,
        newPlan,
        period,
        upgrade: true
      }
    });

    if (!paystackResponse.status) {
      throw new Error('Failed to initialize payment');
    }

    res.json({
      success: true,
      authorization_url: paystackResponse.data.authorization_url,
      reference: paystackResponse.data.reference,
      message: 'Payment initialized for upgrade. Redirect to Paystack to complete payment.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getSubscriptionLimits = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if subscription exists
    const subscription = await Subscription.findById(id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Check if requester is authorized
    if (req.user.id !== subscription.user.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Get usage stats
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const Proposal = require('../models/proposal');
    const Request = require('../models/request');

    const monthlyProposals = await Proposal.countDocuments({
      creative: req.user.id,
      'metadata.submittedAt': { $gte: currentMonth }
    });

    const activeRequests = await Request.countDocuments({
      client: req.user.id,
      status: { $in: ['open', 'reviewing'] }
    });

    const limits = {
      ...subscription.features,
      usage: {
        proposals: {
          used: monthlyProposals,
          remaining: Math.max(0, subscription.features.proposalsPerMonth - monthlyProposals),
          limit: subscription.features.proposalsPerMonth
        },
        requests: {
          used: activeRequests,
          remaining: Math.max(0, subscription.features.activeRequests - activeRequests),
          limit: subscription.features.activeRequests
        }
      },
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        endDate: subscription.endDate,
        autoRenew: subscription.autoRenew
      }
    };

    res.json({
      success: true,
      limits
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};