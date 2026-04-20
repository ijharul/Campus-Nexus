import User from '../models/User.js';
import College from '../models/College.js';
import Donation from '../models/Donation.js';

// Plan pricing in INR for revenue estimates (Mapped to the new planName field)
const PLAN_PRICE = { none: 0, Free: 0, Monthly: 199, Yearly: 1499 };
// Initial tokens per plan
const PLAN_TOKENS = { none: 50, Free: 50, Monthly: 300, Yearly: 1000 };

/**
 * @desc    Platform analytics for superAdmin
 * @route   GET /api/analytics
 * @access  Private/superAdmin
 */
export const getPlatformAnalytics = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfWeek  = new Date(now); startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now); startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0);
    const startOfYear  = new Date(now.getFullYear(), 0, 1);

    const [
      totalUsers,
      totalColleges,
      allUsers,
      weeklySignups,
      monthlySignups,
      totalDonationAmount,
      donationsPerCollege,
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'superAdmin' } }),
      College.countDocuments(),
      User.find({ role: { $ne: 'superAdmin' } }).select('planName tokens role createdAt pendingCollege'),
      User.countDocuments({ role: { $ne: 'superAdmin' }, createdAt: { $gte: startOfWeek } }),
      User.countDocuments({ role: { $ne: 'superAdmin' }, createdAt: { $gte: startOfMonth } }),
      Donation.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      Donation.aggregate([
        { $group: { _id: '$collegeId', total: { $sum: '$amount' } } },
        { $lookup: { from: 'colleges', localField: '_id', foreignField: '_id', as: 'college' } },
        { $unwind: '$college' },
        { $project: { name: '$college.name', total: 1 } },
      ]),
    ]);

    // Revenue estimate from current plan distribution
    const calcRevenue = (users) =>
      users.reduce((sum, u) => sum + (PLAN_PRICE[u.planName] || 0), 0);

    const weeklyUsers  = allUsers.filter(u => u.createdAt >= startOfWeek);
    const monthlyUsers = allUsers.filter(u => u.createdAt >= startOfMonth);
    const yearlyUsers  = allUsers.filter(u => u.createdAt >= startOfYear);

    // AI token usage = sum of (initial tokens based on plan) - remaining
    const totalTokensConsumed = allUsers.reduce((sum, u) => {
      const initial = PLAN_TOKENS[u.planName] || 50;
      return sum + Math.max(0, initial - (u.tokens ?? 0));
    }, 0);

    // Role breakdown
    const roleBreakdown = {
      students: allUsers.filter(u => u.role === 'student').length,
      alumni:   allUsers.filter(u => u.role === 'alumni').length,
      admins:   allUsers.filter(u => u.role === 'collegeAdmin').length,
    };

    // Plan breakdown
    const planBreakdown = {
      none:    allUsers.filter(u => u.planName === 'none').length,
      free:    allUsers.filter(u => u.planName === 'Free').length,
      monthly: allUsers.filter(u => u.planName === 'Monthly').length,
      yearly:  allUsers.filter(u => u.planName === 'Yearly').length,
    };

    // Users with pending colleges (not in system)
    const pendingCollegeUsers = allUsers.filter(u => u.pendingCollege).length;

    res.json({
      users: {
        total: totalUsers,
        weekly: weeklySignups,
        monthly: monthlySignups,
        roleBreakdown,
        planBreakdown,
        pendingCollegeUsers,
      },
      colleges: {
        total: totalColleges,
      },
      revenue: {
        weekly:  calcRevenue(weeklyUsers),
        monthly: calcRevenue(monthlyUsers),
        yearly:  calcRevenue(yearlyUsers),
        allTime: calcRevenue(allUsers),
      },
      donations: {
        total: totalDonationAmount[0]?.total || 0,
        perCollege: donationsPerCollege,
      },
      ai: {
        totalTokensConsumed,
        totalTokensRemaining: allUsers.reduce((s, u) => s + (u.tokens ?? 0), 0),
      },
    });
  } catch (error) {
    next(error);
  }
};
