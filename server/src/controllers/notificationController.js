import Notification from '../models/Notification.js';

/**
 * @desc    Get user notifications (latest 30)
 * @route   GET /api/notifications
 * @access  Private
 */
export const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name profilePicture')
      .sort('-createdAt')
      .limit(30);

    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark ALL notifications as read
 * @route   PUT /api/notifications/read
 * @access  Private
 */
export const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a single notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
export const markOneRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (!notification) {
      res.status(404);
      throw new Error('Notification not found');
    }

    notification.isRead = true;
    await notification.save();
    res.json({ success: true, id: notification._id });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete ALL notifications for current user
 * @route   DELETE /api/notifications
 * @access  Private
 */
export const deleteAllNotifications = async (req, res, next) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });
    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    next(error);
  }
};
