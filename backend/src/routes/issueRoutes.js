const express = require('express');
const issueController = require('../controllers/issueController');
const { authenticateJWT, requireRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Apply JWT Authentication to all issue endpoints
router.use(authenticateJWT);

// Create a new issue (supports image upload under key 'image')
router.post('/', upload.single('image'), issueController.createIssue);

// Get list of issues (supports optional query filters)
router.get('/', issueController.getIssues);

// Get dashboard stats
router.get('/stats', issueController.getStats);

// Get single issue details by ID
router.get('/:id', issueController.getIssueById);

// Update issue status (officers/admins/citizens within allowed transition rules)
router.patch('/:id/status', issueController.updateStatus);

// Assign issue to an officer (restricted to Officers or Admins)
router.patch('/:id/assign', requireRole(['OFFICER', 'ADMIN']), issueController.assignIssue);

// Verify an issue resolution (Citizen confirms true/false)
router.post('/:id/verify', issueController.verifyIssue);

// Reopen an issue
router.post('/:id/reopen', issueController.reopenIssue);

module.exports = router;
