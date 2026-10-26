'use client';
import { useState, useEffect } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';

export function ProfileNav() {
  const [activeTab, setActiveTab] = useState('business-section');
  const sections = ['business-section', 'regional-section', 'contact-section', 'signature-section', 'bank-details-section', 'security-section'];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 120;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveTab(id);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      let current = activeTab;
      sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 140) {
            current = section;
          }
        }
      });
      if (current !== activeTab) {
        setActiveTab(current);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab, sections]);

  const tabs = [
    { id: 'business-section', label: 'Business', icon: 'business' },
    { id: 'regional-section', label: 'Regional', icon: 'language' },
    { id: 'contact-section', label: 'Contact', icon: 'contact_mail' },
    { id: 'signature-section', label: 'Signature', icon: 'draw' },
    { id: 'bank-details-section', label: 'Payments', icon: 'payments' },
    { id: 'security-section', label: 'Security', icon: 'security' },
  ];

  return (
    <div className="sticky top-16 bg-surface border-b border-outline-variant z-40 overflow-x-auto no-scrollbar -mx-margin-mobile px-margin-mobile md:mx-0 md:px-0">
      <div className="max-w-[800px] mx-auto flex">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button 
              key={tab.id}
              onClick={() => scrollToSection(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-label-sm font-label-sm whitespace-nowrap border-b-2 hover:bg-surface-container transition-all ${
                isActive ? 'border-primary text-primary bg-surface-container' : 'border-transparent text-on-surface-variant'
              }`}
            >
              <MaterialIcon icon={tab.icon} className="text-[20px]" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
