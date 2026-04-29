import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, LoginCredentials } from '../api/auth';
import { useUser } from '../contexts/UserContext';

const Login: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUserFromLogin } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authApi.login(credentials);
      
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        setUserFromLogin(response.data.user);
        navigate('/transactions');
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-xl px-lg">
      <div className="max-w-md w-full space-y-xl">
        <div className="text-center">
          <div className="flex justify-center mb-lg">
            <div className="w-20 h-20 bg-primary rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-on-primary">spa</span> 
            </div>
          </div>
          <h2 className="font-h1 text-h1 text-on-background mb-md">
            Salon Inventory System
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Sign in to manage your salon inventory
          </p>
        </div>
        
        <form className="space-y-lg" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-error-container text-on-error-container px-lg py-md rounded-lg border border-error font-body-md">
              {error}
            </div>
          )}
          
          <div className="space-y-md">
            <div>
              <label htmlFor="username" className="block font-label-md text-label-md text-on-surface-variant mb-xs uppercase tracking-wider">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline-none transition-colors font-body-md"
                placeholder="Enter your username"
                value={credentials.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="block font-label-md text-label-md text-on-surface-variant mb-xs uppercase tracking-wider">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline-none transition-colors font-body-md"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-md font-body-md bg-primary text-on-primary rounded-lg hover:bg-primary-container hover:text-on-primary-container focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-sm"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                  Signing in...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">login</span>
                  Sign in
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
