import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const canvasRef = useRef(null);

  const { login } = useAuth();
  const { t } = useLanguage();  // ← Ajouter ceci
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Animation des particules
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      const particleCount = 100;
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.5 + 0.2,
        });
      }
    };

    const drawParticles = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
        ctx.fill();
        
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
      });
      
      animationFrameId = requestAnimationFrame(drawParticles);
    };

    const init = () => {
      resizeCanvas();
      createParticles();
      drawParticles();
    };

    init();

    window.addEventListener('resize', () => {
      resizeCanvas();
      createParticles();
    });

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener('resize', () => {});
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      switch (user.role) {
        case 'passager': navigate('/dashboard-passager'); break;
        case 'chauffeur': navigate('/dashboard-chauffeur'); break;
        case 'cooperative': navigate('/dashboard-cooperative'); break;
        case 'admin': navigate('/dashboard-admin'); break;
        default: navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <canvas ref={canvasRef} id="particleCanvas"></canvas>
      
      <div className="waves-container">
        <svg className="waves" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path className="wave wave1" fill="#006994" fillOpacity="0.3" d="M0,192L48,197.3C96,203,192,213,288,208C384,203,480,181,576,181.3C672,181,768,203,864,208C960,213,1056,203,1152,186.7C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          <path className="wave wave2" fill="#008B8B" fillOpacity="0.5" d="M0,256L48,245.3C96,235,192,213,288,208C384,203,480,213,576,224C672,235,768,245,864,234.7C960,224,1056,192,1152,176C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          <path className="wave wave3" fill="#20B2AA" fillOpacity="0.4" d="M0,224L48,213.3C96,203,192,181,288,176C384,171,480,181,576,197.3C672,213,768,235,864,234.7C960,235,1056,213,1152,197.3C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      <div className={`login-card ${shake ? 'shake' : ''}`}>
        <div className="login-header">
          <div className="logo-icon">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#20B2AA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M2 17L12 22L22 17" stroke="#20B2AA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M2 12L12 17L22 12" stroke="#20B2AA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <circle cx="12" cy="12" r="2" fill="#20B2AA" stroke="#20B2AA" strokeWidth="1"/>
            </svg>
          </div>
          <h2>{t('login.title')}</h2>
          <p>{t('login.subtitle')}</p>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>{t('login.email')}</label>
            <input
              type="email"
              placeholder="exemple@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>{t('login.password')}</label>
            <input
              type="password"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="options">
            <label className="checkbox">
              <input type="checkbox" /> {t('login.remember')}
            </label>
            <Link to="/forgot-password" className="forgot-link">
              {t('login.forgot')}
            </Link>
          </div>

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? (
              <>
                <span className="spinner"></span> {t('common.loading')}
              </>
            ) : (
              t('login.button')
            )}
          </button>
        </form>

        <div className="divider">
          <span>ou</span>
        </div>

        <div className="social-buttons-row">
          <button className="social-btn google" onClick={() => alert('Google - À venir')}>
            <svg className="social-icon" viewBox="0 0 24 24" width="18" height="18">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </button>
          <button className="social-btn facebook" onClick={() => alert('Facebook - À venir')}>
            <svg className="social-icon" viewBox="0 0 24 24" width="18" height="18" fill="#1877F2">
              <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.49h-2.8V24C19.62 23.1 24 18.1 24 12.07z"/>
            </svg>
          </button>
          <button className="social-btn whatsapp" onClick={() => alert('WhatsApp - À venir')}>
            <svg className="social-icon" viewBox="0 0 24 24" width="18" height="18" fill="#25D366">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-5.45-4.45-9.9-9.91-9.9zm0 18.23c-1.5 0-2.97-.41-4.25-1.17l-.3-.18-3.12.82.83-3.04-.2-.31c-.82-1.33-1.26-2.86-1.26-4.44 0-4.6 3.74-8.34 8.34-8.34 4.6 0 8.34 3.74 8.34 8.34-.01 4.6-3.75 8.34-8.38 8.34zm4.57-6.25c-.25-.13-1.48-.73-1.71-.81-.23-.09-.4-.13-.57.13-.17.26-.65.81-.8.97-.15.17-.3.19-.55.06-.25-.13-1.06-.39-2.02-1.24-.75-.67-1.25-1.49-1.4-1.74-.15-.25-.02-.38.11-.5.12-.13.27-.34.4-.51.13-.17.17-.29.26-.48.09-.19.04-.36-.02-.5-.06-.13-.57-1.37-.78-1.87-.2-.49-.41-.42-.56-.43-.15 0-.32-.02-.49-.02s-.45.06-.68.34c-.23.28-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.71 4.3 3.8.6.26 1.07.42 1.44.54.6.19 1.15.16 1.58.1.48-.07 1.48-.61 1.69-1.19.21-.59.21-1.09.15-1.19-.06-.1-.22-.17-.47-.3z"/>
            </svg>
          </button>
        </div>

        <p className="register-link">
          {t('login.noAccount')} <Link to="/register">{t('login.register')}</Link>
        </p>
      </div>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .login-container {
          min-height: 100vh; width: 100%; display: flex; align-items: center;
          justify-content: center; padding: 20px; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
          position: relative; overflow: hidden;
          background: linear-gradient(135deg, #006994 0%, #008B8B 25%, #20B2AA 50%, #48D1CC 75%, #00CED1 100%);
          background-size: 200% 200%; animation: gradientShift 8s ease infinite;
        }
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        #particleCanvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
        .waves-container { position: absolute; bottom: 0; left: 0; width: 100%; overflow: hidden; line-height: 0; z-index: 2; }
        .waves { position: relative; width: 100%; height: 200px; margin-bottom: -7px; min-height: 100px; max-height: 150px; }
        .wave { animation: waveMove 7s ease-in-out infinite alternate; }
        .wave1 { animation-duration: 8s; animation-delay: 0s; }
        .wave2 { animation-duration: 10s; animation-delay: 1s; }
        .wave3 { animation-duration: 12s; animation-delay: 2s; }
        @keyframes waveMove { 0% { transform: translateX(0) translateY(0); } 100% { transform: translateX(-100px) translateY(10px); } }
        .login-card {
          max-width: 480px; width: 100%; background: rgba(255,255,255,0.98);
          backdrop-filter: blur(20px); border-radius: 32px;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.3);
          padding: 2.5rem; transition: all 0.4s cubic-bezier(0.175,0.885,0.32,1.275);
          animation: slideUp 0.6s ease-out, floatAnimation 3s ease-in-out infinite;
          z-index: 10; position: relative;
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(50px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes floatAnimation { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        .login-card:hover { transform: translateY(-5px) scale(1.02); box-shadow: 0 35px 60px -15px rgba(0,0,0,0.4); }
        .logo-icon { text-align: center; margin-bottom: 1rem; animation: rotateLogo 20s linear infinite; }
        @keyframes rotateLogo { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .login-header { text-align: center; margin-bottom: 2rem; }
        .login-header h2 { font-size: 2rem; font-weight: 800; background: linear-gradient(135deg, #006994 0%, #20B2AA 100%); background-clip: text; -webkit-background-clip: text; color: transparent; margin-bottom: 0.5rem; }
        .login-header p { color: #6b7280; font-size: 0.95rem; }
        .alert-error { background: linear-gradient(135deg, #fee2e2, #fecaca); border-left: 4px solid #ef4444; color: #991b1b; padding: 0.75rem 1rem; border-radius: 16px; margin-bottom: 1.5rem; font-size: 0.9rem; font-weight: 500; animation: slideInRight 0.3s ease-out; }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        .input-group { margin-bottom: 1.5rem; }
        .input-group label { display: block; font-size: 0.85rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem; }
        .input-group input { width: 100%; padding: 0.85rem 1rem; font-size: 1rem; border: 2px solid #e2e8f0; border-radius: 24px; background: linear-gradient(135deg, #ffffff, #f9fafb); transition: all 0.3s ease; outline: none; }
        .input-group input:focus { border-color: #20B2AA; box-shadow: 0 0 0 4px rgba(32,178,170,0.1); background: white; transform: translateX(5px); }
        .options { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.8rem; font-size: 0.85rem; }
        .checkbox { display: flex; align-items: center; gap: 0.5rem; color: #4b5563; cursor: pointer; transition: color 0.3s ease; }
        .checkbox:hover { color: #20B2AA; }
        .checkbox input { width: 16px; height: 16px; cursor: pointer; accent-color: #20B2AA; }
        .forgot-link { color: #20B2AA; text-decoration: none; font-weight: 600; transition: all 0.3s ease; position: relative; }
        .forgot-link::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 0%; height: 2px; background: #20B2AA; transition: width 0.3s ease; }
        .forgot-link:hover::after { width: 100%; }
        .forgot-link:hover { color: #008B8B; }
        .login-btn { width: 100%; background: linear-gradient(135deg, #006994 0%, #20B2AA 100%); background-size: 200% 200%; border: none; padding: 1rem; border-radius: 40px; font-size: 1rem; font-weight: 700; color: white; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(32,178,170,0.4); display: flex; align-items: center; justify-content: center; gap: 0.5rem; position: relative; overflow: hidden; animation: pulse 2s ease-in-out infinite; }
        @keyframes pulse { 0%,100% { box-shadow: 0 4px 15px rgba(32,178,170,0.4); } 50% { box-shadow: 0 4px 25px rgba(32,178,170,0.7); } }
        .login-btn::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); transition: left 0.5s ease; }
        .login-btn:hover:not(:disabled)::before { left: 100%; }
        .login-btn:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 8px 30px rgba(32,178,170,0.6); background-position: 100% 50%; }
        .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .spinner { width: 18px; height: 18px; border: 2px solid white; border-top-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .divider { text-align: center; margin: 1.5rem 0; position: relative; }
        .divider::before, .divider::after { content: ''; position: absolute; top: 50%; width: 45%; height: 1px; background: #e2e8f0; }
        .divider::before { left: 0; }
        .divider::after { right: 0; }
        .divider span { background: white; padding: 0 1rem; color: #94a3b8; font-size: 0.85rem; }
        .social-buttons-row { display: flex; gap: 0.75rem; justify-content: center; margin-bottom: 1.5rem; }
        .social-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.7rem 0.5rem; border-radius: 40px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; border: 1px solid #e2e8f0; background: white; color: #475569; }
        .social-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .register-link { text-align: center; margin-top: 1.5rem; font-size: 0.9rem; color: #6b7280; }
        .register-link a { color: #20B2AA; text-decoration: none; font-weight: 700; transition: all 0.3s ease; position: relative; }
        .register-link a::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 0%; height: 2px; background: #20B2AA; transition: width 0.3s ease; }
        .register-link a:hover::after { width: 100%; }
        @keyframes shake { 0%,100% { transform: translateX(0); } 20%,60% { transform: translateX(-8px); } 40%,80% { transform: translateX(8px); } }
        .shake { animation: shake 0.5s ease-in-out; }
        @media (max-width: 480px) {
          .login-card { padding: 1.5rem; max-width: 95%; }
          .login-header h2 { font-size: 1.5rem; }
          .options { flex-direction: column; gap: 1rem; align-items: flex-start; }
          .waves { height: 80px; }
          .social-buttons-row { gap: 0.5rem; }
        }
      `}</style>
    </div>
  );
};

export default Login;