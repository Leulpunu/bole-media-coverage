import React, { createContext, useState, useContext } from 'react';
import en from '../locales/en.json';
import am from '../locales/an.json';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'am' : 'en');
  };

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
  };

  const t = (key, fallback = '') => {
    const keys = key.split('.');
    let value = language === 'en' ? en : am;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || fallback;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
