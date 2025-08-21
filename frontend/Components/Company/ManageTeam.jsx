import React, { useState, useEffect } from 'react';
import { authUtils } from '../../src/utils/authUtils';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  MoreVertical, 
  Search,
  Filter,
  Crown,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  Send
} from 'lucide-react';

export default function ManageTeam() {
  const [company, setCompany] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'member',
    message: ''
  });
  const [isInviting, setIsInviting] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    pendingInvites: 0
  });

  useEffect(() => {
    const companyData = authUtils.getCurrentUser();
    if (companyData) {
      setCompany(companyData);
    }
  }, []);

  useEffect(() => {
    if (company) {
      fetchTeamData();
    }
  }, [company]);

  const fetchTeamData = async () => {
    if (!company) return;

    try {
      setLoading(true);
      console.log('Fetching team data for company:', company);
      
      // Determine the correct company identifier for the API call
      let companyIdentifier;
      
      if (company.companyId) {
        // User is an employee who joined a company - use the company ID
        companyIdentifier = company.companyId;
        console.log('Using company ID from employee record:', companyIdentifier);
      } else {
        // User is a company owner - use their own details
        companyIdentifier = company.id || company.email || company.companyName || company.name;
        console.log('Using company owner identifier:', companyIdentifier);
      }
      
      const response = await axios.get(`${import.meta.env.VITE_BASEURL}/api/team/company/${encodeURIComponent(companyIdentifier)}`, {
        headers: {
          'Authorization': `Bearer ${authUtils.getToken()}`
        },
        withCredentials: true,
      });
      
      console.log('Team API Response:', response.data);
      
      if (response.data.success) {
        setTeamMembers(response.data.teamMembers || []);
        setPendingInvites(response.data.pendingInvites || []);
        setStats(response.data.stats || {
          totalMembers: 0,
          activeMembers: 0,
          pendingInvites: 0
        });
      } else {
        // Fallback to default data structure with company creator
        const defaultTeamMember = {
          id: 1,
          name: company?.companyName || company?.name || 'Admin User',
          email: company?.email || 'admin@company.com',
          role: 'admin',
          status: 'active',
          joinedAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          isCreator: true
        };

        setTeamMembers([defaultTeamMember]);
        setPendingInvites([]);
        setStats({
          totalMembers: 1,
          activeMembers: 1,
          pendingInvites: 0
        });
      }

    } catch (error) {
      console.error('Error fetching team data:', error);
      
      // Fallback to default data structure with company creator
      const defaultTeamMember = {
        id: 1,
        name: company?.companyName || company?.name || 'Admin User',
        email: company?.email || 'admin@company.com',
        role: 'admin',
        status: 'active',
        joinedAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        isCreator: true
      };

      setTeamMembers([defaultTeamMember]);
      setPendingInvites([]);
      setStats({
        totalMembers: 1,
        activeMembers: 1,
        pendingInvites: 0
      });
      
      if (error.response?.status !== 404) {
        toast.error('Failed to load team data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    
    if (!inviteData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    // Check if email is already a member or invited
    const existingMember = teamMembers.find(member => member.email === inviteData.email);
    const existingInvite = pendingInvites.find(invite => invite.email === inviteData.email);
    
    if (existingMember) {
      toast.error('This email is already a team member');
      return;
    }
    
    if (existingInvite) {
      toast.error('An invite has already been sent to this email');
      return;
    }

    setIsInviting(true);
    
    try {
      const companyIdentifier = company.id || company.email || company.companyName || company.name;
      
      const response = await axios.post(`${import.meta.env.VITE_BASEURL}/api/team/company/${encodeURIComponent(companyIdentifier)}/invite`, {
        email: inviteData.email,
        role: inviteData.role,
        message: inviteData.message,
        invitedBy: company?.email || company?.companyName
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authUtils.getToken()}`
        },
        withCredentials: true,
      });

      if (response.data.success) {
        // Refresh team data
        await fetchTeamData();
        
        // Reset form
        setInviteData({
          email: '',
          role: 'member',
          message: ''
        });
        setShowInviteModal(false);
        toast.success('Invitation sent successfully!');
      } else {
        toast.error(response.data.message || 'Failed to send invitation');
      }

    } catch (error) {
      console.error('Error sending invite:', error);
      
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || 'Failed to send invitation');
      } else {
        toast.error('Failed to send invitation. Please try again.');
      }
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;
    
    if (selectedMember.isCreator) {
      toast.error('Cannot remove the company creator');
      return;
    }

    setIsRemoving(true);
    
    try {
      const companyIdentifier = company.id || company.email || company.companyName || company.name;
      
      const response = await axios.delete(`${import.meta.env.VITE_BASEURL}/api/team/company/${encodeURIComponent(companyIdentifier)}/member/${selectedMember.id}`, {
        headers: {
          'Authorization': `Bearer ${authUtils.getToken()}`
        },
        withCredentials: true,
      });

      if (response.data.success) {
        // Refresh team data
        await fetchTeamData();
        
        setShowRemoveModal(false);
        setSelectedMember(null);
        toast.success('Member removed successfully');
      } else {
        toast.error(response.data.message || 'Failed to remove member');
      }

    } catch (error) {
      console.error('Error removing member:', error);
      
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || 'Failed to remove member');
      } else {
        toast.error('Failed to remove member. Please try again.');
      }
    } finally {
      setIsRemoving(false);
    }
  };

  const cancelInvite = async (inviteId) => {
    try {
      const companyIdentifier = company.id || company.email || company.companyName || company.name;
      
      const response = await axios.delete(`${import.meta.env.VITE_BASEURL}/api/team/company/${encodeURIComponent(companyIdentifier)}/invite/${inviteId}`, {
        headers: {
          'Authorization': `Bearer ${authUtils.getToken()}`
        },
        withCredentials: true,
      });

      if (response.data.success) {
        // Refresh team data
        await fetchTeamData();
        toast.success('Invitation cancelled');
      } else {
        toast.error(response.data.message || 'Failed to cancel invitation');
      }
    } catch (error) {
      console.error('Error cancelling invite:', error);
      
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || 'Failed to cancel invitation');
      } else {
        toast.error('Failed to cancel invitation. Please try again.');
      }
    }
  };

  const filteredMembers = teamMembers
    .filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' || member.role === filterRole;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      // Sort by: 1. Owner/Creator first, 2. Admin, 3. Then by name
      if (a.isCreator || a.isOwner) return -1;
      if (b.isCreator || b.isOwner) return 1;
      if (a.isAdmin && !b.isAdmin) return -1;
      if (!a.isAdmin && b.isAdmin) return 1;
      return a.name.localeCompare(b.name);
    });

  // Check if current user is admin/owner
  const currentUser = authUtils.getCurrentUser();
  
  // Determine if the current user is admin based on different criteria
  const isAdmin = currentUser && (() => {
    // If the user has direct company account (registered as company owner)
    if (currentUser.type === 'company' && !currentUser.companyId) {
      return true; // This is a company owner who registered the company
    }
    
    // If the user has an explicit owner role
    if (currentUser.role === 'owner') {
      return true;
    }
    
    // Check if the user is marked as admin in the team members
    const currentMember = teamMembers.find(member => 
      member.email === currentUser.email
    );
    
    if (currentMember) {
      return currentMember.isCreator || currentMember.isAdmin || currentMember.isOwner;
    }
    
    // If user has company type but with companyId, they are an employee
    if (currentUser.userType === 'company' && currentUser.companyId) {
      // Check if they have an admin role specified - including management roles
      const adminRoles = ['admin', 'owner', 'creator', 'manager', 'team-lead', 'hr-manager', 'hiring-manager'];
      return adminRoles.includes(currentUser.role);
    }
    
    return false;
  })();

  // Debug logging
  console.log('ManageTeam - Current user:', currentUser);
  console.log('ManageTeam - Is admin:', isAdmin);
  console.log('ManageTeam - Team members:', teamMembers);
  console.log('ManageTeam - Admin check details:', {
    hasCompanyType: currentUser?.type === 'company',
    hasCompanyId: !!currentUser?.companyId,
    userRole: currentUser?.role,
    userType: currentUser?.userType,
    matchingMember: teamMembers.find(member => member.email === currentUser?.email)
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="lg:w-4/5 mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  {isAdmin ? 'Manage Team' : 'Team Members'}
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    isAdmin 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}>
                    {isAdmin ? 'Admin Access' : 'View Only'}
                  </span>
                </h1>
                <p className="text-gray-600 mt-1">
                  {isAdmin 
                    ? 'Manage your company\'s team members and invitations' 
                    : 'View your company\'s team members'}
                </p>
                {!isAdmin && (
                  <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-sm text-blue-800">
                        You have view-only access. Contact an admin to manage team members.
                      </span>
                    </div>
                  </div>
                )}
              </div>
              {isAdmin && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-200 flex items-center shadow-md"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Invite Member
                </button>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-600">Total Members</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.totalMembers}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-600">Active Members</p>
                    <p className="text-2xl font-bold text-green-900">{stats.activeMembers}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-yellow-600">Pending Invites</p>
                    <p className="text-2xl font-bold text-yellow-900">{stats.pendingInvites}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="lg:w-4/5 mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="text-gray-400 w-5 h-5" />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="lg:w-4/5 mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredMembers.length === 0 ? (
                <div className="p-8 text-center">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
                  <p className="text-gray-600">
                    {searchTerm || filterRole !== 'all' 
                      ? 'Try adjusting your search or filter criteria.' 
                      : 'Start building your team by inviting members.'}
                  </p>
                </div>
              ) : (
                filteredMembers.map((member) => (
                  <div key={member.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-lg">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
                            {(member.isCreator || member.isOwner) && (
                              <div className="flex items-center space-x-1">
                                <Crown className="w-4 h-4 text-yellow-500" />
                                <span className="text-xs font-medium text-yellow-700">Owner</span>
                              </div>
                            )}
                            {member.isAdmin && !member.isCreator && !member.isOwner && (
                              <div className="flex items-center space-x-1">
                                <Shield className="w-4 h-4 text-blue-500" />
                                <span className="text-xs font-medium text-blue-700">Admin</span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{member.email}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              (member.isCreator || member.isOwner)
                                ? 'bg-yellow-100 text-yellow-800'
                                : member.isAdmin
                                ? 'bg-blue-100 text-blue-800'
                                : member.role === 'hr-manager' || member.role === 'hiring-manager'
                                ? 'bg-purple-100 text-purple-800'
                                : member.role === 'team-lead' || member.role === 'manager'
                                ? 'bg-indigo-100 text-indigo-800'
                                : member.role === 'developer' || member.role === 'designer'
                                ? 'bg-green-100 text-green-800'
                                : member.role === 'employee'
                                ? 'bg-cyan-100 text-cyan-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {(member.isCreator || member.isOwner)
                                ? 'Company Owner' 
                                : member.role === 'owner'
                                ? 'Company Owner'
                                : member.role 
                                  ? member.role.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                                  : 'Employee'
                              }
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              member.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {member.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                            {member.companyCode && (member.isCreator || member.isOwner) && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                                Code: {member.companyCode}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="text-right text-sm text-gray-500">
                          <p>Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
                          <p>Last active {new Date(member.lastActive).toLocaleDateString()}</p>
                        </div>
                        
                        {isAdmin && !member.isCreator && !member.isOwner && (
                          <div className="relative">
                            <button
                              onClick={() => {
                                setSelectedMember(member);
                                setShowRemoveModal(true);
                              }}
                              className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                              title="Remove member"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        
                        {!isAdmin && !member.isCreator && !member.isOwner && (
                          <div className="relative">
                            <div 
                              className="p-2 text-gray-300 rounded-full cursor-not-allowed"
                              title="Only admins can remove team members"
                            >
                              <Trash2 className="w-4 h-4" />
                            </div>
                          </div>
                        )}
                        
                        {/* Show company code only to owner */}
                        {(member.isCreator || member.isOwner) && member.companyCode && (
                          <div className="text-right text-sm">
                            <p className="text-gray-500">Company Code</p>
                            <p className="font-mono text-indigo-600 font-medium">{member.companyCode}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <div className="max-w-7xl mx-auto mb-8">
          <div className="lg:w-4/5 mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Pending Invitations</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {pendingInvites.map((invite) => (
                  <div key={invite.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Mail className="w-6 h-6 text-yellow-600" />
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{invite.email}</h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                              {invite.role.charAt(0).toUpperCase() + invite.role.slice(1)}
                            </span>
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                              Pending
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="text-right text-sm text-gray-500">
                          <p>Invited {new Date(invite.sentAt).toLocaleDateString()}</p>
                          <p>by {invite.sentBy}</p>
                        </div>
                        
                        {isAdmin && (
                          <button
                            onClick={() => cancelInvite(invite.id)}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                            title="Cancel invitation"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        
                        {!isAdmin && (
                          <div 
                            className="p-2 text-gray-300 rounded-full cursor-not-allowed"
                            title="Only admins can cancel invitations"
                          >
                            <XCircle className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Invite Team Member</h2>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleInvite} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={inviteData.email}
                    onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="colleague@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={inviteData.role}
                    onChange={(e) => setInviteData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Personal Message (Optional)
                  </label>
                  <textarea
                    value={inviteData.message}
                    onChange={(e) => setInviteData(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a personal message to the invitation..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
                  disabled={isInviting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isInviting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Member Modal */}
      {showRemoveModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <XCircle className="w-10 h-10 text-red-500" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Remove Team Member</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone.</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900">{selectedMember.name}</h4>
                <p className="text-sm text-gray-600">{selectedMember.email}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Role: {selectedMember.role}
                </p>
              </div>
              
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to remove this team member? They will lose access to the company portal immediately.
              </p>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRemoveModal(false);
                    setSelectedMember(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
                  disabled={isRemoving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveMember}
                  disabled={isRemoving}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isRemoving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Removing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Member
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
