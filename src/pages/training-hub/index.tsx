import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Award, 
  FileText, 
  ChevronRight, 
  ChevronLeft,
  Check,
  X,
  RotateCcw,
  TrendingUp
} from 'lucide-react';
import { useContentData } from './hooks/useContentData';
import Card from './components/ui/Card';
import Button from './components/ui/Button';
import Badge from './components/ui/Badge';
import Spinner from './components/ui/Spinner';
import './styles/training-hub.css';
import confetti from 'canvas-confetti';

const PANELS = [
  { id: 'modules', label: 'Modules', icon: BookOpen },
  { id: 'quizzes', label: 'Quizzes', icon: Award },
  { id: 'flashcards', label: 'Flashcards', icon: FileText },
  { id: 'cheatsheet', label: 'Cheat Sheet', icon: TrendingUp }
];

const TrainingHub = () => {
  const { data, isLoading, error } = useContentData();
  const [activePanel, setActivePanel] = useState('modules');
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, any>>({});
  const [quizResult, setQuizResult] = useState<{ pass: boolean; score: number; total: number } | null>(null);
  const [flashIndex, setFlashIndex] = useState(0);
  const [flashFace, setFlashFace] = useState<'front' | 'back'>('front');
  const [visitedModules, setVisitedModules] = useState<string[]>([]);

  // Initialize selected module
  useEffect(() => {
    if (data && !selectedModuleId && data.modules.length > 0) {
      setSelectedModuleId(data.modules[0].id);
    }
  }, [data, selectedModuleId]);

  // Initialize selected quiz
  useEffect(() => {
    if (data && !selectedQuizId && data.quizzes.length > 0) {
      setSelectedQuizId(data.quizzes[0].id);
    }
  }, [data, selectedQuizId]);

  // Track visited modules
  useEffect(() => {
    if (selectedModuleId && !visitedModules.includes(selectedModuleId)) {
      setVisitedModules([...visitedModules, selectedModuleId]);
    }
  }, [selectedModuleId]);

  // Celebration confetti
  useEffect(() => {
    if (quizResult?.pass) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [quizResult]);

  const selectedModule = useMemo(() => {
    return data?.modules.find(m => m.id === selectedModuleId) || null;
  }, [data, selectedModuleId]);

  const selectedQuiz = useMemo(() => {
    return data?.quizzes.find(q => q.id === selectedQuizId) || null;
  }, [data, selectedQuizId]);

  const handleQuizSubmit = () => {
    if (!selectedQuiz) return;
    
    let correctCount = 0;
    selectedQuiz.items.forEach(item => {
      const answer = quizAnswers[item.id];
      if (item.type === 'multi') {
        const correctOptions = item.options.filter(opt => opt.correct).map(opt => opt.id);
        const providedOptions = answer || [];
        const correct = JSON.stringify([...correctOptions].sort());
        const provided = JSON.stringify([...providedOptions].sort());
        if (correct === provided) correctCount++;
      } else {
        const correctOption = item.options.find(opt => opt.correct);
        if (answer === correctOption?.id) correctCount++;
      }
    });

    const score = correctCount;
    const total = selectedQuiz.items.length;
    const pass = score / total >= 0.7;

    setQuizResult({ pass, score, total });
  };

  const resetQuiz = () => {
    setQuizStep(0);
    setQuizAnswers({});
    setQuizResult(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Content</h2>
          <p className="text-gray-600">{error.message}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Training <span className="bg-gradient-to-r from-brand to-brand-accent bg-clip-text text-transparent">Hub</span>
          </h1>
          <p className="text-lg text-gray-600">
            Enhance your financial knowledge with interactive lessons
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-brand/10 rounded-xl">
                <BookOpen className="w-6 h-6 text-brand" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Modules Visited</p>
                <p className="text-2xl font-bold text-gray-900">
                  {visitedModules.length} / {data?.modules.length || 0}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-brand-accent/10 rounded-xl">
                <Award className="w-6 h-6 text-brand-accent" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Quizzes Available</p>
                <p className="text-2xl font-bold text-gray-900">{data?.quizzes.length || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-brand-soft/50 rounded-xl">
                <FileText className="w-6 h-6 text-brand" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Flashcards</p>
                <p className="text-2xl font-bold text-gray-900">{data?.flashcards.length || 0}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Panel Tabs */}
        <motion.div
          className="flex gap-2 mb-6 overflow-x-auto pb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {PANELS.map((panel) => {
            const Icon = panel.icon;
            return (
              <button
                key={panel.id}
                onClick={() => setActivePanel(panel.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  activePanel === panel.id
                    ? 'bg-brand text-white shadow-soft'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                {panel.label}
              </button>
            );
          })}
        </motion.div>

        {/* Panel Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePanel}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activePanel === 'modules' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Module List */}
                <Card className="p-6 lg:col-span-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">All Modules</h3>
                  <div className="space-y-2">
                    {data?.modules.map((module) => (
                      <button
                        key={module.id}
                        onClick={() => setSelectedModuleId(module.id)}
                        className={`w-full text-left p-4 rounded-xl transition-all ${
                          selectedModuleId === module.id
                            ? 'bg-brand text-white'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold">{module.title}</p>
                            <p className={`text-sm mt-1 ${
                              selectedModuleId === module.id ? 'text-white/80' : 'text-gray-600'
                            }`}>
                              {module.objectives.length} objectives
                            </p>
                          </div>
                          {visitedModules.includes(module.id) && (
                            <Check className="w-5 h-5 flex-shrink-0 ml-2" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Module Detail */}
                {selectedModule && (
                  <Card className="p-8 lg:col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                      <Badge variant="primary">Module</Badge>
                      <Badge variant="info" size="sm">{selectedModule.estimatedTime}</Badge>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">{selectedModule.title}</h2>
                    <p className="text-lg text-gray-600 mb-6">{selectedModule.explanation}</p>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">Learning Objectives</h3>
                    <ul className="space-y-2 mb-6">
                      {selectedModule.objectives.map((obj, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{obj}</span>
                        </li>
                      ))}
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">Procedure Steps</h3>
                    <ol className="space-y-2 mb-6 list-decimal list-inside">
                      {selectedModule.procedureSteps.map((step, idx) => (
                        <li key={idx} className="text-gray-700 leading-relaxed">{step}</li>
                      ))}
                    </ol>

                    {selectedModule.edgeCases && selectedModule.edgeCases.length > 0 && (
                      <>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Edge Cases</h3>
                        <div className="space-y-2 mb-6">
                          {selectedModule.edgeCases.map((edgeCase, idx) => (
                            <div key={idx} className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                              <p className="text-sm text-gray-800">{edgeCase}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    <h3 className="text-xl font-bold text-gray-900 mb-3">Key Takeaways</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedModule.takeaways.map((point, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-3 bg-brand-soft/30 rounded-lg">
                          <Check className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
                          <span className="text-sm font-medium text-gray-800">{point}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {activePanel === 'quizzes' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quiz List */}
                <Card className="p-6 lg:col-span-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">All Quizzes</h3>
                  <div className="space-y-2">
                    {data?.quizzes.map((quiz) => (
                      <button
                        key={quiz.id}
                        onClick={() => {
                          setSelectedQuizId(quiz.id);
                          setQuizStep(0);
                          setQuizAnswers({});
                          setQuizResult(null);
                        }}
                        className={`w-full text-left p-4 rounded-xl transition-all ${
                          selectedQuizId === quiz.id
                            ? 'bg-brand text-white'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-sm mb-1">{quiz.title}</p>
                            <p className={`text-xs ${
                              selectedQuizId === quiz.id ? 'text-white/80' : 'text-gray-600'
                            }`}>
                              {quiz.items.length} questions • {quiz.estimatedTime}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Quiz Detail */}
                {selectedQuiz && (
              <Card className="p-8 lg:col-span-2">
                {!quizResult ? (
                  <>
                    <Badge variant="primary" className="mb-4">Quiz</Badge>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedQuiz.title}</h2>
                    <p className="text-lg text-gray-600 mb-6">{selectedQuiz.description}</p>

                    <div className="mb-8">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progress</span>
                        <span>{quizStep + 1} / {selectedQuiz.items.length}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-brand h-2 rounded-full transition-all"
                          style={{ width: `${((quizStep + 1) / selectedQuiz.items.length) * 100}%` }}
                        />
                      </div>
                    </div>

                    {selectedQuiz.items[quizStep] && (
                      <div className="mb-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                          {selectedQuiz.items[quizStep].prompt}
                        </h3>
                        <div className="space-y-3">
                          {selectedQuiz.items[quizStep].options.map((option) => {
                            const item = selectedQuiz.items[quizStep];
                            const isMulti = item.type === 'multi';
                            const currentAnswer = quizAnswers[item.id];
                            const isSelected = isMulti
                              ? currentAnswer?.includes(option.id)
                              : currentAnswer === option.id;

                            return (
                              <button
                                key={option.id}
                                onClick={() => {
                                  if (isMulti) {
                                    const current = currentAnswer || [];
                                    const updated = current.includes(option.id)
                                      ? current.filter((o: string) => o !== option.id)
                                      : [...current, option.id];
                                    setQuizAnswers({ ...quizAnswers, [item.id]: updated });
                                  } else {
                                    setQuizAnswers({ ...quizAnswers, [item.id]: option.id });
                                  }
                                }}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                                  isSelected
                                    ? 'border-brand bg-brand/10'
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                    isSelected ? 'border-brand bg-brand' : 'border-gray-300'
                                  }`}>
                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                  </div>
                                  <span className="font-medium text-gray-900">{option.label}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4">
                      {quizStep > 0 && (
                        <Button
                          variant="ghost"
                          onClick={() => setQuizStep(quizStep - 1)}
                          icon={<ChevronLeft className="w-5 h-5" />}
                        >
                          Previous
                        </Button>
                      )}
                      {quizStep < selectedQuiz.items.length - 1 ? (
                        <Button
                          variant="primary"
                          onClick={() => setQuizStep(quizStep + 1)}
                          className="ml-auto"
                        >
                          Next
                          <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          onClick={handleQuizSubmit}
                          className="ml-auto"
                        >
                          Submit Quiz
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    {quizResult.pass ? (
                      <>
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Check className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Congratulations! 🎉</h2>
                        <p className="text-lg text-gray-600 mb-6">You passed the quiz!</p>
                      </>
                    ) : (
                      <>
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <X className="w-10 h-10 text-red-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Keep Learning</h2>
                        <p className="text-lg text-gray-600 mb-6">You can try again!</p>
                      </>
                    )}
                    <p className="text-4xl font-bold text-gray-900 mb-8">
                      {quizResult.score} / {quizResult.total}
                    </p>
                    <Button variant="primary" onClick={resetQuiz} icon={<RotateCcw className="w-5 h-5" />}>
                      Try Again
                    </Button>
                  </div>
                )}
              </Card>
                )}
              </div>
            )}

            {activePanel === 'flashcards' && data?.flashcards && data.flashcards.length > 0 && (
              <div className="max-w-2xl mx-auto">
                <Card className="p-8">
                  <div className="mb-6 text-center">
                    <p className="text-sm text-gray-600">
                      Card {flashIndex + 1} of {data.flashcards.length}
                    </p>
                  </div>

                  <motion.div
                    key={`${flashIndex}-${flashFace}`}
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: -90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gradient-to-br from-brand to-brand-accent text-white rounded-3xl p-12 min-h-[300px] flex items-center justify-center cursor-pointer"
                    onClick={() => setFlashFace(flashFace === 'front' ? 'back' : 'front')}
                  >
                    <p className="text-2xl font-semibold text-center">
                      {flashFace === 'front'
                        ? data.flashcards[flashIndex].front
                        : data.flashcards[flashIndex].back}
                    </p>
                  </motion.div>

                  <p className="text-center text-sm text-gray-600 mt-4">
                    Click card to flip
                  </p>

                  <div className="flex gap-4 mt-8">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setFlashIndex(Math.max(0, flashIndex - 1));
                        setFlashFace('front');
                      }}
                      disabled={flashIndex === 0}
                      icon={<ChevronLeft className="w-5 h-5" />}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => {
                        setFlashIndex(Math.min(data.flashcards.length - 1, flashIndex + 1));
                        setFlashFace('front');
                      }}
                      disabled={flashIndex === data.flashcards.length - 1}
                      className="ml-auto"
                    >
                      Next
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {activePanel === 'cheatsheet' && data?.cheatSheet && (
              <div className="space-y-6">
                {/* Scenarios */}
                {data.cheatSheet.scenarios && data.cheatSheet.scenarios.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Quick Reference Scenarios</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {data.cheatSheet.scenarios.map((scenario, idx) => (
                        <Card key={idx} className="p-6">
                          <h4 className="font-bold text-gray-900 mb-2">{scenario.title}</h4>
                          <p className="text-sm text-gray-700 mb-2">{scenario.summary}</p>
                          <p className="text-xs text-brand font-medium">{scenario.reference}</p>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Decision Trees */}
                {data.cheatSheet.decisionTrees && data.cheatSheet.decisionTrees.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Decision Trees</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {data.cheatSheet.decisionTrees.map((tree, idx) => (
                        <Card key={idx} className="p-6">
                          <h4 className="font-bold text-gray-900 mb-3">{tree.title}</h4>
                          <ol className="space-y-2 list-decimal list-inside">
                            {tree.steps.map((step, stepIdx) => (
                              <li key={stepIdx} className="text-sm text-gray-700 leading-relaxed">
                                {step}
                              </li>
                            ))}
                          </ol>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Thresholds */}
                {data.cheatSheet.thresholds && data.cheatSheet.thresholds.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Key Thresholds & Limits</h3>
                    <Card className="p-6">
                      <ul className="space-y-2">
                        {data.cheatSheet.thresholds.map((threshold, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">{threshold}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TrainingHub;
