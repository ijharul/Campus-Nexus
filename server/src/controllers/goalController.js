import Goal from '../models/Goal.js';

/**
 * @desc    Get all active goals for a student
 * @route   GET /api/goals
 * @access  Private (Student)
 */
export const getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ studentId: req.user._id }).sort({ targetDate: 1 });
    res.json(goals);
  } catch (error) { next(error); }
};

/**
 * @desc    Create a new career action plan goal
 * @route   POST /api/goals
 * @access  Private (Student)
 */
export const createGoal = async (req, res, next) => {
  try {
    const { title, description, targetDate } = req.body;
    const goal = await Goal.create({
      studentId: req.user._id,
      title,
      description,
      targetDate
    });
    res.status(201).json(goal);
  } catch (error) { next(error); }
};

/**
 * @desc    Update an existing goal's completion status or mentor payload
 * @route   PUT /api/goals/:id
 * @access  Private (Student)
 */
export const updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, studentId: req.user._id });
    if (!goal) {
      res.status(404);
      throw new Error('Goal trace not found in memory bank.');
    }

    goal.status = req.body.status || goal.status;
    goal.title = req.body.title || goal.title;
    goal.description = req.body.description || goal.description;
    if (req.body.targetDate) goal.targetDate = req.body.targetDate;

    await goal.save();
    res.json(goal);
  } catch (error) { next(error); }
};

/**
 * @desc    Safely terminate/archive a goal
 * @route   DELETE /api/goals/:id
 * @access  Private (Student)
 */
export const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, studentId: req.user._id });
    if (!goal) {
      res.status(404);
      throw new Error('Goal signature not identified.');
    }
    
    await goal.deleteOne();
    res.json({ message: 'Goal safely unlinked from sequence.' });
  } catch (error) { next(error); }
};
