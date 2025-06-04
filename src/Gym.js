import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Edit2, Save, X, Users, Calendar, Phone, Clock, 
  CheckCircle, XCircle, BarChart3, UserCheck, Trash2 
} from 'lucide-react';
import './gym.css';

const Gym = () => {
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('members');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    whatsappNumber: '',
    dateOfJoining: '',
    membershipType: 'monthly'
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    loadData();
    calculateStats();
    
    // Set up interval to refresh stats every 30 seconds
    const interval = setInterval(() => {
      calculateStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [members, attendance]);

  // Data Management Functions
  const loadData = () => {
    try {
      const savedMembers = localStorage.getItem('gymMembers');
      const savedAttendance = localStorage.getItem('gymAttendance');
      
      if (savedMembers) {
        setMembers(JSON.parse(savedMembers));
      }
      if (savedAttendance) {
        setAttendance(JSON.parse(savedAttendance));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = (newMembers = members, newAttendance = attendance) => {
    try {
      localStorage.setItem('gymMembers', JSON.stringify(newMembers));
      localStorage.setItem('gymAttendance', JSON.stringify(newAttendance));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const calculateStats = () => {
    const today = new Date().toDateString();
    const todayAttendance = attendance.filter(att => 
      new Date(att.checkInTime).toDateString() === today
    );
    
    const activeCheckIns = todayAttendance.filter(att => !att.checkOutTime);
    
    const thisMonth = new Date();
    const newMembersThisMonth = members.filter(member => {
      const joinDate = new Date(member.dateOfJoining);
      return joinDate.getMonth() === thisMonth.getMonth() && 
             joinDate.getFullYear() === thisMonth.getFullYear();
    });

    setStats({
      totalMembers: members.length,
      todayAttendance: todayAttendance.length,
      activeCheckIns: activeCheckIns.length,
      newMembersThisMonth: newMembersThisMonth.length
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      alert('Please enter member name');
      return false;
    }
    if (!formData.whatsappNumber.trim()) {
      alert('Please enter WhatsApp number');
      return false;
    }
    if (!formData.dateOfJoining) {
      alert('Please select date of joining');
      return false;
    }
    return true;
  };

  const addMember = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const newMember = {
        _id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString()
      };

      const updatedMembers = [...members, newMember];
      setMembers(updatedMembers);
      saveData(updatedMembers, attendance);
      
      resetForm();
      setIsAddingMember(false);
      alert('Member added successfully!');
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Error adding member');
    } finally {
      setLoading(false);
    }
  };

  const updateMember = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const updatedMembers = members.map(member =>
        member._id === editingMember._id
          ? { ...member, ...formData }
          : member
      );
      
      setMembers(updatedMembers);
      saveData(updatedMembers, attendance);
      
      resetForm();
      setEditingMember(null);
      alert('Member updated successfully!');
    } catch (error) {
      console.error('Error updating member:', error);
      alert('Error updating member');
    } finally {
      setLoading(false);
    }
  };

  const deleteMember = async (id) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;
    
    try {
      const updatedMembers = members.filter(member => member._id !== id);
      const updatedAttendance = attendance.filter(att => att.memberId !== id);
      
      setMembers(updatedMembers);
      setAttendance(updatedAttendance);
      saveData(updatedMembers, updatedAttendance);
      
      alert('Member deleted successfully!');
    } catch (error) {
      console.error('Error deleting member:', error);
      alert('Error deleting member');
    }
  };

  const markAttendance = async (memberId, memberName) => {
    try {
      const today = new Date().toDateString();
      const existingAttendance = attendance.find(att => 
        att.memberId === memberId && 
        new Date(att.checkInTime).toDateString() === today
      );

      if (existingAttendance) {
        alert('Attendance already marked for today');
        return;
      }

      const newAttendance = {
        _id: Date.now().toString(),
        memberId: memberId,
        memberName: memberName,
        checkInTime: new Date().toISOString(),
        checkOutTime: null
      };

      const updatedAttendance = [...attendance, newAttendance];
      setAttendance(updatedAttendance);
      saveData(members, updatedAttendance);
      
      alert(`Attendance marked for ${memberName} successfully!`);
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Error marking attendance');
    }
  };

  const markCheckout = async (memberId, memberName) => {
    try {
      const today = new Date().toDateString();
      const updatedAttendance = attendance.map(att => {
        if (att.memberId === memberId && 
            new Date(att.checkInTime).toDateString() === today && 
            !att.checkOutTime) {
          return { ...att, checkOutTime: new Date().toISOString() };
        }
        return att;
      });

      setAttendance(updatedAttendance);
      saveData(members, updatedAttendance);
      
      alert(`${memberName} checked out successfully!`);
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Error during checkout');
    }
  };

  const startEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      whatsappNumber: member.whatsappNumber,
      dateOfJoining: new Date(member.dateOfJoining).toISOString().split('T')[0],
      membershipType: member.membershipType
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      whatsappNumber: '',
      dateOfJoining: '',
      membershipType: 'monthly'
    });
  };

  const cancelEdit = () => {
    setEditingMember(null);
    setIsAddingMember(false);
    resetForm();
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.whatsappNumber.includes(searchTerm)
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAttendanceStatus = (memberId) => {
    const today = new Date().toDateString();
    const todayAttendance = attendance.find(att => 
      att.memberId === memberId && 
      new Date(att.checkInTime).toDateString() === today
    );
    
    if (!todayAttendance) return 'absent';
    if (todayAttendance.checkOutTime) return 'completed';
    return 'present';
  };

  const getTodayAttendance = () => {
    const today = new Date().toDateString();
    return attendance.filter(att => 
      new Date(att.checkInTime).toDateString() === today
    ).map(att => ({
      ...att,
      memberData: members.find(m => m._id === att.memberId)
    }));
  };

  return (
    <div className="gym-app">
      <div className="container">
        {/* Header */}
        <div className="header-card">
          <div className="header-content">
            <div className="header-left">
              <div className="header-icon">
                <Users size={24} />
              </div>
              <div className="header-text">
                <h1>Gym Management System</h1>
                <p>Manage members and track daily attendance</p>
              </div>
            </div>
            <div className="header-right">
              <p className="date-label">Today's Date</p>
              <p className="current-date">
                {new Date().toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon blue">
                <Users size={24} />
              </div>
              <div className="stat-info">
                <p className="stat-label">Total Members</p>
                <p className="stat-value">{stats.totalMembers || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon green">
                <CheckCircle size={24} />
              </div>
              <div className="stat-info">
                <p className="stat-label">Today's Attendance</p>
                <p className="stat-value">{stats.todayAttendance || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon yellow">
                <Clock size={24} />
              </div>
              <div className="stat-info">
                <p className="stat-label">Active Check-ins</p>
                <p className="stat-value">{stats.activeCheckIns || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon purple">
                <UserCheck size={24} />
              </div>
              <div className="stat-info">
                <p className="stat-label">New This Month</p>
                <p className="stat-value">{stats.newMembersThisMonth || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <div className="tab-buttons">
            <button
              onClick={() => setActiveTab('members')}
              className={`tab-button ${activeTab === 'members' ? 'active' : ''}`}
            >
              <Users size={20} />
              Members
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`tab-button ${activeTab === 'attendance' ? 'active' : ''}`}
            >
              <Calendar size={20} />
              Today's Attendance
            </button>
          </div>
        </div>

        {/* Members Tab */}
        {activeTab === 'members' && (
          <>
            {/* Search and Add Section */}
            <div className="search-add-section">
              <div className="search-container">
                <div className="search-input-wrapper">
                  <Search className="search-icon" size={20} />
                  <input
                    type="text"
                    placeholder="Search by name or phone number..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => setIsAddingMember(true)}
                  className="add-button"
                >
                  <Plus size={20} />
                  Add Member
                </button>
              </div>
            </div>

            {/* Add/Edit Form */}
            {(isAddingMember || editingMember) && (
              <div className="form-section">
                <h2 className="form-title">
                  {editingMember ? 'Edit Member' : 'Add New Member'}
                </h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">WhatsApp Number *</label>
                    <input
                      type="text"
                      name="whatsappNumber"
                      value={formData.whatsappNumber}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="+91 9876543210"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date of Joining *</label>
                    <input
                      type="date"
                      name="dateOfJoining"
                      value={formData.dateOfJoining}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Membership Type</label>
                    <select
                      name="membershipType"
                      value={formData.membershipType}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>
                <div className="form-actions">
                  <button
                    onClick={editingMember ? updateMember : addMember}
                    disabled={loading}
                    className="save-button"
                  >
                    <Save size={20} />
                    {loading ? 'Saving...' : editingMember ? 'Update Member' : 'Add Member'}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="cancel-button"
                  >
                    <X size={20} />
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Members List */}
            <div className="table-section">
              <div className="table-header">
                <h2>Members List ({filteredMembers.length})</h2>
              </div>
              <div className="table-container">
                <table className="members-table">
                  <thead>
                    <tr>
                      <th>Member Details</th>
                      <th>Contact</th>
                      <th>Membership</th>
                      <th>Today's Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((member) => {
                      const attendanceStatus = getAttendanceStatus(member._id);
                      return (
                        <tr key={member._id}>
                          <td>
                            <div className="member-info">
                              <div className="member-avatar">
                                <Users size={20} />
                              </div>
                              <div className="member-details">
                                <div className="member-name">{member.name}</div>
                                <div className="member-joined">
                                  Joined: {formatDate(member.dateOfJoining)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="contact-info">
                              <Phone size={16} />
                              {member.whatsappNumber}
                            </div>
                          </td>
                          <td>
                            <span className={`membership-badge ${member.membershipType}`}>
                              {member.membershipType.charAt(0).toUpperCase() + member.membershipType.slice(1)}
                            </span>
                          </td>
                          <td>
                            <div className={`status-indicator ${attendanceStatus}`}>
                              {attendanceStatus === 'present' && (
                                <>
                                  <CheckCircle size={20} />
                                  <span>Present</span>
                                </>
                              )}
                              {attendanceStatus === 'completed' && (
                                <>
                                  <Clock size={20} />
                                  <span>Completed</span>
                                </>
                              )}
                              {attendanceStatus === 'absent' && (
                                <>
                                  <XCircle size={20} />
                                  <span>Absent</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="action-buttons">
                              {attendanceStatus === 'absent' && (
                                <button
                                  onClick={() => markAttendance(member._id, member.name)}
                                  className="action-btn present"
                                >
                                  <CheckCircle size={16} />
                                  Mark Present
                                </button>
                              )}
                              {attendanceStatus === 'present' && (
                                <button
                                  onClick={() => markCheckout(member._id, member.name)}
                                  className="action-btn checkout"
                                >
                                  <Clock size={16} />
                                  Check Out
                                </button>
                              )}
                              <button
                                onClick={() => startEdit(member)}
                                className="action-btn edit"
                              >
                                <Edit2 size={16} />
                                Edit
                              </button>
                              <button
                                onClick={() => deleteMember(member._id)}
                                className="action-btn delete"
                              >
                                <Trash2 size={16} />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredMembers.length === 0 && (
                  <div className="empty-state">
                    <Users size={48} />
                    <p>No members found</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div className="table-section">
            <div className="table-header">
              <h2>Today's Attendance ({getTodayAttendance().length} members checked in)</h2>
            </div>
            <div className="table-container">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Check-in Time</th>
                    <th>Check-out Time</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getTodayAttendance().map((att) => {
                    const duration = att.checkOutTime 
                      ? Math.round((new Date(att.checkOutTime) - new Date(att.checkInTime)) / (1000 * 60))
                      : Math.round((new Date() - new Date(att.checkInTime)) / (1000 * 60));
                    
                    return (
                      <tr key={att._id}>
                        <td>
                          <div className="member-info">
                            <div className="member-avatar">
                              <Users size={20} />
                            </div>
                            <div className="member-details">
                              <div className="member-name">{att.memberData?.name || att.memberName}</div>
                              <div className="member-phone">{att.memberData?.whatsappNumber}</div>
                            </div>
                          </div>
                        </td>
                        <td>{formatTime(att.checkInTime)}</td>
                        <td>{att.checkOutTime ? formatTime(att.checkOutTime) : '-'}</td>
                        <td>
                          {duration < 60 ? `${duration} min` : `${Math.floor(duration / 60)}h ${duration % 60}m`}
                        </td>
                        <td>
                          {att.checkOutTime ? (
                            <span className="status-badge completed">Completed</span>
                          ) : (
                            <span className="status-badge active">Active</span>
                          )}
                        </td>
                        <td>
                          {!att.checkOutTime && (
                            <button
                              onClick={() => markCheckout(att.memberId, att.memberData?.name || att.memberName)}
                              className="action-btn checkout"
                            >
                              <Clock size={16} />
                              Check Out
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {getTodayAttendance().length === 0 && (
                <div className="empty-state">
                  <Calendar size={48} />
                  <p>No attendance records for today</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gym;