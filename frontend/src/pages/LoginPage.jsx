import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      navigate('/profile');
    }
  }, [navigate]);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:3000/auth/login', {
        email,
        password,
      });

      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem(
        'userId',
        res.data.user.id
      );
      navigate('/profile');
    } catch (err) {
      console.error(err);

      alert(
        err?.response?.data?.message ||
        err?.message ||
        'Login failed'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        'http://localhost:3000/auth/register',
        {
          email,
          password,
        }
      );
      localStorage.setItem(
        'userId',
        res.data.user.id
      );

      localStorage.setItem(
        'token',
        res.data.access_token
      );
      navigate('/profile');

    } catch (err) {
      alert(err?.res?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href =
      'http://localhost:3000/auth/google';
  };

  const handleGithubLogin = () => {
    window.location.href =
      'http://localhost:3000/auth/github';
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900/95 backdrop-blur border border-gray-800 rounded-3xl shadow-2xl p-8 hover:border-blue-900 transition-all duration-300">


        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-white">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-400 mt-2">
            {isLogin
              ? 'Log in to continue your ASTRA journey'
              : 'Join ASTRA and track your progress'}
          </p>
        </div>

        {isLogin ? (
          <form className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="button"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? 'Please wait...' : 'Login'}
            </button>
          </form>
        ) : (
          <form className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Create a password"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Confirm password"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
              onClick={handleSignup}
              disabled={loading}
            >
              {loading ? 'Please wait...' : 'Create Account'}
            </button>
          </form>
        )}

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-700"></div>
          <span className="px-3 text-gray-500 text-sm">OR</span>
          <div className="flex-1 border-t border-gray-700"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-3.5 bg-white text-gray-800 rounded-xl font-semibold border border-gray-300 hover:shadow-lg hover:scale-[1.01] transition-all duration-200 flex items-center justify-center gap-3"
        >
          <FcGoogle size={22} />
          Continue with Google
        </button>
        <button
          type="button"
          onClick={handleGithubLogin}
          className="w-full mt-3 py-3.5 bg-gray-800 text-white rounded-xl font-semibold border border-gray-700 hover:shadow-lg hover:scale-[1.01] transition-all duration-200 flex items-center justify-center gap-3"
        >
          <FaGithub size={22} />
          Continue with GitHub
        </button>

        <div className="text-center text-sm mt-6">
          {isLogin ? (
            <p className="text-gray-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className="text-blue-400 font-semibold hover:text-blue-300 transition-colors"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p className="text-gray-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className="text-blue-400 font-semibold hover:text-blue-300 transition-colors"
              >
                Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;