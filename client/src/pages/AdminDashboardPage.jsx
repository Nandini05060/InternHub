import React, { useState, useEffect } from 'react';
import { StatsOverview } from '../components/admin/StatsOverview.jsx';
import { InternshipManagerTable } from '../components/admin/InternshipManagerTable.jsx';
import { StudentManagerTable } from '../components/admin/StudentManagerTable.jsx';
import { AddEditInternshipModal } from '../components/admin/AddEditInternshipModal.jsx';
import { adminApi } from '../api/extraApis.js';
import { internshipApi } from '../api/internshipApi.js';
import { Shield, Briefcase, Users, Plus, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Navigate } from 'react-router-dom';

export function AdminDashboardPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState('internships');
  const [stats, setStats] = useState(null);
  const [internships, setInternships] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [editingInternship, setEditingInternship] = useState(null);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, internsRes, studentsRes] = await Promise.all([
        adminApi.getStats(),
        internshipApi.getInternships({ all: 'true' }), // include pending & expired for admin
        adminApi.getStudents()
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (internsRes.success) setInternships(internsRes.internships || []);
      if (studentsRes.success) setStudents(studentsRes.students || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  if (authLoading) return null;
  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const handleOpenAdd = () => {
    setEditingInternship(null);
    setAddEditModalOpen(true);
  };

  const handleOpenEdit = (internship) => {
    setEditingInternship(internship);
    setAddEditModalOpen(true);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
              <Shield className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Administrator Console
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Verify internship listings, remove expired links, and moderate student accounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAdminData}
            disabled={loading}
            className="btn-secondary text-xs py-2 px-3"
            title="Refresh data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="btn-primary text-xs py-2 px-4 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Post Verified Internship</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <StatsOverview stats={stats} />

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('internships')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'internships'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Internship Listings ({internships.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'students'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Directory & Moderation ({students.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'internships' && (
        <InternshipManagerTable
          internships={internships}
          onRefresh={loadAdminData}
          onEditInternship={handleOpenEdit}
          onAddInternship={handleOpenAdd}
        />
      )}

      {activeTab === 'students' && (
        <StudentManagerTable
          students={students}
          onRefresh={loadAdminData}
        />
      )}

      {/* Add / Edit Internship Modal */}
      {addEditModalOpen && (
        <AddEditInternshipModal
          isOpen={addEditModalOpen}
          onClose={() => setAddEditModalOpen(false)}
          internship={editingInternship}
          onSaveSuccess={loadAdminData}
        />
      )}
    </div>
  );
}
