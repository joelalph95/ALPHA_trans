import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher = () => {
  const { language, changeLanguage } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'mg', name: 'Malagasy', flag: '🇲🇬' },
  ];

  const currentLang = languages.find(l => l.code === language);

  return (
    <div className="language-switcher">
      <button 
        className="lang-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="lang-flag">{currentLang?.flag}</span>
        <span className="lang-name">{currentLang?.name}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="lang-dropdown">
          {languages.map(lang => (
            <button
              key={lang.code}
              className={`lang-option ${language === lang.code ? 'active' : ''}`}
              onClick={() => {
                changeLanguage(lang.code);
                setIsOpen(false);
              }}
            >
              <span className="lang-flag">{lang.flag}</span>
              <span className="lang-name">{lang.name}</span>
            </button>
          ))}
        </div>
      )}

      <style>{`
        .language-switcher {
          position: relative;
          margin-left: 1rem;
        }
        
        .lang-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.15);
          border: none;
          padding: 8px 12px;
          border-radius: 40px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.85rem;
        }
        
        .lang-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-2px);
        }
        
        .lang-flag {
          font-size: 1.1rem;
        }
        
        .lang-name {
          font-weight: 500;
        }
        
        .lang-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          min-width: 140px;
          z-index: 1000;
          animation: fadeInDown 0.2s ease;
        }
        
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .lang-option {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 16px;
          border: none;
          background: none;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.85rem;
          color: #333;
        }
        
        .lang-option:hover {
          background: #f5f5f5;
        }
        
        .lang-option.active {
          background: #e8f5e9;
          color: #2e7d32;
        }
        
        @media (max-width: 768px) {
          .lang-name {
            display: none;
          }
          .lang-btn {
            padding: 8px 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default LanguageSwitcher;