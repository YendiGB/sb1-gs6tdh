import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { useAuthStore } from '../store/authStore';
import type { Challenge, DayPlan } from '../types/challenge';
import { useLocalization } from '../hooks/useLocalization';
import DayProgress from '../components/challenges/DayProgress';
import TaskList from '../components/challenges/TaskList';
import NextDayNotification from '../components/challenges/NextDayNotification';

interface ChallengeProgress {
  userId: string;
  challengeId: string;
  currentDay: number;
  startedAt: string;
  completedTasks: string[];
  status: 'active' | 'completed' | 'abandoned';
}

const ChallengeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { userData } = useAuthStore();
  const { getLocalizedContent } = useLocalization();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [progress, setProgress] = useState<ChallengeProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && userData) {
      loadChallenge();
    }
  }, [id, userData]);

  const loadChallenge = async () => {
    try {
      if (!db || !id || !userData) return;

      // Load challenge data
      const challengeDoc = await getDoc(doc(db, 'challenges', id));
      if (!challengeDoc.exists()) {
        setError('Challenge not found');
        setLoading(false);
        return;
      }

      setChallenge({ id: challengeDoc.id, ...challengeDoc.data() } as Challenge);

      // Load progress data
      const progressQuery = query(
        collection(db, 'challengeProgress'),
        where('userId', '==', userData.id),
        where('challengeId', '==', id)
      );
      const progressSnapshot = await getDocs(progressQuery);
      
      if (!progressSnapshot.empty) {
        setProgress({
          id: progressSnapshot.docs[0].id,
          ...progressSnapshot.docs[0].data()
        } as ChallengeProgress);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading challenge:', error);
      setError('Failed to load challenge data');
      setLoading(false);
    }
  };

  const handleTaskToggle = async (taskId: string) => {
    try {
      if (!db || !progress || !userData || !challenge) return;

      const newCompletedTasks = progress.completedTasks.includes(taskId)
        ? progress.completedTasks.filter(id => id !== taskId)
        : [...progress.completedTasks, taskId];

      await updateDoc(doc(db, 'challengeProgress', `${userData.id}_${id}`), {
        completedTasks: newCompletedTasks
      });

      setProgress(prev => prev ? {
        ...prev,
        completedTasks: newCompletedTasks
      } : null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDaySelect = async (day: number) => {
    if (!progress || day > progress.currentDay + 1) return;
    
    try {
      if (!db || !userData || !challenge) return;

      await updateDoc(doc(db, 'challengeProgress', `${userData.id}_${id}`), {
        currentDay: day
      });

      setProgress(prev => prev ? {
        ...prev,
        currentDay: day
      } : null);
    } catch (error) {
      console.error('Error updating day:', error);
    }
  };

  const areAllTasksCompleted = () => {
    if (!currentDayPlan || !progress) return false;
    return currentDayPlan.tasks.every(task => 
      progress.completedTasks.includes(task.id)
    );
  };

  const canProgressToNextDay = () => {
    if (!challenge || !progress || !currentDayPlan) return false;

    // Check if all tasks for the current day are completed
    const allTasksCompleted = areAllTasksCompleted();

    // Check if it's past midnight since the day started
    const startDate = new Date(progress.startedAt);
    const daysSinceStart = Math.floor(
      (new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return allTasksCompleted && daysSinceStart >= progress.currentDay;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading challenge...</div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="p-4">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error || 'Failed to load challenge'}
        </div>
      </div>
    );
  }

  const currentDay = progress?.currentDay || 1;
  const currentDayPlan = challenge.dayPlans.find(day => day.dayNumber === currentDay);
  const startDate = progress ? new Date(progress.startedAt) : new Date();
  const remainingDays = challenge.duration - currentDay;
  const allTasksCompleted = areAllTasksCompleted();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-4 py-4">
            <Link to="/challenges" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={24} className="text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{getLocalizedContent(challenge.title)}</h1>
              <p className="text-gray-500">Day {currentDay} of {challenge.duration}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Days Navigation */}
      <DayProgress
        currentDay={currentDay}
        totalDays={challenge.duration}
        startDate={startDate}
        onDaySelect={handleDaySelect}
        isCurrentDayComplete={allTasksCompleted}
      />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Challenge Progress */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold mb-1">Day {currentDay}</h2>
              <p className="text-gray-500">
                {remainingDays} days remaining
              </p>
            </div>
            {currentDayPlan?.quote && (
              <div className="text-right">
                <p className="text-sm text-gray-500 italic">
                  "{getLocalizedContent(currentDayPlan.quote)}"
                </p>
              </div>
            )}
          </div>

          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ 
                width: `${currentDayPlan ? (progress?.completedTasks.length || 0) / currentDayPlan.tasks.length * 100 : 0}%` 
              }}
            />
          </div>
        </div>

        {/* Tasks */}
        {currentDayPlan ? (
          <TaskList
            tasks={currentDayPlan.tasks}
            completedTasks={progress?.completedTasks || []}
            onTaskToggle={handleTaskToggle}
          />
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowLeft size={24} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Tasks Available</h3>
            <p className="text-gray-500">
              Tasks for this day haven't been set up yet.
            </p>
          </div>
        )}

        {/* Next Day Notification - Only show when all tasks are completed */}
        {allTasksCompleted && !canProgressToNextDay() && currentDayPlan && (
          <div className="mt-6">
            <NextDayNotification
              challengeId={challenge.id}
              nextDay={currentDay + 1}
              currentProgress={currentDayPlan ? (progress?.completedTasks.length || 0) / currentDayPlan.tasks.length * 100 : 0}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeDetail;