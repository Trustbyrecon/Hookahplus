"use client";

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle, 
  BookOpen, 
  Users, 
  Target,
  Clock,
  Star,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react';

interface TrainingStep {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'interactive' | 'quiz' | 'practice';
  duration: number; // in minutes
  content: any;
  completed: boolean;
}

interface StaffTrainingWorkflowProps {
  layout: any;
  onComplete: () => void;
}

export function StaffTrainingWorkflow({ layout, onComplete }: StaffTrainingWorkflowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [showAnswers, setShowAnswers] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: string }>({});
  const [trainingProgress, setTrainingProgress] = useState(0);

  const trainingSteps: TrainingStep[] = [
    {
      id: 'intro',
      title: 'Welcome to Visual Grounder Training',
      description: 'Learn how to use the AI-powered layout system',
      type: 'video',
      duration: 2,
      content: {
        videoUrl: '/training/intro.mp4',
        transcript: 'Welcome to the Visual Grounder training program. This system uses AI to create optimal seating layouts for your lounge.'
      },
      completed: false
    },
    {
      id: 'zones',
      title: 'Understanding Zones',
      description: 'Learn about different zone types and their purposes',
      type: 'interactive',
      duration: 5,
      content: {
        zones: layout?.zones || [],
        interactive: true
      },
      completed: false
    },
    {
      id: 'table_management',
      title: 'Table Management Integration',
      description: 'How zones become tables in the system',
      type: 'practice',
      duration: 8,
      content: {
        practiceMode: true,
        scenarios: [
          'Assign a customer to a VIP table',
          'Move a group from bar to booth',
          'Handle table capacity overflow'
        ]
      },
      completed: false
    },
    {
      id: 'quiz',
      title: 'Knowledge Check',
      description: 'Test your understanding of the system',
      type: 'quiz',
      duration: 3,
      content: {
        questions: [
          {
            id: 'q1',
            question: 'What is the primary benefit of AI-generated layouts?',
            options: ['Faster setup', 'Optimized customer flow', 'Lower costs', 'Easier maintenance'],
            correct: 1
          },
          {
            id: 'q2',
            question: 'How many zones does this layout have?',
            options: ['3', '4', '5', '6'],
            correct: layout?.zones?.length - 1 || 0
          },
          {
            id: 'q3',
            question: 'What should you do if a zone is locked?',
            options: ['Unlock it', 'Leave it alone', 'Delete it', 'Move it'],
            correct: 1
          }
        ]
      },
      completed: false
    }
  ];

  const totalDuration = trainingSteps.reduce((sum, step) => sum + step.duration, 0);

  useEffect(() => {
    const progress = (completedSteps.size / trainingSteps.length) * 100;
    setTrainingProgress(progress);
  }, [completedSteps, trainingSteps.length]);

  const handleStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set(Array.from(prev).concat(stepId)));
  };

  const handleNext = () => {
    if (currentStep < trainingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleQuizAnswer = (questionId: string, answer: string) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="w-5 h-5" />;
      case 'interactive': return <Target className="w-5 h-5" />;
      case 'practice': return <Users className="w-5 h-5" />;
      case 'quiz': return <BookOpen className="w-5 h-5" />;
      default: return <CheckCircle className="w-5 h-5" />;
    }
  };

  const renderCurrentStep = () => {
    const step = trainingSteps[currentStep];
    
    switch (step.type) {
      case 'video':
        return (
          <div className="space-y-4">
            <div className="aspect-video bg-zinc-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Play className="w-16 h-16 text-teal-400 mx-auto mb-4" />
                <p className="text-zinc-400">Training Video</p>
                <p className="text-sm text-zinc-500">{step.content.transcript}</p>
              </div>
            </div>
            <button
              onClick={() => handleStepComplete(step.id)}
              className="w-full btn-pretty-primary"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark as Complete
            </button>
          </div>
        );

      case 'interactive':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {step.content.zones.map((zone: any) => (
                <div
                  key={zone.id}
                  className="p-4 bg-zinc-800 rounded-lg border border-zinc-700"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: getZoneColor(zone.color) }}
                    />
                    <span className="font-medium text-white">{zone.name}</span>
                  </div>
                  <p className="text-sm text-zinc-400">{zone.type}</p>
                  <p className="text-xs text-zinc-500">Capacity: {zone.capacity}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => handleStepComplete(step.id)}
              className="w-full btn-pretty-primary"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              I Understand Zones
            </button>
          </div>
        );

      case 'practice':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Practice Scenarios</h3>
            <div className="space-y-3">
              {step.content.scenarios.map((scenario: string, index: number) => (
                <div key={index} className="p-4 bg-zinc-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <span className="text-zinc-300">{scenario}</span>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => handleStepComplete(step.id)}
              className="w-full btn-pretty-primary"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Practice Complete
            </button>
          </div>
        );

      case 'quiz':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Knowledge Check</h3>
            <div className="space-y-4">
              {step.content.questions.map((question: any, index: number) => (
                <div key={question.id} className="p-4 bg-zinc-800 rounded-lg">
                  <p className="text-white font-medium mb-3">
                    {index + 1}. {question.question}
                  </p>
                  <div className="space-y-2">
                    {question.options.map((option: string, optionIndex: number) => {
                      const isSelected = quizAnswers[question.id] === option;
                      const isCorrect = optionIndex === question.correct;
                      const showCorrect = showAnswers && isCorrect;
                      const showIncorrect = showAnswers && isSelected && !isCorrect;
                      
                      return (
                        <label
                          key={optionIndex}
                          className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-teal-500/20 border border-teal-500'
                              : 'bg-zinc-700 hover:bg-zinc-600'
                          } ${showCorrect ? 'bg-green-500/20 border border-green-500' : ''} ${
                            showIncorrect ? 'bg-red-500/20 border border-red-500' : ''
                          }`}
                        >
                          <input
                            type="radio"
                            name={question.id}
                            value={option}
                            checked={isSelected}
                            onChange={(e) => handleQuizAnswer(question.id, e.target.value)}
                            className="w-4 h-4 text-teal-600"
                          />
                          <span className="text-zinc-300">{option}</span>
                          {showCorrect && <CheckCircle className="w-4 h-4 text-green-400" />}
                          {showIncorrect && <AlertCircle className="w-4 h-4 text-red-400" />}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowAnswers(!showAnswers)}
                className="btn-pretty-secondary"
              >
                {showAnswers ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showAnswers ? 'Hide Answers' : 'Show Answers'}
              </button>
              <button
                onClick={() => handleStepComplete(step.id)}
                className="btn-pretty-primary"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Quiz
              </button>
            </div>
          </div>
        );

      default:
        return <div>Unknown step type</div>;
    }
  };

  const getZoneColor = (color: string) => {
    const colors: { [key: string]: string } = {
      orange: '#f97316',
      blue: '#3b82f6',
      green: '#10b981',
      purple: '#8b5cf6',
      gray: '#6b7280'
    };
    return colors[color] || '#6b7280';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-teal-400 mb-2">Staff Training Workflow</h2>
        <p className="text-zinc-400">Learn how to use the Visual Grounder system effectively</p>
      </div>

      {/* Progress */}
      <div className="bg-zinc-800/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-zinc-400">Training Progress</span>
          <span className="text-sm text-teal-400">{Math.round(trainingProgress)}% Complete</span>
        </div>
        <div className="w-full bg-zinc-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-teal-400 to-cyan-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${trainingProgress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-zinc-500">
          <span>0 min</span>
          <span>{totalDuration} min total</span>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {trainingSteps.map((step, index) => (
            <div
              key={step.id}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                index === currentStep
                  ? 'bg-teal-500 text-white'
                  : completedSteps.has(step.id)
                  ? 'bg-green-500 text-white'
                  : 'bg-zinc-700 text-zinc-400'
              }`}
            >
              {completedSteps.has(step.id) ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="btn-pretty-outline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </button>
          <button
            onClick={handleNext}
            className="btn-pretty-primary"
          >
            {currentStep === trainingSteps.length - 1 ? 'Complete' : 'Next'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

      {/* Current Step */}
      <div className="bg-zinc-800/50 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          {getStepIcon(trainingSteps[currentStep].type)}
          <div>
            <h3 className="text-lg font-semibold text-white">
              {trainingSteps[currentStep].title}
            </h3>
            <p className="text-sm text-zinc-400">
              {trainingSteps[currentStep].description} • {trainingSteps[currentStep].duration} min
            </p>
          </div>
        </div>
        
        {renderCurrentStep()}
      </div>
    </div>
  );
}
