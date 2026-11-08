import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Users, Truck, Clock, Shield, ChevronRight, 
  Star, ArrowRight, MapPin, Phone, Mail, Menu, X, 
  Calendar, CheckCircle, Zap, Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const LandingPage = () => {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHoveringCard, setIsHoveringCard] = useState(false);

  // Images pour le carrousel principal
  const slides = [
    {
      image: '/img/anosy.jpg',
      titleKey: 'hero.slide1.title',
      subtitleKey: 'hero.slide1.subtitle',
    },
    {
      image: '/img/img8.jpg',
      titleKey: 'hero.slide2.title',
      subtitleKey: 'hero.slide2.subtitle',
    },
    {
      image: '/img/img2.jpg',
      titleKey: 'hero.slide3.title',
      subtitleKey: 'hero.slide3.subtitle',
    },
    {
      image: '/img/img3.jpg',
      titleKey: 'hero.slide4.title',
      subtitleKey: 'hero.slide4.subtitle',
    },
    {
      image: '/img/img4.jpg',
      titleKey: 'hero.slide5.title',
      subtitleKey: 'hero.slide5.subtitle',
    },
    {
      image: '/img/img5.jpg',
      titleKey: 'hero.slide6.title',
      subtitleKey: 'hero.slide6.subtitle',
    },
    {
      image: '/img/img6.jpg',
      titleKey: 'hero.slide7.title',
      subtitleKey: 'hero.slide7.subtitle',
    },
    {
      image: '/img/img7.jpg',
      titleKey: 'hero.slide8.title',
      subtitleKey: 'hero.slide8.subtitle',
    }
  ];

  const stats = [
    { icon: Users, value: 50000, labelKey: 'stats.passengers', suffix: '+' },
    { icon: MapPin, value: 45, labelKey: 'stats.cities', suffix: '' },
    { icon: Truck, value: 200, labelKey: 'stats.vehicles', suffix: '+' },
    { icon: Star, value: 98, labelKey: 'stats.satisfaction', suffix: '%' },
  ];

  const features = [
    { icon: Clock, titleKey: 'features.guaranteed.title', descriptionKey: 'features.guaranteed.description', color: '#3b82f6' },
    { icon: Shield, titleKey: 'features.security.title', descriptionKey: 'features.security.description', color: '#10b981' },
    { icon: Zap, titleKey: 'features.optimization.title', descriptionKey: 'features.optimization.description', color: '#8b5cf6' },
    { icon: Calendar, titleKey: 'features.booking.title', descriptionKey: 'features.booking.description', color: '#f59e0b' },
  ];

  const testimonials = [
    { name: 'Rakoto Jean', roleKey: 'testimonials.role1', contentKey: 'testimonials.content1', rating: 5 },
    { name: 'Rasoamampionona', roleKey: 'testimonials.role2', contentKey: 'testimonials.content2', rating: 5 },
    { name: 'Andrianina', roleKey: 'testimonials.role3', contentKey: 'testimonials.content3', rating: 5 },
  ];

  const destinations = [
    { from: 'Antananarivo', to: 'Toamasina', duration: '8h', price: '25,000 Ar', image: '/img/toamasina.jpg' },
    { from: 'Antananarivo', to: 'Mahajanga', duration: '12h', price: '35,000 Ar', image: '/img/mahanjanga.jpg' },
    { from: 'Antananarivo', to: 'Fianarantsoa', duration: '7h', price: '22,000 Ar', image: '/img/fianarantsoa.jpg' },
    { from: 'Toamasina', to: 'Antsiranana', duration: '18h', price: '55,000 Ar', image: '/img/antsiranana.jpg' },
    { from: 'Antananarivo', to: 'Toliara', duration: '15h', price: '45,000 Ar', image: '/img/toliara.jpg' },
    { from: 'Fianarantsoa', to: 'Manakara', duration: '5h', price: '15,000 Ar', image: '/img/manakara.jpg' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const StatCounter = ({ value, suffix }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
      const duration = 2000;
      const step = value / (duration / 16);
      let current = 0;
      const timer = setInterval(() => {
        current += step;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, 16);
      return () => clearInterval(timer);
    }, [value]);
    return <span>{count}{suffix}</span>;
  };

  return (
    <div className="landing-page">
      {/* CURSEUR PERSONNALISÉ */}
      <motion.div 
        className="custom-cursor"
        animate={{ 
          x: mousePosition.x - 15, 
          y: mousePosition.y - 15,
          scale: isHoveringCard ? 1.5 : 1
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      >
        <div className="cursor-dot"></div>
      </motion.div>

      {/* PARTICULES D'ARRIÈRE-PLAN */}
      <div className="particles">
        {[...Array(50)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${10 + Math.random() * 15}s`,
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
            background: `rgba(16, 185, 129, ${0.1 + Math.random() * 0.2})`
          }} />
        ))}
      </div>

      {/* NAVBAR */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="logo">
            <div className="logo-icon">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="logo-text">ALPHA <span className="logo-highlight">trans</span></span>
          </div>
          
          <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
            <a href="#accueil">{t('nav.home')}</a>
            <a href="#avantages">{t('nav.benefits')}</a>
            <a href="#destinations">{t('nav.destinations')}</a>
            <a href="#temoignages">{t('nav.testimonials')}</a>
            <a href="#contact">{t('nav.contact')}</a>
            <Link to="/login" className="btn-login">{t('nav.login')}</Link>
            <Link to="/register" className="btn-register">{t('nav.register')}</Link>
          </div>
          
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section id="accueil" className="hero">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="hero-slide"
            style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
          >
            <div className="hero-overlay"></div>
            <div className="hero-content">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="hero-badge"
              >
                <Sparkles size={16} />
                <span>{t('hero.badge')}</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                {t(slides[currentSlide].titleKey)}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                {t(slides[currentSlide].subtitleKey)}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="hero-buttons"
              >
                <Link to="/register" className="btn-primary">
                  {t('hero.start')} <ChevronRight size={18} />
                </Link>
                <Link to="/login" className="btn-secondary">
                  {t('hero.login')}
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="carousel-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`indicator ${currentSlide === index ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </section>

      {/* STATISTIQUES */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="stat-card"
              >
                <div className="stat-icon">
                  <stat.icon size={40} />
                </div>
                <div className="stat-value">
                  <StatCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="stat-label">{t(stat.labelKey)}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AVANTAGES */}
      <section id="avantages" className="features">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-header"
          >
            <span className="section-badge">{t('features.badge')}</span>
            <h2>{t('features.title')}</h2>
            <p>{t('features.subtitle')}</p>
          </motion.div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="feature-card"
                style={{ '--feature-color': feature.color }}
                onMouseEnter={() => {
                  setHoveredCard(index);
                  setIsHoveringCard(true);
                }}
                onMouseLeave={() => {
                  setHoveredCard(null);
                  setIsHoveringCard(false);
                }}
                whileHover={{ y: -15 }}
              >
                <motion.div 
                  className="feature-icon"
                  animate={{ 
                    rotate: hoveredCard === index ? 360 : 0,
                    scale: hoveredCard === index ? 1.1 : 1
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <feature.icon size={40} />
                </motion.div>
                <h3>{t(feature.titleKey)}</h3>
                <p>{t(feature.descriptionKey)}</p>
                <motion.div 
                  className="feature-hover"
                  animate={{ 
                    x: hoveredCard === index ? 10 : 0,
                    opacity: hoveredCard === index ? 1 : 0
                  }}
                >
                  <ChevronRight size={20} />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section id="destinations" className="destinations">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-header"
          >
            <span className="section-badge">{t('destinations.badge')}</span>
            <h2>{t('destinations.title')}</h2>
            <p>{t('destinations.subtitle')}</p>
          </motion.div>

          <div className="destinations-grid">
            {destinations.map((dest, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="destination-card"
              >
                <div className="destination-image" style={{ backgroundImage: `url(${dest.image})` }}>
                  <div className="destination-overlay">
                    <div className="destination-price">{dest.price}</div>
                  </div>
                </div>
                <div className="destination-info">
                  <div className="destination-route">
                    <span>{dest.from}</span>
                    <ArrowRight size={16} />
                    <span>{dest.to}</span>
                  </div>
                  <div className="destination-duration">
                    <Clock size={14} /> {dest.duration}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TÉMOIGNAGES */}
      <section id="temoignages" className="testimonials">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-header"
          >
            <span className="section-badge">{t('testimonials.badge')}</span>
            <h2>{t('testimonials.title')}</h2>
            <p>{t('testimonials.subtitle')}</p>
          </motion.div>

          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="testimonial-card"
              >
                <div className="testimonial-quote">"</div>
                <p className="testimonial-content">{t(testimonial.contentKey)}</p>
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="#fbbf24" stroke="#fbbf24" />
                  ))}
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    <Users size={24} />
                  </div>
                  <div>
                    <div className="author-name">{testimonial.name}</div>
                    <div className="author-role">{t(testimonial.roleKey)}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section">
        <div className="cta-particles">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="cta-particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 6}s`
            }} />
          ))}
        </div>
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="cta-content"
          >
            <motion.h2
              animate={{ 
                scale: [1, 1.02, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {t('cta.title')}
            </motion.h2>
            <p>{t('cta.subtitle')}</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn-primary btn-large">
                {t('cta.createAccount')} <ChevronRight size={20} />
              </Link>
              <Link to="/login" className="btn-outline-light">{t('cta.alreadyRegistered')}</Link>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* FOOTER */}
      <footer id="contact" className="footer">
        <div className="footer-wave">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
            <path d="M0,0V15.81C13,21.25,27.93,25.67,44.24,28.45c69.76,11.6,136.47,7.22,206.42-5.49C369.5,5.49,437.06,36,510.57,50.87c69.12,14,140.12,6.56,207.93-4.77,36.09-6,69.72-17.84,104.23-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".5"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
          </svg>
        </div>
        <div className="container-custom">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="logo">
                <div className="logo-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <span>ALPHA trans</span>
              </div>
              <p>{t('footer.description')}</p>
              <div className="social-links">
                <motion.a href="https://facebook.com" target="_blank" rel="noreferrer" whileHover={{ y: -3, color: '#1877f2' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </motion.a>
                <motion.a href="https://twitter.com" target="_blank" rel="noreferrer" whileHover={{ y: -3, color: '#1da1f2' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
                  </svg>
                </motion.a>
                <motion.a href="https://linkedin.com" target="_blank" rel="noreferrer" whileHover={{ y: -3, color: '#0077b5' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect x="2" y="9" width="4" height="12"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                </motion.a>
              </div>
            </div>
            <div className="footer-links">
              <h4>{t('footer.quickLinks')}</h4>
              <a href="#accueil">{t('nav.home')}</a>
              <a href="#avantages">{t('nav.benefits')}</a>
              <a href="#destinations">{t('nav.destinations')}</a>
              <a href="#temoignages">{t('nav.testimonials')}</a>
            </div>
            <div className="footer-links">
              <h4>{t('footer.support')}</h4>
              <a href="#">{t('footer.helpCenter')}</a>
              <a href="#">{t('footer.faq')}</a>
              <a href="#">{t('footer.terms')}</a>
              <a href="#">{t('footer.privacy')}</a>
            </div>
            <div className="footer-contact">
              <h4>{t('footer.contact')}</h4>
              <p><Phone size={16} /> +261 34 24 520 39</p>
              <p><Mail size={16} /> joelalpha50@gmail.com</p>
              <p><MapPin size={16} /> {t('footer.address')}</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          overflow-x: hidden;
        }

        .landing-page {
          overflow-x: hidden;
          position: relative;
        }

        .container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* CURSEUR PERSONNALISÉ */
        .custom-cursor {
          position: fixed;
          pointer-events: none;
          z-index: 9999;
          width: 30px;
          height: 30px;
        }

        .cursor-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 10px #10b981;
        }

        /* PARTICULES */
        .particles {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .particle {
          position: absolute;
          border-radius: 50%;
          animation: float linear infinite;
        }

        @keyframes float {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.5;
          }
          90% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }

        /* NAVBAR */
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          padding: 16px 0;
          transition: all 0.3s ease;
        }

        .navbar.scrolled {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          padding: 12px 0;
        }

        .navbar .container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo-icon {
          color: #10b981;
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: 800;
          color: white;
        }

        .navbar.scrolled .logo-text {
          color: #1f2937;
        }

        .logo-highlight {
          color: #10b981;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .nav-links a {
          text-decoration: none;
          color: white;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .navbar.scrolled .nav-links a {
          color: #4b5563;
        }

        .nav-links a:hover {
          color: #10b981;
        }

        .btn-login {
          padding: 8px 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 40px;
        }

        .btn-register {
          padding: 8px 20px;
          background: #10b981;
          border-radius: 40px;
          color: white !important;
        }

        .btn-register:hover {
          background: #059669;
        }

        .navbar.scrolled .btn-login {
          border-color: #d1d5db;
          color: #4b5563;
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: white;
        }

        .navbar.scrolled .mobile-menu-btn {
          color: #1f2937;
        }

        /* HERO */
        .hero {
          position: relative;
          height: 100vh;
          overflow: hidden;
        }

        .hero-slide {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.5) 100%);
        }

        .hero-content {
          position: relative;
          text-align: center;
          color: white;
          max-width: 800px;
          padding: 0 24px;
          z-index: 2;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          padding: 8px 16px;
          border-radius: 40px;
          font-size: 0.85rem;
          margin-bottom: 24px;
        }

        .hero-content h1 {
          font-size: 3.5rem;
          font-weight: 800;
          margin-bottom: 20px;
          line-height: 1.2;
        }

        .hero-content p {
          font-size: 1.2rem;
          opacity: 0.9;
          margin-bottom: 32px;
        }

        .hero-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 32px;
          background: #10b981;
          color: white;
          text-decoration: none;
          border-radius: 40px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          background: #059669;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
        }

        .btn-secondary {
          padding: 14px 32px;
          background: transparent;
          border: 2px solid white;
          color: white;
          text-decoration: none;
          border-radius: 40px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }

        .carousel-indicators {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 12px;
          z-index: 10;
        }

        .indicator {
          width: 40px;
          height: 4px;
          background: rgba(255, 255, 255, 0.3);
          border: none;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .indicator.active {
          background: #10b981;
          width: 60px;
        }

        /* STATS */
        .stats {
          padding: 60px 0;
          background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
          position: relative;
          z-index: 1;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
        }

        .stat-card {
          text-align: center;
          padding: 32px;
          background: white;
          border-radius: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .stat-icon {
          color: #10b981;
          margin-bottom: 16px;
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 8px;
        }

        .stat-label {
          color: #6b7280;
          font-weight: 500;
        }

        /* FEATURES */
        .features {
          padding: 80px 0;
          background: white;
        }

        .section-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .section-badge {
          display: inline-block;
          padding: 6px 16px;
          background: #e8f5e9;
          color: #10b981;
          border-radius: 40px;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .section-header h2 {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 16px;
        }

        .section-header p {
          color: #6b7280;
          max-width: 600px;
          margin: 0 auto;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
        }

        .feature-card {
          padding: 32px;
          background: #f9fafb;
          border-radius: 24px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: var(--feature-color);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .feature-card:hover::before {
          transform: scaleX(1);
        }

        .feature-icon {
          margin-bottom: 20px;
          color: var(--feature-color);
        }

        .feature-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 12px;
        }

        .feature-card p {
          color: #6b7280;
          line-height: 1.6;
        }

        .feature-hover {
          position: absolute;
          bottom: 20px;
          right: 20px;
          opacity: 0;
          transition: all 0.3s ease;
          color: var(--feature-color);
        }

        /* DESTINATIONS */
        .destinations {
          padding: 80px 0;
          background: #f8fafc;
        }

        .destinations-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }

        .destination-card {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .destination-image {
          height: 200px;
          background-size: cover;
          background-position: center;
          position: relative;
        }

        .destination-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(0deg, rgba(0, 0, 0, 0.6) 0%, transparent 50%);
          display: flex;
          justify-content: flex-end;
          padding: 16px;
        }

        .destination-price {
          background: #10b981;
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .destination-info {
          padding: 20px;
        }

        .destination-route {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .destination-route span {
          color: #1f2937;
        }

        .destination-duration {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #6b7280;
          font-size: 0.85rem;
        }

        /* TESTIMONIALS */
        .testimonials {
          padding: 80px 0;
          background: white;
        }

        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }

        .testimonial-card {
          background: #f9fafb;
          padding: 32px;
          border-radius: 24px;
          position: relative;
          transition: all 0.3s ease;
        }

        .testimonial-quote {
          font-size: 4rem;
          color: #10b981;
          opacity: 0.3;
          position: absolute;
          top: 20px;
          left: 20px;
          font-family: Georgia, serif;
        }

        .testimonial-content {
          color: #4b5563;
          line-height: 1.6;
          margin-bottom: 20px;
          position: relative;
          z-index: 1;
        }

        .testimonial-rating {
          display: flex;
          gap: 4px;
          margin-bottom: 20px;
        }

        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .author-avatar {
          width: 48px;
          height: 48px;
          background: #e5e7eb;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
        }

        .author-name {
          font-weight: 700;
          color: #1f2937;
        }

        .author-role {
          font-size: 0.85rem;
          color: #6b7280;
        }

        /* CTA SECTION */
        .cta-section {
          padding: 80px 0;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          position: relative;
          overflow: hidden;
        }

        .cta-particles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .cta-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: white;
          border-radius: 50%;
          opacity: 0.2;
          animation: floatUp linear infinite;
        }

        @keyframes floatUp {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.2;
          }
          90% {
            opacity: 0.2;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }

        .cta-content {
          text-align: center;
          color: white;
          position: relative;
          z-index: 1;
        }

        .cta-content h2 {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 16px;
        }

        .cta-content p {
          margin-bottom: 32px;
          opacity: 0.9;
        }

        .cta-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
        }

        .btn-large {
          padding: 16px 40px;
          font-size: 1.1rem;
        }

        .btn-outline-light {
          padding: 16px 32px;
          border: 2px solid white;
          color: white;
          text-decoration: none;
          border-radius: 40px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .btn-outline-light:hover {
          background: white;
          color: #10b981;
          transform: translateY(-3px);
        }

        /* FOOTER */
        .footer {
          background: #1f2937;
          color: #9ca3af;
          position: relative;
          overflow: hidden;
        }

        .footer-wave {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          overflow: hidden;
          line-height: 0;
        }

        .footer-wave svg {
          position: relative;
          display: block;
          width: calc(100% + 1.3px);
          height: 60px;
        }

        .footer-wave svg path {
          fill: #ffffff;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.5fr;
          gap: 48px;
          margin-bottom: 40px;
          position: relative;
          z-index: 1;
          padding-top: 80px;
        }

        .footer-brand .logo {
          margin-bottom: 16px;
        }

        .footer-brand .logo .logo-text {
          color: white;
        }

        .footer-brand p {
          margin-bottom: 20px;
          line-height: 1.6;
        }

        .social-links {
          display: flex;
          gap: 16px;
        }

        .social-links a {
          color: #9ca3af;
          transition: all 0.3s ease;
        }

        .footer-links h4,
        .footer-contact h4 {
          color: white;
          font-size: 1rem;
          margin-bottom: 20px;
        }

        .footer-links a {
          display: block;
          color: #9ca3af;
          text-decoration: none;
          margin-bottom: 12px;
          transition: all 0.3s ease;
        }

        .footer-links a:hover {
          color: #10b981;
          transform: translateX(5px);
        }

        .footer-contact p {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          transition: all 0.3s ease;
        }

        .footer-contact p:hover {
          transform: translateX(5px);
          color: #10b981;
        }

        .footer-bottom {
          text-align: center;
          padding-top: 30px;
          border-top: 1px solid #374151;
        }

        /* RESPONSIVE */
        @media (max-width: 1024px) {
          .features-grid,
          .destinations-grid,
          .testimonials-grid,
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .footer-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block;
          }
          
          .nav-links {
            position: fixed;
            top: 70px;
            left: -100%;
            width: 100%;
            height: calc(100vh - 70px);
            background: white;
            flex-direction: column;
            padding: 40px;
            transition: left 0.3s ease;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          }
          
          .nav-links.open {
            left: 0;
          }
          
          .nav-links a {
            color: #1f2937 !important;
          }
          
          .hero-content h1 {
            font-size: 2rem;
          }
          
          .hero-content p {
            font-size: 1rem;
          }
          
          .hero-buttons {
            flex-direction: column;
          }
          
          .features-grid,
          .destinations-grid,
          .testimonials-grid,
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .footer-grid {
            grid-template-columns: 1fr;
          }
          
          .cta-buttons {
            flex-direction: column;
            align-items: center;
          }

          .indicator {
            width: 30px;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;