const { db } = require('../database/db');

// Get team members for a company
const getTeamMembers = async (req, res) => {
  try {
    const { companyId } = req.params;
    
    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required'
      });
    }

    // Try to find company by different identifiers
    let company = null;
    
    // First try to find by ID (if it's a number)
    if (!isNaN(companyId)) {
      company = db.companies.getById(parseInt(companyId));
    }
    
    // If not found by ID, try by email
    if (!company) {
      company = db.companies.getByEmail(companyId);
    }
    
    // If still not found, try by company name
    if (!company) {
      const allCompanies = db.companies.getAll();
      company = allCompanies.find(c => c.companyName === decodeURIComponent(companyId));
    }

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Get all users who belong to this company (employees who joined using company code)
    const allUsers = db.users.getAll();
    const companyEmployees = allUsers.filter(user => 
      user.companyId === company.id && user.userType === 'company'
    );

    // Create admin entry for the company owner/creator
    const adminMember = {
      id: `admin_${company.id}`,
      name: company.companyName,
      email: company.email,
      firstName: 'Company',
      lastName: 'Admin',
      role: 'owner',
      status: 'active',
      joinedAt: company.createdAt,
      lastActive: new Date().toISOString(),
      isCreator: true,
      isAdmin: true,
      isOwner: true,
      companyCode: company.companyCode
    };

    // Convert company employees to team member format
    const employeeMembers = companyEmployees.map(user => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role || 'employee',
      status: 'active',
      joinedAt: user.createdAt,
      lastActive: new Date().toISOString(),
      isCreator: false,
      isAdmin: false,
      isOwner: false,
      userType: 'employee'
    }));

    // Get traditional team members (if any exist from old invite system)
    const teamMembers = db.teamMembers.getByCompany(company.id);
    const legacyMembers = teamMembers.map(member => ({
      ...member,
      isCreator: false,
      isAdmin: member.role === 'admin',
      isOwner: false,
      userType: 'member'
    }));

    // Combine all members with admin/owner first
    const allTeamMembers = [adminMember, ...employeeMembers, ...legacyMembers];

    // Get pending invites
    const pendingInvites = db.teamInvites.getByCompany(company.id);

    // Calculate statistics
    const stats = {
      totalMembers: allTeamMembers.length,
      activeMembers: allTeamMembers.filter(member => member.status === 'active').length,
      pendingInvites: pendingInvites.filter(invite => invite.status === 'pending').length,
      employeeCount: employeeMembers.length,
      ownerCount: 1
    };

    res.json({
      success: true,
      teamMembers: allTeamMembers,
      pendingInvites,
      stats,
      company: {
        id: company.id,
        name: company.companyName,
        companyCode: company.companyCode
      }
    });
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team members'
    });
  }
};

// Invite team member
const inviteTeamMember = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { email, role, message, invitedBy } = req.body;

    if (!email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email and role are required'
      });
    }

    // Check if email is already a team member
    const existingMember = db.teamMembers.getByEmail(email);
    if (existingMember && existingMember.companyId === companyId) {
      return res.status(400).json({
        success: false,
        message: 'This email is already a team member'
      });
    }

    // Check if invitation already exists
    const existingInvite = db.teamInvites.getByEmail(email);
    if (existingInvite && existingInvite.companyId === companyId) {
      return res.status(400).json({
        success: false,
        message: 'An invitation has already been sent to this email'
      });
    }

    // Create invitation
    const inviteData = {
      email,
      role,
      message: message || '',
      companyId,
      invitedBy: invitedBy || 'Admin'
    };

    const newInvite = db.teamInvites.create(inviteData);

    res.status(201).json({
      success: true,
      message: 'Invitation sent successfully',
      invite: newInvite
    });
  } catch (error) {
    console.error('Invite team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send invitation'
    });
  }
};

// Remove team member
const removeTeamMember = async (req, res) => {
  try {
    const { companyId, memberId } = req.params;

    if (!companyId || !memberId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID and Member ID are required'
      });
    }

    // Check if trying to remove the company owner/admin
    if (memberId.toString().startsWith('admin_')) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the company owner/administrator'
      });
    }

    // Find company to validate
    let company = null;
    if (!isNaN(companyId)) {
      company = db.companies.getById(parseInt(companyId));
    }
    if (!company) {
      company = db.companies.getByEmail(companyId);
    }
    if (!company) {
      const allCompanies = db.companies.getAll();
      company = allCompanies.find(c => c.companyName === decodeURIComponent(companyId));
    }

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Try to find in company users first (employees who joined via registration)
    const user = db.users.getById(parseInt(memberId));
    if (user && user.companyId === company.id && user.userType === 'company') {
      // This is a company employee
      const deleted = db.users.delete(parseInt(memberId));
      if (deleted) {
        res.json({
          success: true,
          message: 'Team member removed successfully'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to remove team member'
        });
      }
      return;
    }

    // If not found in users, check in legacy team members
    const teamMembers = db.teamMembers.getByCompany(company.id);
    const member = teamMembers.find(m => m.id === parseInt(memberId));

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    // Prevent removing company creator/owner
    if (member.isCreator || member.isOwner) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the company creator or owner'
      });
    }

    // Remove the legacy team member
    const deleted = db.teamMembers.delete(parseInt(memberId));

    if (deleted) {
      res.json({
        success: true,
        message: 'Team member removed successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to remove team member'
      });
    }
  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove team member'
    });
  }
};

// Cancel invitation
const cancelInvitation = async (req, res) => {
  try {
    const { companyId, inviteId } = req.params;

    if (!companyId || !inviteId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID and Invite ID are required'
      });
    }

    // Get invite to check if it exists and belongs to the company
    const invites = db.teamInvites.getByCompany(companyId);
    const invite = invites.find(i => i.id === parseInt(inviteId));

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    // Cancel the invitation
    const deleted = db.teamInvites.delete(inviteId);

    if (deleted) {
      res.json({
        success: true,
        message: 'Invitation cancelled successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to cancel invitation'
      });
    }
  } catch (error) {
    console.error('Cancel invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel invitation'
    });
  }
};

// Accept invitation (when user clicks invite link)
const acceptInvitation = async (req, res) => {
  try {
    const { inviteId } = req.params;
    const { userName } = req.body;

    if (!inviteId) {
      return res.status(400).json({
        success: false,
        message: 'Invite ID is required'
      });
    }

    // Get invitation
    const allInvites = db.teamInvites.getAll();
    const invite = allInvites.find(i => i.id === parseInt(inviteId));

    if (!invite || invite.status !== 'pending') {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired invitation'
      });
    }

    // Create team member
    const memberData = {
      name: userName || invite.email.split('@')[0],
      email: invite.email,
      role: invite.role,
      companyId: invite.companyId,
      isCreator: false
    };

    const newMember = db.teamMembers.create(memberData);

    // Update invitation status
    db.teamInvites.update(inviteId, { status: 'accepted' });

    res.json({
      success: true,
      message: 'Invitation accepted successfully',
      member: newMember
    });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept invitation'
    });
  }
};

module.exports = {
  getTeamMembers,
  inviteTeamMember,
  removeTeamMember,
  cancelInvitation,
  acceptInvitation
};
