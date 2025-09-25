"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import Card from '../Card';
import { Play, Pause, RotateCcw, Clock, Flame } from 'lucide-react';
const SessionTimer = ({ duration, onTimeUp, onPause, onResume, onReset, className }) => {
    const [timeRemaining, setTimeRemaining] = useState(duration * 60); // Convert to seconds
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    useEffect(() => {
        let interval;
        if (isRunning && !isPaused && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        setIsRunning(false);
                        onTimeUp?.();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (interval)
                clearInterval(interval);
        };
    }, [isRunning, isPaused, timeRemaining, onTimeUp]);
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };
    const getProgressPercentage = () => {
        return ((duration * 60 - timeRemaining) / (duration * 60)) * 100;
    };
    const getTimeColor = () => {
        const percentage = getProgressPercentage();
        if (percentage < 25)
            return 'text-green-400';
        if (percentage < 50)
            return 'text-yellow-400';
        if (percentage < 75)
            return 'text-orange-400';
        return 'text-red-400';
    };
    const handleStart = () => {
        setIsRunning(true);
        setIsPaused(false);
    };
    const handlePause = () => {
        setIsPaused(true);
        setIsRunning(false);
        onPause?.();
    };
    const handleResume = () => {
        setIsPaused(false);
        setIsRunning(true);
        onResume?.();
    };
    const handleReset = () => {
        setIsRunning(false);
        setIsPaused(false);
        setTimeRemaining(duration * 60);
        onReset?.();
    };
    const isTimeUp = timeRemaining === 0;
    const isLowTime = timeRemaining < 300; // Less than 5 minutes
    return (_jsxs(Card, { className: cn('p-6', className), children: [_jsxs("div", { className: "text-center mb-6", children: [_jsxs("div", { className: "flex items-center justify-center space-x-2 mb-2", children: [_jsx(Clock, { className: "w-6 h-6 text-teal-400" }), _jsx("h3", { className: "text-xl font-semibold text-white", children: "Session Timer" })] }), _jsx("div", { className: cn('text-4xl font-bold mb-2', getTimeColor()), children: formatTime(timeRemaining) }), _jsx("div", { className: "w-full bg-zinc-800 rounded-full h-3 mb-4", children: _jsx("div", { className: cn('h-3 rounded-full transition-all duration-1000', isTimeUp ? 'bg-red-500' : 'bg-teal-500'), style: { width: `${getProgressPercentage()}%` } }) }), isLowTime && !isTimeUp && (_jsxs("div", { className: "flex items-center justify-center space-x-2 text-orange-400 animate-pulse", children: [_jsx(Flame, { className: "w-4 h-4" }), _jsx("span", { className: "text-sm font-medium", children: "Time running low!" })] })), isTimeUp && (_jsxs("div", { className: "flex items-center justify-center space-x-2 text-red-400", children: [_jsx(Flame, { className: "w-4 h-4" }), _jsx("span", { className: "text-sm font-medium", children: "Session Complete!" })] }))] }), _jsxs("div", { className: "flex space-x-3", children: [!isRunning && !isPaused && (_jsxs("button", { onClick: handleStart, className: "flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2", children: [_jsx(Play, { className: "w-5 h-5" }), _jsx("span", { children: "Start Session" })] })), isRunning && (_jsxs("button", { onClick: handlePause, className: "flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2", children: [_jsx(Pause, { className: "w-5 h-5" }), _jsx("span", { children: "Pause" })] })), isPaused && (_jsxs("button", { onClick: handleResume, className: "flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2", children: [_jsx(Play, { className: "w-5 h-5" }), _jsx("span", { children: "Resume" })] })), _jsxs("button", { onClick: handleReset, className: "px-4 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2", children: [_jsx(RotateCcw, { className: "w-5 h-5" }), _jsx("span", { children: "Reset" })] })] }), _jsx("div", { className: "mt-4 text-center", children: _jsxs("p", { className: "text-sm text-zinc-400", children: ["Session Duration: ", duration, " minutes"] }) })] }));
};
export default SessionTimer;
