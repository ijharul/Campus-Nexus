import College from "../models/College.js";
import User from "../models/User.js";
import { createNotify } from "../utils/notification.js";

/**
 * @desc    Create a college (superAdmin only)
 * @route   POST /api/colleges
 */
export const createCollege = async (req, res, next) => {
  try {
    const { name, location, domain, logo, adminType, adminData } = req.body;
    if (!name?.trim()) {
      res.status(400);
      throw new Error("College name is required.");
    }

    const exists = await College.findOne({
      name: new RegExp(`^${name.trim()}$`, "i"),
    });
    if (exists) {
      res.status(400);
      throw new Error("A college with this name already exists.");
    }

    // 1. Create the College
    const college = await College.create({
      name: name.trim(),
      location: location || "",
      domain: domain || "",
      logo: logo || "",
      createdBy: req.user._id,
    });

    let assignedAdmin = null;

    // 2. Handle Immediate Admin Assignment (Optional but recommended)
    if (adminType === "create" && adminData) {
      const userExists = await User.findOne({ email: adminData.email });
      if (userExists) {
        // If user exists, we'll try to assign them instead of failing
        assignedAdmin = userExists;
      } else {
        assignedAdmin = await User.create({
          name: adminData.name,
          email: adminData.email,
          password: adminData.password,
          role: "collegeAdmin",
          collegeId: college._id,
          planName: "none",
          planStatus: "none",
          paymentStatus: "none",
        });
      }
    } else if (adminType === "assign" && adminData?.userId) {
      assignedAdmin = await User.findById(adminData.userId);
    }

    if (assignedAdmin) {
      assignedAdmin.role = "collegeAdmin";
      assignedAdmin.collegeId = college._id;
      await assignedAdmin.save();

      college.adminId = assignedAdmin._id;
      await college.save();
    }

    res.status(201).json({
      message: "College created successfully",
      college: await college.populate("adminId", "name email"),
      admin: assignedAdmin
        ? { name: assignedAdmin.name, email: assignedAdmin.email }
        : null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all colleges (public — signup dropdown)
 * @route   GET /api/colleges
 */
export const getColleges = async (req, res, next) => {
  try {
    const colleges = await College.find({})
      .sort({ name: 1 })
      .select("_id name location domain")
      .populate("adminId", "name email");
    res.json(colleges);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single college
 * @route   GET /api/colleges/:id
 */
export const getCollegeById = async (req, res, next) => {
  try {
    const college = await College.findById(req.params.id).populate(
      "adminId",
      "name email",
    );
    if (!college) {
      res.status(404);
      throw new Error("College not found.");
    }
    res.json(college);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update college (superAdmin only)
 * @route   PUT /api/colleges/:id
 */
export const updateCollege = async (req, res, next) => {
  try {
    const college = await College.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!college) {
      res.status(404);
      throw new Error("College not found.");
    }
    res.json(college);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete college (superAdmin only)
 * @route   DELETE /api/colleges/:id
 */
export const deleteCollege = async (req, res, next) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      res.status(404);
      throw new Error("College not found.");
    }

    // 1. Delete the strictly associated administrator account
    if (college.adminId) {
      await User.findByIdAndDelete(college.adminId);
    }

    // 2. Unlink standard users from this defunct institution
    await User.updateMany(
      { collegeId: req.params.id },
      { $set: { collegeId: null } },
    );

    await college.deleteOne();
    res.json({ message: `College "${college.name}" deleted successfully.` });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign a user as collegeAdmin for a college
 * @route   PUT /api/colleges/:id/assign-admin
 * @body    { userId }
 * @access  Private/superAdmin
 */
export const assignCollegeAdmin = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      res.status(400);
      throw new Error("userId is required.");
    }

    const [college, user] = await Promise.all([
      College.findById(req.params.id),
      User.findById(userId),
    ]);

    if (!college) {
      res.status(404);
      throw new Error("College not found.");
    }
    if (!user) {
      res.status(404);
      throw new Error("User not found.");
    }

    // Demote previous admin of this college (if any) back to alumni/student
    if (college.adminId && college.adminId.toString() !== userId) {
      await User.findByIdAndUpdate(college.adminId, { role: "alumni" });
    }

    // Promote the user
    user.role = "collegeAdmin";
    user.collegeId = college._id;
    await user.save();

    // Store adminId on college for quick reference
    college.adminId = user._id;
    await college.save();

    // Notify User
    await createNotify({
      recipient: user._id,
      sender: req.user._id,
      type: 'request_accepted',
      message: `You have been assigned as the College Admin for ${college.name}.`,
      link: '/admin/college'
    });

    res.json({
      message: `${user.name} is now collegeAdmin for ${college.name}.`,
      college: await college.populate("adminId", "name email"),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a brand-new user as collegeAdmin for a college (superAdmin only)
 * @route   POST /api/colleges/:id/create-admin
 * @body    { name, email, password }
 */
export const createCollegeAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Name, email and password are required.");
    }

    const college = await College.findById(req.params.id);
    if (!college) {
      res.status(404);
      throw new Error("College not found.");
    }

    const exists = await User.findOne({ email });
    if (exists) {
      res.status(400);
      throw new Error("A user with this email already exists.");
    }

    // Create the new collegeAdmin user
    const newAdmin = await User.create({
      name,
      email,
      password,
      role: "collegeAdmin",
      collegeId: college._id,
      planName: "none",
      planStatus: "none",
      paymentStatus: "none",
    });

    // Demote old admin if any
    if (
      college.adminId &&
      college.adminId.toString() !== newAdmin._id.toString()
    ) {
      await User.findByIdAndUpdate(college.adminId, { role: "alumni" });
    }

    college.adminId = newAdmin._id;
    await college.save();

    res.status(201).json({
      message: `${newAdmin.name} created as collegeAdmin for ${college.name}.`,
      user: {
        _id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
      },
      college: {
        _id: college._id,
        name: college.name,
        adminId: college.adminId,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get stats for a college
 * @route   GET /api/colleges/:id/stats
 */
export const getCollegeStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [students, alumni, paid] = await Promise.all([
      User.countDocuments({ collegeId: id, role: "student" }),
      User.countDocuments({ collegeId: id, role: "alumni" }),
      User.countDocuments({ collegeId: id, planName: { $ne: "none" } }),
    ]);
    res.json({ students, alumni, paid, total: students + alumni });
  } catch (error) {
    next(error);
  }
};
