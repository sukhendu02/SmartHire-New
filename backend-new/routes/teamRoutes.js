const express = require('express');
const { 
  getTeamMembers, 
  inviteTeamMember, 
  removeTeamMember, 
  cancelInvitation, 
  acceptInvitation 
} = require('../controllers/teamController');

const router = express.Router();

// Get team members for a company
router.get('/company/:companyId', getTeamMembers);

// Invite team member
router.post('/company/:companyId/invite', inviteTeamMember);

// Remove team member
router.delete('/company/:companyId/member/:memberId', removeTeamMember);

// Cancel invitation
router.delete('/company/:companyId/invite/:inviteId', cancelInvitation);

// Accept invitation (public route for invite links)
router.post('/invite/:inviteId/accept', acceptInvitation);

module.exports = router;
