import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { AlertCircle } from 'lucide-react';

const Register = () => {
  const [form, setForm] = useState({
    nom: '',
    email: '',
    mot_de_passe: '',
    role: 'passager',
    telephone: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const canvasRef = useRef(null);
  
  const { register } = useAuth();
  const { t } = useLanguage();
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
    };
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nom || !form.email || !form.mot_de_passe) {
      setError(t('register.errorRequired') || 'Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      await register(form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || t('register.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <canvas ref={canvasRef} id="particleCanvas"></canvas>
      
      <div className="waves-container">
        <svg className="waves" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path className="wave wave1" fill="#006994" fillOpacity="0.3" d="M0,192L48,197.3C96,203,192,213,288,208C384,203,480,181,576,181.3C672,181,768,203,864,208C960,213,1056,203,1152,186.7C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          <path className="wave wave2" fill="#008B8B" fillOpacity="0.5" d="M0,256L48,245.3C96,235,192,213,288,208C384,203,480,213,576,224C672,235,768,245,864,234.7C960,224,1056,192,1152,176C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          <path className="wave wave3" fill="#20B2AA" fillOpacity="0.4" d="M0,224L48,213.3C96,203,192,181,288,176C384,171,480,181,576,197.3C672,213,768,235,864,234.7C960,235,1056,213,1152,197.3C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      <div className={`register-card ${shake ? 'shake' : ''}`}>
        <div className="register-header">
          <div className="logo-icon">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#20B2AA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M2 17L12 22L22 17" stroke="#20B2AA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M2 12L12 17L22 12" stroke="#20B2AA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <circle cx="12" cy="12" r="2" fill="#20B2AA" stroke="#20B2AA" strokeWidth="1"/>
            </svg>
          </div>
          <h2>{t('register.title')}</h2>
          <p>{t('register.subtitle')}</p>
        </div>

        {error && (
          <div className="alert-error">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="input-group">
              <label>{t('register.name')}</label>
              <input
                type="text"
                name="nom"
                placeholder={t('register.namePlaceholder') || "Votre nom et prénom"}
                value={form.nom}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>{t('register.phone')}</label>
              <input
                type="text"
                name="telephone"
                placeholder={t('register.phonePlaceholder') || "votre numéro de téléphone"}
                value={form.telephone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="input-group">
            <label>{t('register.email')}</label>
            <input
              type="email"
              name="email"
              placeholder="exemple@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>{t('register.password')}</label>
            <input
              type="password"
              name="mot_de_passe"
              placeholder="8 caractères minimum"
              value={form.mot_de_passe}
              onChange={handleChange}
              minLength={8}
              required
            />
          </div>

          <div className="input-group">
            <label>{t('register.role')}</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="custom-select"
            >
              <option value="passager">{t('register.passenger')}</option>
              <option value="chauffeur">{t('register.driver')}</option>
              <option value="cooperative">{t('register.cooperative')}</option>
            </select>
          </div>

          <button
            type="submit"
            className="register-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span> {t('common.loading')}
              </>
            ) : (
              <>{t('register.button')}</>
            )}
          </button>
        </form>

        <p className="login-link">
          {t('register.haveAccount')} <Link to="/login">{t('login.button')}</Link>
        </p>
      </div>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .register-page {
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
        .register-card {
          max-width: 620px; width: 100%; background: rgba(255,255,255,0.98);
          backdrop-filter: blur(20px); border-radius: 32px;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.3);
          padding: 2.5rem; transition: all 0.4s cubic-bezier(0.175,0.885,0.32,1.275);
          animation: slideUp 0.6s ease-out, floatAnimation 3s ease-in-out infinite;
          z-index: 10; position: relative;
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(50px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes floatAnimation { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        .register-card:hover { transform: translateY(-5px) scale(1.02); box-shadow: 0 35px 60px -15px rgba(0,0,0,0.4); }
        .register-header { text-align: center; margin-bottom: 2rem; }
        .logo-icon { text-align: center; margin-bottom: 1rem; animation: rotateLogo 20s linear infinite; }
        @keyframes rotateLogo { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .register-header h2 { font-size: 2rem; font-weight: 800; background: linear-gradient(135deg, #006994 0%, #20B2AA 100%); background-clip: text; -webkit-background-clip: text; color: transparent; margin-bottom: 0.5rem; }
        .register-header p { color: #6b7280; font-size: 0.95rem; }
        .alert-error { background: linear-gradient(135deg, #fee2e2, #fecaca); border-left: 4px solid #ef4444; color: #991b1b; padding: 0.75rem 1rem; border-radius: 16px; margin-bottom: 1.5rem; font-size: 0.9rem; font-weight: 500; display: flex; align-items: center; gap: 10px; animation: slideInRight 0.3s ease-out; }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .input-group { margin-bottom: 1.25rem; }
        .input-group label { display: block; font-size: 0.85rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem; }
        .input-group input, .input-group select { width: 100%; padding: 0.85rem 1rem; font-size: 1rem; border: 2px solid #e2e8f0; border-radius: 24px; background: linear-gradient(135deg, #ffffff, #f9fafb); transition: all 0.3s ease; outline: none; }
        .input-group input:focus, .input-group select:focus { border-color: #20B2AA; box-shadow: 0 0 0 4px rgba(32,178,170,0.1); background: white; transform: translateX(5px); }
        .register-btn { width: 100%; background: linear-gradient(135deg, #006994 0%, #20B2AA 100%); background-size: 200% 200%; border: none; padding: 1rem; border-radius: 40px; font-size: 1rem; font-weight: 700; color: white; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(32,178,170,0.4); display: flex; align-items: center; justify-content: center; gap: 0.5rem; position: relative; overflow: hidden; animation: pulse 2s ease-in-out infinite; }
        @keyframes pulse { 0%,100% { box-shadow: 0 4px 15px rgba(32,178,170,0.4); } 50% { box-shadow: 0 4px 25px rgba(32,178,170,0.7); } }
        .register-btn::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); transition: left 0.5s ease; }
        .register-btn:hover:not(:disabled)::before { left: 100%; }
        .register-btn:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 8px 30px rgba(32,178,170,0.6); background-position: 100% 50%; }
        .register-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .spinner { width: 18px; height: 18px; border: 2px solid white; border-top-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .login-link { text-align: center; margin-top: 2rem; font-size: 0.9rem; color: #6b7280; }
        .login-link a { color: #20B2AA; text-decoration: none; font-weight: 700; transition: all 0.3s ease; position: relative; }
        .login-link a::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 0%; height: 2px; background: #20B2AA; transition: width 0.3s ease; }
        .login-link a:hover::after { width: 100%; }
        @keyframes shake { 0%,100% { transform: translateX(0); } 20%,60% { transform: translateX(-8px); } 40%,80% { transform: translateX(8px); } }
        .shake { animation: shake 0.5s ease-in-out; }
        @media (max-width: 640px) {
          .form-row { grid-template-columns: 1fr; gap: 0; }
          .register-card { padding: 1.5rem; }
          .register-header h2 { font-size: 1.5rem; }
          .waves { height: 80px; }
        }
      `}</style>
    </div>
  );
};

export default Register;