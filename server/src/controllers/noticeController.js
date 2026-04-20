import Notice from '../models/Notice.js';

/**
 * @desc    Get all notices for the requester's college
 * @route   GET /api/notices
 * @access  Private
 */
export const getNotices = async (req, res, next) => {
  try {
    const query = { collegeId: req.user.collegeId };
    const notices = await Notice.find(query).sort('-createdAt').limit(20);
    res.json(notices);
  } catch (error) { next(error); }
};

/**
 * @desc    Create a new notice
 * @route   POST /api/notices
 * @access  Private (Alumni, College Admin, Super Admin)
 */
export const createNotice = async (req, res, next) => {
  try {
    const { title, content, type, externalLink } = req.body;

    if (!title || !content) {
      res.status(400);
      throw new Error('Title and Content are required');
    }

    const notice = await Notice.create({
      title,
      content,
      type,
      externalLink,
      authorId: req.user._id,
      authorName: req.user.name,
      authorRole: req.user.role,
      collegeId: req.user.collegeId,
    });

    res.status(201).json(notice);
  } catch (error) { next(error); }
};

/**
 * @desc    Delete a notice
 * @route   DELETE /api/notices/:id
 * @access  Private (Author or Admin)
 */
export const deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      res.status(404);
      throw new Error('Notice not found');
    }

    // Only author or college/super admin can delete
    const isAuthor = notice.authorId.toString() === req.user._id.toString();
    const isAdmin = ['collegeAdmin', 'superAdmin'].includes(req.user.role);

    if (!isAuthor && !isAdmin) {
      res.status(403);
      throw new Error('Not authorized to delete this notice');
    }

    await notice.deleteOne();
    res.json({ message: 'Notice removed' });
  } catch (error) { next(error); }
};
