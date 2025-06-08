
import React, { useState, useEffect } from 'react';
import './gym.css'; // Assuming you have a CSS file for styling

// Statistics Component
const Statistics = ({ members }) => {
  const total = members.length;
  const paid = members.filter(m => m.feeStatus === 'paid').length;
  const unpaid = members.filter(m => m.feeStatus === 'unpaid').length;

  return (
    <div className="stats">
      <div className="stat-card">
        <h3>{total}</h3>
        <p>Total Members</p>
      </div>
      <div className="stat-card paid">
        <h3>{paid}</h3>
        <p>Paid Members</p>
      </div>
      <div className="stat-card unpaid">
        <h3>{unpaid}</h3>
        <p>Unpaid Members</p>
      </div>
    </div>
  );
};

// Member Form Component
const MemberForm = ({ onAddMember }) => {
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    admissionDate: '',
    membershipType: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.whatsapp || !formData.admissionDate || !formData.membershipType) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    const result = await onAddMember(formData);
    
    if (result.success) {
      setFormData({
        name: '',
        whatsapp: '',
        admissionDate: '',
        membershipType: ''
      });
    } else {
      alert('Failed to add member: ' + result.error);
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="member-form">
      <div className="form-section">
        <div className="form-group">
          <label htmlFor="name">Member Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter member name"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="whatsapp">WhatsApp Number *</label>
          <input
            type="tel"
            id="whatsapp"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleChange}
            placeholder="Enter WhatsApp number"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="admissionDate">Admission Date *</label>
          <input
            type="date"
            id="admissionDate"
            name="admissionDate"
            value={formData.admissionDate}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="membershipType">Membership Type *</label>
          <select
            id="membershipType"
            name="membershipType"
            value={formData.membershipType}
            onChange={handleChange}
            required
          >
            <option value="">Select membership type</option>
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly (3 months)</option>
            <option value="Half-Yearly">Half-Yearly (6 months)</option>
            <option value="Yearly">Yearly</option>
          </select>
        </div>
        <div className="form-group">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Adding...' : 'Add Member'}
          </button>
        </div>
      </div>
    </form>
  );
};

// Search Filter Component
const SearchFilter = ({ 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter, 
  onClearFilters 
}) => {
  return (
    <div className="search-filter">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="🔍 Search members by name or WhatsApp..."
      />
      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
        <option value="">All Members</option>
        <option value="paid">Paid Only</option>
        <option value="unpaid">Unpaid Only</option>
      </select>
      <button type="button" className="btn btn-secondary" onClick={onClearFilters}>
        Clear Filters
      </button>
    </div>
  );
};

// Member Card Component
const MemberCard = ({ member, onEdit, onDelete, onUpdateFeeStatus }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const handleFeeStatusChange = (e) => {
    onUpdateFeeStatus(member.id, e.target.value);
  };

  return (
    <div className={`member-card ${member.feeStatus}`}>
      <div className="member-info">
        <h3>{member.name}</h3>
        <div className="member-detail">
          <span><strong>WhatsApp:</strong></span>
          <span>{member.whatsapp}</span>
        </div>
        <div className="member-detail">
          <span><strong>Admission Date:</strong></span>
          <span>{formatDate(member.admissionDate)}</span>
        </div>
        <div className="member-detail">
          <span><strong>Membership:</strong></span>
          <span>{member.membershipType}</span>
        </div>
        {member.nextPaymentDue && (
          <div className="member-detail">
            <span><strong>Next Payment Due:</strong></span>
            <span>{formatDate(member.nextPaymentDue)}</span>
          </div>
        )}
      </div>
      <div className="fee-status">
        <span className={`status-badge status-${member.feeStatus}`}>
          {member.feeStatus.toUpperCase()}
        </span>
        <select 
          value={member.feeStatus} 
          onChange={handleFeeStatusChange}
          className="fee-status-select"
        >
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>
      <div className="member-actions">
        <button className="btn btn-primary" onClick={() => onEdit(member)}>
          Edit
        </button>
        <button className="btn btn-danger" onClick={() => onDelete(member.id)}>
          Delete
        </button>
      </div>
    </div>
  );
};

// Member List Component
const MemberList = ({ members, onEditMember, onDeleteMember, onUpdateFeeStatus }) => {
  if (members.length === 0) {
    return (
      <div className="no-members">
        <p>No members found</p>
      </div>
    );
  }

  return (
    <div className="members-grid">
      {members.map(member => (
        <MemberCard
          key={member.id}
          member={member}
          onEdit={onEditMember}
          onDelete={onDeleteMember}
          onUpdateFeeStatus={onUpdateFeeStatus}
        />
      ))}
    </div>
  );
};

// Edit Modal Component
const EditModal = ({ member, onUpdateMember, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    admissionDate: '',
    membershipType: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        whatsapp: member.whatsapp,
        admissionDate: member.admissionDate,
        membershipType: member.membershipType
      });
    }
  }, [member]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.whatsapp || !formData.admissionDate || !formData.membershipType) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    const result = await onUpdateMember(member.id, formData);
    
    if (result.success) {
      onClose();
    } else {
      alert('Failed to update member: ' + result.error);
    }
    
    setLoading(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal" onClick={handleOverlayClick}>
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Edit Member</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="form-group">
              <label htmlFor="editName">Member Name *</label>
              <input
                type="text"
                id="editName"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="editWhatsapp">WhatsApp Number *</label>
              <input
                type="tel"
                id="editWhatsapp"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="editAdmissionDate">Admission Date *</label>
              <input
                type="date"
                id="editAdmissionDate"
                name="admissionDate"
                value={formData.admissionDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="editMembershipType">Membership Type *</label>
              <select
                id="editMembershipType"
                name="membershipType"
                value={formData.membershipType}
                onChange={handleChange}
                required
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly (3 months)</option>
                <option value="Half-Yearly">Half-Yearly (6 months)</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
            <div className="form-group">
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? 'Updating...' : 'Update Member'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main App Component
const Gym = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingMember, setEditingMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate next payment due date
  const calculateNextPaymentDue = (admissionDate, membershipType) => {
    const date = new Date(admissionDate);
    switch (membershipType) {
      case 'Monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'Quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'Half-Yearly':
        date.setMonth(date.getMonth() + 6);
        break;
      case 'Yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        date.setMonth(date.getMonth() + 1);
    }
    return date.toISOString().split('T')[0];
  };

  // Auto-update fee status based on payment due date
  const updateFeeStatuses = () => {
    const today = new Date().toISOString().split('T')[0];
    setMembers(prev => prev.map(member => {
      if (member.nextPaymentDue && member.nextPaymentDue < today && member.feeStatus === 'paid') {
        return { ...member, feeStatus: 'unpaid' };
      }
      return member;
    }));
  };

  // Load initial data and set up auto-update
  useEffect(() => {
    // Load sample data
    const sampleMembers = [
      {
        id: 1,
        name: 'John Doe',
        whatsapp: '+91 9876543210',
        admissionDate: '2024-01-15',
        membershipType: 'Monthly',
        feeStatus: 'paid',
        nextPaymentDue: calculateNextPaymentDue('2024-01-15', 'Monthly')
      },
      {
        id: 2,
        name: 'Jane Smith',
        whatsapp: '+91 9876543211',
        admissionDate: '2024-02-01',
        membershipType: 'Quarterly',
        feeStatus: 'unpaid',
        nextPaymentDue: calculateNextPaymentDue('2024-02-01', 'Quarterly')
      }
    ];
    
    setMembers(sampleMembers);
    
    // Set up interval to check fee statuses
    const interval = setInterval(updateFeeStatuses, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Filter members based on search and status
  useEffect(() => {
    const filtered = members.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            member.whatsapp.includes(searchTerm);
      const matchesStatus = !statusFilter || member.feeStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
    setFilteredMembers(filtered);
  }, [members, searchTerm, statusFilter]);

  // Add new member
  const addMember = async (memberData) => {
    try {
      const newMember = {
        id: Date.now(), // Simple ID generation
        ...memberData,
        feeStatus: 'paid', // New members start as paid
        nextPaymentDue: calculateNextPaymentDue(memberData.admissionDate, memberData.membershipType)
      };
      
      setMembers(prev => [...prev, newMember]);
      return { success: true };
    } catch (err) {
      setError('Failed to add member: ' + err.message);
      return { success: false, error: err.message };
    }
  };

  // Update member
  const updateMember = async (id, memberData) => {
    try {
      const updatedMember = {
        ...memberData,
        id,
        nextPaymentDue: calculateNextPaymentDue(memberData.admissionDate, memberData.membershipType)
      };
      
      setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updatedMember } : m));
      setEditingMember(null);
      return { success: true };
    } catch (err) {
      setError('Failed to update member: ' + err.message);
      return { success: false, error: err.message };
    }
  };

  // Delete member
  const deleteMember = async (id) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;
    
    try {
      setMembers(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      setError('Failed to delete member: ' + err.message);
    }
  };

  // Update fee status
  const updateFeeStatus = async (id, newStatus) => {
    try {
      setMembers(prev => prev.map(m => 
        m.id === id ? { ...m, feeStatus: newStatus } : m
      ));
    } catch (err) {
      setError('Failed to update fee status: ' + err.message);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
  };

if (loading) {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading members...</p>
    </div>
  );
}

  return (
    <div className="gym-container">
      <h1>Gym Member Management</h1>

      <Statistics members={members} />

      <SearchFilter 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onClearFilters={clearFilters}
      />

      <MemberForm onAddMember={addMember} />

      <MemberList 
        members={filteredMembers}
        onEditMember={setEditingMember}
        onDeleteMember={deleteMember}
        onUpdateFeeStatus={updateFeeStatus}
      />

      {editingMember && (
        <EditModal 
          member={editingMember}
          onUpdateMember={updateMember}
          onClose={() => setEditingMember(null)}
        />
      )}
    </div>
  );
};

export default Gym;