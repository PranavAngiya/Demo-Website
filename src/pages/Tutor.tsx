import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  DollarSign, 
  TrendingUp, 
  Receipt, 
  Shield, 
  Unlock, 
  Calculator, 
  Target, 
  FileText, 
  Lightbulb,
  Lock,
  Clock,
  CheckCircle,
  PlayCircle
} from 'lucide-react';
import tutorData from '../data/tutorLessons.json';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useToast } from '../context/ToastContext';

const Tutor = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Icon mapping
  const iconMap: { [key: string]: any } = {
    GraduationCap,
    DollarSign,
    TrendingUp,
    Receipt,
    Shield,
    Unlock,
    Calculator,
    Target,
    FileText,
    Lightbulb
  };

  const handleLessonClick = (lesson: any) => {
    if (!lesson.isUnlocked) {
      showToast('Complete previous lessons to unlock this one!', 'warning');
      return;
    }
    
    // Navigate to lesson detail page
    navigate(`/client/learning/lesson/${lesson.id}`);
  };

  const { completedLessons, totalLessons, overallProgress } = tutorData.userProgress;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-8 space-y-12">
        
        {/* Hero Section */}
        <motion.section
          className="relative overflow-hidden rounded-3xl p-8 md:p-16 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Animated Background Orbs */}
          <motion.div
            className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-yellow-400/30 to-orange-500/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-br from-blue-400/30 to-cyan-500/30 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          <div className="relative z-10 text-center">
            {/* Icon */}
            <motion.div
              className="inline-block p-6 bg-white/20 backdrop-blur-sm rounded-3xl mb-6 shadow-2xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <GraduationCap className="w-20 h-20 text-white" />
            </motion.div>

            {/* Title */}
            <motion.h1
              className="text-5xl md:text-6xl font-display font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Master Your Financial Future
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              10 interactive lessons designed to help you understand and optimize your superannuation
            </motion.p>

            {/* Progress Ring & Stats */}
            <motion.div
              className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {/* Progress Ring */}
              <div className="relative">
                <svg className="w-32 h-32 transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="8"
                    fill="none"
                  />
                  {/* Progress circle */}
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="white"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - overallProgress / 100) }}
                    transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{overallProgress}%</span>
                  <span className="text-sm text-white/80">Complete</span>
                </div>
              </div>

              {/* Stats */}
              <div className="text-left space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span className="text-lg">{completedLessons} of {totalLessons} lessons completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-300" />
                  <span className="text-lg">{tutorData.userProgress.timeSpent} minutes of learning</span>
                </div>
                <div className="flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-yellow-300" />
                  <span className="text-lg">Currently on Lesson {tutorData.lessons.find(l => l.id === tutorData.userProgress.currentLesson)?.number}</span>
                </div>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Button
                variant="ghost"
                size="lg"
                icon={<PlayCircle className="w-6 h-6" />}
                onClick={() => handleLessonClick(tutorData.lessons.find(l => l.id === tutorData.userProgress.currentLesson))}
                className="shadow-2xl text-xl px-10 py-4 bg-white/95 hover:bg-white text-purple-600 hover:text-purple-700 backdrop-blur-sm"
              >
                Continue Learning
              </Button>
            </motion.div>
          </div>
        </motion.section>

        {/* Lesson Grid */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Learning Path</h2>
              <p className="text-gray-600">Click any unlocked lesson to start learning</p>
            </div>
            <Badge variant="primary" size="lg" className="hidden md:block">
              {completedLessons}/{totalLessons} Complete
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutorData.lessons.map((lesson, index) => {
              const Icon = iconMap[lesson.icon];
              const isLocked = !lesson.isUnlocked;

              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                  whileHover={{ y: isLocked ? 0 : -8, scale: isLocked ? 1 : 1.02 }}
                >
                  <Card
                    variant="solid"
                    className={`relative h-full p-6 border-2 border-gray-100 overflow-hidden cursor-pointer ${
                      isLocked ? 'opacity-60' : 'hover:shadow-2xl'
                    } transition-all duration-300`}
                    onClick={() => handleLessonClick(lesson)}
                  >
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${lesson.gradient} opacity-10`} />

                    {/* Content */}
                    <div className="relative z-10">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        {/* Lesson Number Badge */}
                        <Badge 
                          variant="primary" 
                          size="sm"
                          className={`bg-gradient-to-r ${lesson.gradient} text-white border-0`}
                        >
                          Lesson {lesson.number}
                        </Badge>

                        {/* Status Icons */}
                        <div className="flex items-center gap-2">
                          {lesson.completed && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                          {isLocked && (
                            <Lock className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {/* Icon */}
                      <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${lesson.gradient} shadow-lg mb-4`}>
                        <Icon className="w-12 h-12 text-white" />
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                        {lesson.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 mb-4 line-clamp-2 min-h-[3rem]">
                        {lesson.description}
                      </p>

                      {/* Duration */}
                      <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{lesson.duration}</span>
                      </div>

                      {/* Progress Bar */}
                      {!isLocked && (
                        <div className="space-y-2">
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <motion.div
                              className={`h-full bg-gradient-to-r ${lesson.gradient} rounded-full`}
                              initial={{ width: 0 }}
                              animate={{ width: `${lesson.progress}%` }}
                              transition={{ delay: 0.5 + index * 0.1, duration: 1, ease: 'easeOut' }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>{lesson.progress}% complete</span>
                            {lesson.completed && <span className="text-green-600 font-semibold">✓ Completed</span>}
                          </div>
                        </div>
                      )}

                      {/* Lock Message */}
                      {isLocked && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Lock className="w-4 h-4" />
                          <span>Complete previous lessons to unlock</span>
                        </div>
                      )}
                    </div>

                    {/* Hover Glow Effect */}
                    {!isLocked && (
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-br ${lesson.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                      />
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Tutor;
