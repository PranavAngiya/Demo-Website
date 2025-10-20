import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Circle,
  Award,
  Clock,
  BookOpen,
  Trophy
} from 'lucide-react';
import tutorData from '../data/tutorLessons.json';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import { useToast } from '../context/ToastContext';
import ConfettiCanvas from '../components/animations/ConfettiCanvas';

// Sample lesson content (in real app, this would come from API/CMS)
const lessonContent: { [key: string]: any } = {
  'lesson-001': {
    type: 'text',
    sections: [
      {
        title: 'What is Superannuation?',
        content: 'Superannuation (or "super") is a long-term savings plan designed to help Australians save for retirement. It\'s one of the most tax-effective ways to build wealth for your future.'
      },
      {
        title: 'How Does Super Work?',
        content: 'Your employer is legally required to pay a percentage of your salary into your super fund - this is called the Superannuation Guarantee. Currently, employers must contribute 11% of your ordinary time earnings, and this will increase to 12% by July 2025.'
      },
      {
        title: 'Key Benefits of Super',
        content: 'Super offers several advantages: lower tax rates on contributions and earnings, compound growth over decades, employer contributions on top of your salary, and government co-contributions for eligible members. The power of compounding means even small additional contributions can make a big difference over time.'
      },
      {
        title: 'Accessing Your Super',
        content: 'Generally, you can access your super when you reach your preservation age (between 55-60 depending on when you were born) and retire, or when you turn 65. There are limited circumstances where you can access it earlier, such as severe financial hardship or permanent disability.'
      }
    ]
  },
  'lesson-002': {
    type: 'quiz',
    questions: [
      {
        question: 'What is the current Superannuation Guarantee rate for 2024?',
        options: ['9%', '10%', '11%', '12%'],
        correctAnswer: 2,
        explanation: 'The Superannuation Guarantee rate is currently 11% (2024) and will increase to 12% by July 2025.'
      },
      {
        question: 'What are concessional contributions?',
        options: [
          'Contributions made from after-tax income',
          'Contributions made from pre-tax income',
          'Government co-contributions',
          'Employer penalty payments'
        ],
        correctAnswer: 1,
        explanation: 'Concessional contributions are made from pre-tax income, including employer contributions and salary sacrifice. They are taxed at 15% when entering your super fund.'
      },
      {
        question: 'What is the annual cap for concessional contributions in 2024?',
        options: ['$25,000', '$27,500', '$30,000', '$110,000'],
        correctAnswer: 2,
        explanation: 'From 1 July 2024, the concessional contribution cap is $30,000 per year.'
      },
      {
        question: 'Which of these is NOT a way to boost your super?',
        options: [
          'Salary sacrifice',
          'Personal after-tax contributions',
          'Spouse contributions',
          'Withdrawing early'
        ],
        correctAnswer: 3,
        explanation: 'Withdrawing super early actually reduces your balance. The other options all help boost your super savings.'
      },
      {
        question: 'What is the benefit of making non-concessional contributions?',
        options: [
          'They are tax-deductible',
          'They are taxed at 30%',
          'They are not taxed when entering super',
          'They count toward the concessional cap'
        ],
        correctAnswer: 2,
        explanation: 'Non-concessional (after-tax) contributions are not taxed again when they enter your super fund, as you\'ve already paid tax on this income.'
      }
    ]
  },
  'lesson-003': {
    type: 'text',
    sections: [
      {
        title: 'Understanding Investment Options',
        content: 'Your super fund offers different investment options to match your risk tolerance and time horizon. Each option invests in different asset classes like shares, property, bonds, and cash in varying proportions.'
      },
      {
        title: 'Risk vs Return',
        content: 'Generally, higher-risk investments (like shares) offer the potential for higher returns over the long term, but with more short-term volatility. Lower-risk investments (like cash and bonds) are more stable but typically deliver lower returns. Your choice should depend on your age, retirement timeline, and comfort with market fluctuations.'
      },
      {
        title: 'Common Investment Options',
        content: 'Conservative options (20-30% growth assets) suit those close to retirement or risk-averse. Balanced options (60-70% growth assets) offer moderate risk and return. Growth options (85% growth assets) maximize long-term returns with higher volatility. High Growth (100% growth assets) is for those comfortable with significant market swings for maximum growth potential.'
      },
      {
        title: 'Reviewing Your Strategy',
        content: 'It\'s important to review your investment strategy regularly, especially after major life events. As you get closer to retirement, you might consider gradually moving to more conservative options to protect your accumulated savings from market volatility.'
      }
    ]
  }
};

const LessonDetail = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const lesson = tutorData.lessons.find(l => l.id === lessonId);
  const content = lessonContent[lessonId || ''];
  
  const [currentSection, setCurrentSection] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Reset state when lesson changes
  useEffect(() => {
    setCurrentSection(0);
    setQuizAnswers({});
    setShowResults(false);
  }, [lessonId]);

  useEffect(() => {
    if (!lesson || !content) {
      showToast('Lesson not found', 'error');
      navigate('/tutor');
    }
  }, [lesson, content, navigate, showToast]);

  // Safety check - prevent white screen (MUST be before any content access)
  if (!lesson || !content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Loading lesson...</p>
        </div>
      </div>
    );
  }

  // Safe to access content properties now
  const totalSections = content.type === 'text' ? content.sections.length : content.questions.length;
  const progress = ((currentSection + 1) / totalSections) * 100;

  const handleNext = () => {
    if (currentSection < totalSections - 1) {
      setCurrentSection(prev => prev + 1);
    } else {
      // Only auto-complete for text lessons
      // Quizzes need explicit Submit Quiz button
      if (content.type === 'text') {
        handleComplete();
      }
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  };

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    setQuizAnswers(prev => ({ ...prev, [questionIndex]: answerIndex }));
  };

  const handleQuizSubmit = () => {
    setShowResults(true);
    const score = calculateScore();
    const percentage = Math.round((score / content.questions.length) * 100);
    
    // Perfect score = confetti! 🎉
    if (percentage === 100) {
      setShowConfetti(true);
      showToast(`🎉 Perfect score! You're a superstar!`, 'success');
    } else if (percentage >= 80) {
      showToast(`Great job! You scored ${percentage}%`, 'success');
    } else {
      showToast(`You scored ${percentage}%. Try reviewing the material and retake the quiz.`, 'warning');
    }
  };

  const calculateScore = () => {
    let correct = 0;
    content.questions.forEach((q: any, i: number) => {
      if (quizAnswers[i] === q.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const handleComplete = () => {
    const currentLessonNumber = lesson.number;
    showToast(`🎉 Lesson ${currentLessonNumber} completed!`, 'success');
    
    // Navigate to next lesson or back to tutor home
    const nextLesson = tutorData.lessons.find(l => l.number === currentLessonNumber + 1);
    
    console.log('Completing lesson:', currentLessonNumber);
    console.log('Next lesson found:', nextLesson);
    console.log('Next lesson has content:', nextLesson ? lessonContent[nextLesson.id] : 'N/A');
    
    const nextLessonHasContent = nextLesson && lessonContent[nextLesson.id];
    
    if (nextLesson && nextLesson.isUnlocked && nextLessonHasContent) {
      console.log('Navigating to next lesson:', nextLesson.id);
      setTimeout(() => {
        navigate(`/tutor/lesson/${nextLesson.id}`, { replace: true });
      }, 1500);
    } else {
      console.log('Going back to tutor home');
      setTimeout(() => {
        navigate('/tutor', { replace: true });
      }, 1500);
    }
  };

  const renderTextLesson = () => {
    // Safety check
    if (!content || !content.sections || !content.sections[currentSection]) {
      return (
        <div className="text-center text-gray-600">
          <p>Content not available</p>
        </div>
      );
    }
    
    const section = content.sections[currentSection];
    
    return (
      <motion.div
        key={currentSection}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-6 h-6 text-primary" />
          <Badge variant="primary" size="sm">
            Section {currentSection + 1} of {totalSections}
          </Badge>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-6">{section.title}</h2>
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed text-lg">
            {section.content}
          </p>
        </div>
      </motion.div>
    );
  };

  const renderQuiz = () => {
    // Safety check
    if (!content || !content.questions) {
      return (
        <div className="text-center text-gray-600">
          <p>Quiz content not available</p>
        </div>
      );
    }
    
    if (showResults) {
      const score = calculateScore();
      const percentage = Math.round((score / content.questions.length) * 100);
      const passed = percentage >= 80;
      
      // Scroll to top when results show
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8"
        >
          <div className={`inline-flex p-8 rounded-full ${passed ? 'bg-green-100' : 'bg-yellow-100'}`}>
            {passed ? (
              <Trophy className="w-24 h-24 text-green-600" />
            ) : (
              <Award className="w-24 h-24 text-yellow-600" />
            )}
          </div>
          
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              {passed ? 'Excellent Work!' : 'Good Effort!'}
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              You scored {score} out of {content.questions.length} ({percentage}%)
            </p>
            
            {passed ? (
              <Badge variant="success" size="lg" className="text-lg px-6 py-3">
                ✓ Quiz Passed
              </Badge>
            ) : (
              <Badge variant="warning" size="lg" className="text-lg px-6 py-3">
                Review and try again (80% required)
              </Badge>
            )}
          </div>

          <div className="space-y-4 mt-8">
            {content.questions.map((q: any, i: number) => {
              const userAnswer = quizAnswers[i];
              const isCorrect = userAnswer !== undefined && userAnswer === q.correctAnswer;
              const wasAnswered = userAnswer !== undefined;
              
              return (
                <Card key={i} variant="solid" className="p-6 text-left border-2">
                  <div className="flex items-start gap-4">
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    ) : (
                      <Circle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-2">{q.question}</p>
                      <p className={`text-sm mb-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        Your answer: {wasAnswered ? q.options[userAnswer] : 'Not answered'}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-gray-600 mb-2">
                          Correct answer: {q.options[q.correctAnswer]}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="flex gap-4 justify-center mt-8">
            {!passed && (
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  setShowResults(false);
                  setQuizAnswers({});
                  setCurrentSection(0);
                }}
              >
                Retake Quiz
              </Button>
            )}
            <Button
              variant="primary"
              size="lg"
              onClick={handleComplete}
            >
              Continue
            </Button>
          </div>
        </motion.div>
      );
    }

    const question = content.questions[currentSection];
    
    // Another safety check for the specific question
    if (!question) {
      return (
        <div className="text-center text-gray-600">
          <p>Question not available</p>
        </div>
      );
    }
    
    const allAnswered = content.questions.every((_: any, i: number) => quizAnswers[i] !== undefined);
    
    return (
      <motion.div
        key={currentSection}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between mb-6">
          <Badge variant="primary" size="sm">
            Question {currentSection + 1} of {totalSections}
          </Badge>
          <Badge variant="default" size="sm">
            {Object.keys(quizAnswers).length} / {totalSections} Answered
          </Badge>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-8">{question.question}</h2>
        
        <div className="space-y-3">
          {question.options.map((option: string, index: number) => {
            const isSelected = quizAnswers[currentSection] === index;
            
            return (
              <motion.button
                key={index}
                onClick={() => handleQuizAnswer(currentSection, index)}
                className={`w-full p-6 text-left rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-primary bg-primary' : 'border-gray-300'
                  }`}>
                    {isSelected && <div className="w-3 h-3 bg-white rounded-full" />}
                  </div>
                  <span className="text-lg text-gray-900">{option}</span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {currentSection === totalSections - 1 && allAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Button
              variant="success"
              size="lg"
              fullWidth
              onClick={handleQuizSubmit}
            >
              Submit Quiz
            </Button>
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/tutor')}
            className="mb-4"
          >
            Back to Lessons
          </Button>
          
          <div className="flex items-start gap-6">
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${lesson.gradient} shadow-lg`}>
              <BookOpen className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="primary" size="sm">Lesson {lesson.number}</Badge>
                <Badge variant="default" size="sm" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {lesson.duration}
                </Badge>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
              <p className="text-lg text-gray-600">{lesson.description}</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <Card variant="solid" className="p-6 mb-8 border-2 border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">Lesson Progress</span>
            <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
          </div>
          <ProgressBar
            value={progress}
            size="lg"
            animated
            striped
            color="primary"
          />
        </Card>

        {/* Content */}
        <Card variant="gradient" className="p-8 md:p-12 mb-8 border-2 border-gray-100">
          <AnimatePresence mode="wait">
            {content.type === 'text' ? renderTextLesson() : renderQuiz()}
          </AnimatePresence>
        </Card>

        {/* Navigation */}
        {!showResults && (
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="lg"
              icon={<ArrowLeft className="w-5 h-5" />}
              onClick={handlePrevious}
              disabled={currentSection === 0}
            >
              Previous
            </Button>
            
            <div className="flex gap-2">
              {Array.from({ length: totalSections }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSection(i)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i === currentSection
                      ? 'bg-primary w-8'
                      : i < currentSection
                      ? 'bg-primary/50'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            {/* Only show Next/Complete button for text lessons */}
            {content.type === 'text' && (
              <Button
                variant="primary"
                size="lg"
                icon={<ArrowRight className="w-5 h-5" />}
                onClick={handleNext}
              >
                {currentSection === totalSections - 1 ? 'Complete' : 'Next'}
              </Button>
            )}
            
            {/* For quizzes, show Next button but disable if not answered */}
            {content.type === 'quiz' && (
              <Button
                variant="primary"
                size="lg"
                icon={<ArrowRight className="w-5 h-5" />}
                onClick={handleNext}
                disabled={quizAnswers[currentSection] === undefined}
              >
                Next
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Confetti for perfect quiz scores! */}
      <ConfettiCanvas 
        active={showConfetti} 
        duration={4000}
        onComplete={() => setShowConfetti(false)}
      />
    </div>
  );
};

export default LessonDetail;
