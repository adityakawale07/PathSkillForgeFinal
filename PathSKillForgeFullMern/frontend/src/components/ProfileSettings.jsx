import React, { useState, useEffect } from 'react';
import API from '../api';
import { 
  User, 
  Mail, 
  GraduationCap, 
  Calendar, 
  KeyRound, 
  Moon, 
  Sun, 
  Check, 
  Edit3, 
  Save, 
  ShieldCheck 
} from 'lucide-react';

export default function ProfileSettings({ user, setUser }) {
  const [profile, setProfile] = useState({
    fullName: user?.fullName || 'Aditya Kawale',
    email: user?.email || 'aditya@example.com',
    course: 'B.Sc. Computer Science',
    year: '3',
    phone: '+91 98765 43210',
    theme: 'Light',
    defaultQuizCount: 5,
    autoSaveSummaries: true
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get('/auth/profile')
      .then((res) => {
        if (res.data) {
          setProfile((prev) => ({
            ...prev,
            fullName: res.data.fullName || prev.fullName,
            email: res.data.email || prev.email,
            course: res.data.course || prev.course,
            year: res.data.year || prev.year,
            phone: res.data.phone || prev.phone,
            theme: res.data.preferences?.theme || prev.theme,
            defaultQuizCount: res.data.preferences?.defaultQuizCount || prev.defaultQuizCount,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveProfile = async () => {
    setLoading(true);
    setStatusMsg({ type: '', text: '' });
    try {
      await API.put('/auth/profile', {
        fullName: profile.fullName,
        course: profile.course,
        year: profile.year,
        phone: profile.phone,
        preferences: { theme: profile.theme, defaultQuizCount: profile.defaultQuizCount }
      });
      setIsEditing(false);
      setStatusMsg({ type: 'success', text: 'Profile updated successfully!' });
      
      const updatedUser = { ...user, fullName: profile.fullName };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setStatusMsg({ type: 'error', text: 'New passwords do not match!' });
      return;
    }
    setLoading(true);
    try {
      await API.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setStatusMsg({ type: 'success', text: 'Password updated successfully!' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Alert Messages */}
      {statusMsg.text && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between ${
          statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <span>{statusMsg.text}</span>
          <button onClick={() => setStatusMsg({ type: '', text: '' })} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
      )}

      {/* Main Profile Card (Matching Screen 11 from PDF) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Top Header / Avatar Area */}
        <div className="p-8 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-indigo-600/30">
              {profile.fullName?.[0] || 'A'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">{profile.fullName}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{profile.email}</p>
            </div>
          </div>

          <button
            onClick={() => {
              if (isEditing) handleSaveProfile();
              else setIsEditing(true);
            }}
            disabled={loading}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              isEditing 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm' 
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isEditing ? <><Save size={14} /> Save Profile</> : <><Edit3 size={14} /> Edit Profile</>}
          </button>
        </div>

        {/* Account Information Section */}
        <div className="p-8 space-y-6">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Account Information
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 text-xs">Full Name</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    className="border border-slate-200 rounded-lg px-2 py-1 text-xs text-right font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                ) : (
                  <span className="font-semibold text-slate-800 text-xs">{profile.fullName}</span>
                )}
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 text-xs">Email Address</span>
                <span className="font-semibold text-slate-800 text-xs">{profile.email}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 text-xs">Course</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.course}
                    onChange={(e) => setProfile({ ...profile, course: e.target.value })}
                    className="border border-slate-200 rounded-lg px-2 py-1 text-xs text-right font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                ) : (
                  <span className="font-semibold text-slate-800 text-xs">{profile.course}</span>
                )}
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 text-xs">Academic Year</span>
                {isEditing ? (
                  <select
                    value={profile.year}
                    onChange={(e) => setProfile({ ...profile, year: e.target.value })}
                    className="border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium focus:outline-none"
                  >
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3 (TY B.Sc)</option>
                    <option value="4">Year 4</option>
                  </select>
                ) : (
                  <span className="font-semibold text-slate-800 text-xs">Year {profile.year}</span>
                )}
              </div>
            </div>
          </div>

          {/* Preferences Section (Theme & AI settings) */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Preferences
            </h4>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Application Theme</p>
                  <p className="text-[11px] text-slate-400">Choose light or dark visual display</p>
                </div>
                <select
                  value={profile.theme}
                  onChange={(e) => setProfile({ ...profile, theme: e.target.value })}
                  className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 font-medium bg-slate-50 focus:outline-none"
                >
                  <option value="Light">☀️ Light Theme</option>
                  <option value="Dark">🌙 Dark Theme (Preview)</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Account Security</p>
                  <p className="text-[11px] text-slate-400">Update your account password</p>
                </div>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <KeyRound size={16} className="text-indigo-600" /> Change Password
              </h4>
              <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition"
                >
                  {loading ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}