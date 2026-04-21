import PlacementDrive from '../models/PlacementDrive.js';
import User from '../models/User.js';
import { createNotify } from '../utils/notification.js';

/**
 * @desc    Create new placement drive
 * @route   POST /api/drives
 * @access  Private/collegeAdmin
 */
export const createDrive = async (req, res, next) => {
  try {
    const { companyName, role, description, eligibility, deadline } = req.body;

    const drive = await PlacementDrive.create({
      companyName,
      role,
      description,
      eligibility,
      deadline,
      createdBy: req.user._id,
      collegeId: req.user.collegeId,
    });

    res.status(201).json(drive);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all drives (college scoped)
 * @route   GET /api/drives
 * @access  Private
 */
export const getDrives = async (req, res, next) => {
  try {
    const query = { collegeId: req.user.collegeId };
    
    // Students only see active/non-expired drives (optional logic)
    // if (req.user.role === 'student') query.deadline = { $gte: new Date() };

    const drives = await PlacementDrive.find(query).sort({ createdAt: -1 });
    res.json(drives);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single drive details
 * @route   GET /api/drives/:id
 * @access  Private
 */
export const getDriveById = async (req, res, next) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id)
      .populate('applications.studentId', 'name email profilePicture branch year')
      .populate('studentsAssigned', 'name email');

    if (!drive) {
      res.status(404);
      throw new Error('Placement drive not found');
    }

    res.json(drive);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update drive
 * @route   PUT /api/drives/:id
 * @access  Private/collegeAdmin
 */
export const updateDrive = async (req, res, next) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id);

    if (!drive) {
      res.status(404);
      throw new Error('Drive not found');
    }

    // Check ownership
    if (drive.collegeId.toString() !== req.user.collegeId.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this drive');
    }

    const updatedDrive = await PlacementDrive.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedDrive);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete drive
 * @route   DELETE /api/drives/:id
 * @access  Private/collegeAdmin
 */
export const deleteDrive = async (req, res, next) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id);

    if (!drive) {
      res.status(404);
      throw new Error('Drive not found');
    }

    if (drive.collegeId.toString() !== req.user.collegeId.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this drive');
    }

    await PlacementDrive.findByIdAndDelete(req.params.id);
    res.json({ message: 'Drive removed successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Student applies to drive
 * @route   POST /api/drives/:id/apply
 * @access  Private/student
 */
export const applyToDrive = async (req, res, next) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id);
    if (!drive) {
      res.status(404);
      throw new Error('Drive not found');
    }

    // Check if already applied
    const alreadyApplied = drive.applications.find(
      (a) => a.studentId.toString() === req.user._id.toString()
    );

    if (alreadyApplied) {
      res.status(400);
      throw new Error('You have already applied to this drive');
    }

    // Check deadline
    if (new Date() > new Date(drive.deadline)) {
      res.status(400);
      throw new Error('Application deadline has passed');
    }

    drive.applications.push({
      studentId: req.user._id,
      status: 'applied',
    });

    await drive.save();

    res.json({ message: 'Application submitted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin updates student status
 * @route   PUT /api/drives/:id/status
 * @access  Private/collegeAdmin
 */
export const updateStudentStatus = async (req, res, next) => {
  try {
    const { studentId, status } = req.body;
    const drive = await PlacementDrive.findById(req.params.id);

    if (!drive) {
      res.status(404);
      throw new Error('Drive not found');
    }

    const application = drive.applications.find(
      (a) => a.studentId.toString() === studentId
    );

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    application.status = status;
    await drive.save();

    // Notify Student
    await createNotify({
      recipient: studentId,
      sender: req.user._id,
      type: 'drive_update',
      message: `Your status for ${drive.companyName} drive has been updated to ${status}.`,
      link: '/student/drives'
    });

    res.json({ message: `Status updated to ${status}` });
  } catch (error) {
    next(error);
  }
};
