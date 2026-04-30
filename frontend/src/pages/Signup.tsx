import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'STAFF'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/signup', formData);
      
      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/admin/reports');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant shadow-lg max-w-md w-full">
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-primary mb-4">check_circle</span>
            <h2 className="text-2xl font-bold text-on-surface mb-2">User Created Successfully!</h2>
            <p className="text-on-surface-variant">Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant shadow-lg max-w-md w-full">
        <div className="text-center mb-8">
          <span className="material-symbols-outlined text-5xl text-primary mb-4">person_add</span>
          <h2 className="text-3xl font-bold text-on-surface mb-2">Create Employee Account</h2>
          <p className="text-on-surface-variant">Add a new team member to the system</p>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg mb-6 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block font-label-md text-label-md text-on-surface-variant mb-2 uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter full name"
              required
            />
          </div>

          <div>
            <label htmlFor="username" className="block font-label-md text-label-md text-on-surface-variant mb-2 uppercase tracking-wider">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter username"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block font-label-md text-label-md text-on-surface-variant mb-2 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter password"
              required
              minLength={6}
            />
          </div>

          <div>
            <label htmlFor="role" className="block font-label-md text-label-md text-on-surface-variant mb-2 uppercase tracking-wider">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary font-headline-md text-headline-md py-3 rounded-lg hover:bg-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin">refresh</span>
                Creating Account...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">add</span>
                Create Account
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/admin/reports')}
            className="text-primary hover:underline font-medium"
          >
            Cancel and Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
