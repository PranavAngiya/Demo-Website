import { motion } from 'framer-motion';
import {
  Trophy,
  Target,
  Flame,
  Zap,
  Star,
  Award,
  Calendar,
  TrendingUp,
  Lock,
  CheckCircle,
  GraduationCap,
  Sunrise,
  ThumbsUp,
  BookOpen,
  RefreshCw
} from 'lucide-react';
import achievementsData from '../data/achievements.json';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';

const Progress = () => {
  const { achievements, userProgress, levels, challenges } = achievementsData;
  
  const currentLevel = levels.find(l => l.level === userProgress.level);
  const nextLevel = levels.find(l => l.level === userProgress.level + 1);
  
  const iconMap: { [key: string]: any } = {
    Trophy,
    Target,
    Flame,
    Zap,
    Star,
    Award,
    Calendar,
    GraduationCap,
    Sunrise,
    ThumbsUp,
    BookOpen,
    RefreshCw
  };

  const rarityColors: { [key: string]: string } = {
    common: 'from-gray-500 to-slate-500',
    uncommon: 'from-green-500 to-emerald-500',
    rare: 'from-blue-500 to-cyan-500',
    epic: 'from-purple-500 to-pink-500',
    legendary: 'from-yellow-500 to-orange-500'
  };

  const rarityBadgeColors: { [key: string]: 'default' | 'success' | 'primary' | 'warning' | 'danger' } = {
    common: 'default',
    uncommon: 'success',
    rare: 'primary',
    epic: 'warning',
    legendary: 'danger'
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const progressPercent = (userProgress.totalPoints / userProgress.nextLevelAt) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        
        {/* Hero Section */}
        <motion.section
          className="relative overflow-hidden rounded-3xl p-8 md:p-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Animated Background */}
          <motion.div
            className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl"
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

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <motion.div
                className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Trophy className="w-12 h-12 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">Your Progress</h1>
                <p className="text-white/90 text-lg mt-1">Level {userProgress.level} • {currentLevel?.name}</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Points', value: userProgress.totalPoints.toLocaleString(), icon: Star },
                { label: 'Current Streak', value: `${userProgress.currentStreak} days`, icon: Flame },
                { label: 'Lessons Done', value: `${userProgress.lessonsCompleted}/10`, icon: GraduationCap },
                { label: 'Achievements', value: `${unlockedCount}/${achievements.length}`, icon: Award }
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <Icon className="w-6 h-6 mb-2 text-white/80" />
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-white/80">{stat.label}</div>
                  </motion.div>
                );
              })}
            </div>

            {/* Level Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold">Progress to Level {userProgress.level + 1}</span>
                <span className="text-sm">{userProgress.pointsToNextLevel} points to go</span>
              </div>
              <ProgressBar
                value={progressPercent}
                size="lg"
                animated
                striped
                color="primary"
                className="bg-white/20"
              />
            </motion.div>
          </div>
        </motion.section>

        {/* Challenges */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Target className="w-8 h-8 text-primary" />
            Active Challenges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {challenges.map((challenge, index) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card variant="solid" hover className="p-6 border-2 border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Badge variant={challenge.type === 'daily' ? 'primary' : 'success'} size="sm" className="mb-2">
                        {challenge.type === 'daily' ? '📅 Daily' : '📆 Weekly'}
                      </Badge>
                      <h3 className="text-xl font-bold text-gray-900">{challenge.title}</h3>
                      <p className="text-gray-600 mt-1">{challenge.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">+{challenge.reward}</div>
                      <div className="text-xs text-gray-500">points</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold text-gray-900">
                        {challenge.progress} / {challenge.target}
                      </span>
                    </div>
                    <ProgressBar
                      value={(challenge.progress / challenge.target) * 100}
                      size="md"
                      animated
                      color={challenge.completed ? 'success' : 'primary'}
                    />
                    <div className="text-xs text-gray-500">
                      Expires: {new Date(challenge.expiresAt).toLocaleDateString()}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Achievements */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Award className="w-8 h-8 text-primary" />
              Achievements
            </h2>
            <Badge variant="primary" size="lg">
              {unlockedCount} / {achievements.length} Unlocked
            </Badge>
          </div>

          {/* Filter tabs could go here */}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => {
              const Icon = iconMap[achievement.icon] || Trophy;
              const isLocked = !achievement.unlocked;
              const gradientClass = rarityColors[achievement.rarity];

              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: isLocked ? 0 : -4 }}
                >
                  <Card
                    variant="solid"
                    hover={!isLocked}
                    className={`relative h-full p-6 border-2 ${
                      isLocked ? 'opacity-60 border-gray-200' : 'border-gray-100'
                    } overflow-hidden`}
                  >
                    {/* Gradient Background */}
                    {!isLocked && (
                      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-5`} />
                    )}

                    <div className="relative z-10">
                      {/* Icon & Lock */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-4 rounded-2xl ${
                          isLocked
                            ? 'bg-gray-200'
                            : `bg-gradient-to-br ${gradientClass}`
                        } shadow-lg`}>
                          {isLocked ? (
                            <Lock className="w-8 h-8 text-gray-500" />
                          ) : (
                            <Icon className="w-8 h-8 text-white" />
                          )}
                        </div>
                        {!isLocked && (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        )}
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {achievement.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {achievement.description}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={rarityBadgeColors[achievement.rarity]}
                          size="sm"
                        >
                          {achievement.rarity}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-semibold text-gray-900">
                            {achievement.points}
                          </span>
                        </div>
                      </div>

                      {/* Unlock Date */}
                      {!isLocked && achievement.unlockedDate && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-xs text-gray-500">
                            Unlocked on {new Date(achievement.unlockedDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Stats Overview */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-primary" />
            Learning Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                label: 'Longest Streak',
                value: `${userProgress.longestStreak} days`,
                icon: Flame,
                color: 'from-orange-500 to-red-500'
              },
              {
                label: 'Quizzes Passed',
                value: userProgress.quizzesPassed,
                icon: CheckCircle,
                color: 'from-green-500 to-emerald-500'
              },
              {
                label: 'Perfect Scores',
                value: userProgress.perfectScores,
                icon: Star,
                color: 'from-yellow-500 to-orange-500'
              },
              {
                label: 'FAQs Read',
                value: userProgress.faqsRead,
                icon: BookOpen,
                color: 'from-blue-500 to-cyan-500'
              }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <Card variant="solid" hover className="p-6 border-2 border-gray-100">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-md mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
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

export default Progress;
