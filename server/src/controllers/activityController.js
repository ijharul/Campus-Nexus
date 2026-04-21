import ActivityLog from '../models/ActivityLog.js';

/**
 * @desc    Get the logged-in user's weekly activity breakdown
 * @route   GET /api/activity/weekly
 * @access  Private
 */
export const getWeeklyActivity = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Build 7-day window (start of today minus 6 days)
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const logs = await ActivityLog.find({
      user: userId,
      createdAt: { $gte: sevenDaysAgo },
    }).select('action createdAt');

    // Aggregate totals
    const totals = { chats: 0, applications: 0, mentorships: 0 };

    logs.forEach((log) => {
      if (log.action === 'chat_message')       totals.chats++;
      if (log.action === 'referral_request' || log.action === 'application') totals.applications++;
      if (log.action === 'mentorship_request') totals.mentorships++;
    });

    // Build daily breakdown (last 7 days)
    const dailyBreakdown = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(day.getDate() - i);
      const dayStr = day.toISOString().split('T')[0];

      const dayLogs = logs.filter((log) => {
        const logDay = new Date(log.createdAt).toISOString().split('T')[0];
        return logDay === dayStr;
      });

      dailyBreakdown.push({
        date: dayStr,
        label: day.toLocaleDateString('en-US', { weekday: 'short' }),
        chats: dayLogs.filter((l) => l.action === 'chat_message').length,
        applications: dayLogs.filter((l) => l.action === 'referral_request' || l.action === 'application').length,
        mentorships: dayLogs.filter((l) => l.action === 'mentorship_request').length,
        total: dayLogs.length,
      });
    }

    res.json({
      ...totals,
      dailyBreakdown,
    });
  } catch (error) {
    next(error);
  }
};
