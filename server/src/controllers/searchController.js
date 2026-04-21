import User from "../models/User.js";
import PlacementDrive from "../models/PlacementDrive.js";

/**
 * @desc    Global Search across Users and Placement Drives
 * @route   GET /api/search
 * @access  Private
 */
export const globalSearch = async (req, res, next) => {
  try {
    const { q } = req.query;
    const role = req.user.role;

    if (!q) {
      return res.json({ users: [], drives: [] });
    }

    const query = new RegExp(q, "i");

    const searchTasks = [
      // Search Users: Name, Email, Skills, Role
      User.find({
        $or: [
          { name: query },
          { email: query },
          { skills: { $in: [query] } },
          { role: query }
        ],
        isBlocked: { $ne: true }
      })
      .select("name email profilePicture role currentRole company")
      .limit(5)
      .lean()
    ];

    // Only search Placement Drives for Students and Admins
    if (role !== "alumni") {
      searchTasks.push(
        PlacementDrive.find({
          $or: [
            { companyName: query },
            { role: query }
          ]
        })
        .select("companyName role deadline")
        .limit(5)
        .lean()
      );
    }

    const results = await Promise.all(searchTasks);
    
    res.json({ 
      users: results[0] || [], 
      drives: results[1] || [] 
    });
  } catch (error) {
    next(error);
  }
};
