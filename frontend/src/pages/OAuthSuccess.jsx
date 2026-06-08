import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function OAuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const login = async () => {
      const params =
        new URLSearchParams(
          window.location.search
        );

      const token =
        params.get('token');

      if (!token) {
        navigate('/login');
        return;
      }

      localStorage.setItem(
        'token',
        token
      );

      try {
        const res = await axios.get(
          'http://localhost:3000/auth/me',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        localStorage.setItem(
          'userId',
          res.data.id
        );

        console.log(
          'Stored userId:',
          res.data.id
        );

        navigate('/profile');
      } catch (err) {
        console.error(err);
        navigate('/login');
      }
    };

    login();
  }, [navigate]);

  return <div>Logging in...</div>;
}