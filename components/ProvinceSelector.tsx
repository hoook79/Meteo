import React, { useState, useEffect, useRef } from 'react';
import type { Provincia } from '../types';
import { PROVINCE_CYCLE, PROVINCE_COLORS } from '../constants';

interface ProvinceSelectorProps {
    currentProvince: Provincia;
    onProvinceChange: (province: Provincia) => void;
    disabled: boolean;
}

export const ProvinceSelector: React.FC<ProvinceSelectorProps> = ({ currentProvince, onProvinceChange, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const currentProvinceColors = PROVINCE_COLORS[currentProvince];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [wrapperRef]);
    
    const handleSelect = (province: Provincia) => {
        onProvinceChange(province);
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block text-left" ref={wrapperRef}>
            <div>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    disabled={disabled}
                    className="inline-flex items-center justify-center rounded-full px-3 py-1 bg-gray-800/60 text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-700/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    id="options-menu"
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                >
                    Prossima provincia:
                    <span className={`ml-2 inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${currentProvinceColors.bg} ${currentProvinceColors.text}`}>
                        {currentProvince}
                    </span>
                    <svg className={`-mr-1 ml-2 h-5 w-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            {isOpen && (
                <div
                    className="origin-bottom absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="options-menu"
                >
                    <div className="py-1" role="none">
                        {PROVINCE_CYCLE.map(province => (
                            <button
                                key={province}
                                onClick={() => handleSelect(province)}
                                className="w-full text-left block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                                role="menuitem"
                            >
                                {province}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};