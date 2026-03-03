"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { cn } from '../../utils/cn';
import Card from '../Card';
import { Plus, Minus, Star, Heart } from 'lucide-react';
const FlavorSelector = ({ flavors, selectedFlavors, onSelectionChange, maxSelections = 3, className }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const categories = [
        { id: 'all', name: 'All Flavors' },
        { id: 'tobacco', name: 'Tobacco' },
        { id: 'herbal', name: 'Herbal' },
        { id: 'mixed', name: 'Mixed' }
    ];
    const intensityColors = {
        light: 'bg-green-500',
        medium: 'bg-yellow-500',
        strong: 'bg-red-500'
    };
    const filteredFlavors = flavors.filter(flavor => {
        const matchesSearch = flavor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            flavor.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || flavor.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    const handleFlavorToggle = (flavorId) => {
        if (selectedFlavors.includes(flavorId)) {
            onSelectionChange(selectedFlavors.filter(id => id !== flavorId));
        }
        else if (selectedFlavors.length < maxSelections) {
            onSelectionChange([...selectedFlavors, flavorId]);
        }
    };
    const getIntensityLabel = (intensity) => {
        switch (intensity) {
            case 'light': return 'Light';
            case 'medium': return 'Medium';
            case 'strong': return 'Strong';
            default: return intensity;
        }
    };
    return (_jsxs("div", { className: cn('space-y-6', className), children: [_jsxs("div", { className: "space-y-4", children: [_jsx("input", { type: "text", placeholder: "Search flavors...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-teal-500 transition-colors" }), _jsx("div", { className: "flex space-x-2", children: categories.map(category => (_jsx("button", { onClick: () => setSelectedCategory(category.id), className: cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors', selectedCategory === category.id
                                ? 'bg-teal-600 text-white'
                                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'), children: category.name }, category.id))) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "text-sm text-zinc-400", children: [selectedFlavors.length, " of ", maxSelections, " selected"] }), selectedFlavors.length > 0 && (_jsx("button", { onClick: () => onSelectionChange([]), className: "text-sm text-teal-400 hover:text-teal-300 transition-colors", children: "Clear All" }))] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: filteredFlavors.map(flavor => {
                    const isSelected = selectedFlavors.includes(flavor.id);
                    const canSelect = !isSelected && selectedFlavors.length < maxSelections;
                    return (_jsxs(Card, { className: cn('cursor-pointer transition-all duration-200 hover:shadow-lg', isSelected
                            ? 'border-teal-500 bg-teal-500/10'
                            : canSelect
                                ? 'hover:border-teal-500/50'
                                : 'opacity-50 cursor-not-allowed'), onClick: () => canSelect && handleFlavorToggle(flavor.id), children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("h3", { className: "font-semibold text-white", children: flavor.name }), flavor.isPopular && (_jsx(Star, { className: "w-4 h-4 text-yellow-400 fill-current" })), flavor.isFavorite && (_jsx(Heart, { className: "w-4 h-4 text-red-400 fill-current" }))] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: cn('w-2 h-2 rounded-full', intensityColors[flavor.intensity]) }), _jsx("span", { className: "text-xs text-zinc-400", children: getIntensityLabel(flavor.intensity) })] })] }), _jsx("p", { className: "text-sm text-zinc-400 mb-3", children: flavor.description }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "text-lg font-bold text-teal-400", children: ["$", flavor.price.toFixed(2)] }), isSelected ? (_jsxs("div", { className: "flex items-center space-x-1 text-teal-400", children: [_jsx(Minus, { className: "w-4 h-4" }), _jsx("span", { className: "text-sm", children: "Selected" })] })) : canSelect ? (_jsxs("div", { className: "flex items-center space-x-1 text-zinc-400", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { className: "text-sm", children: "Add" })] })) : (_jsx("span", { className: "text-sm text-zinc-500", children: "Max reached" }))] })] }, flavor.id));
                }) }), filteredFlavors.length === 0 && (_jsx("div", { className: "text-center py-8", children: _jsx("p", { className: "text-zinc-400", children: "No flavors found matching your search." }) }))] }));
};
export default FlavorSelector;
