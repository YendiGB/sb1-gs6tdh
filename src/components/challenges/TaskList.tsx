import React from 'react';
import { Check } from 'lucide-react';
import type { Task } from '../../types/challenge';
import { useLocalization } from '../../hooks/useLocalization';

interface TaskListProps {
  tasks: Task[];
  completedTasks: string[];
  onTaskToggle: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  completedTasks,
  onTaskToggle
}) => {
  const { getLocalizedContent } = useLocalization();

  return (
    <div className="space-y-4 mb-6">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-start gap-4">
            <button
              onClick={() => onTaskToggle(task.id)}
              className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                completedTasks.includes(task.id)
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-300 hover:border-primary/50'
              }`}
            >
              {completedTasks.includes(task.id) && (
                <Check size={14} />
              )}
            </button>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold">{getLocalizedContent(task.name)}</h3>
                {task.duration && (
                  <span className="text-sm text-gray-500">
                    {task.duration} min
                  </span>
                )}
              </div>
              <p className="text-gray-600">{getLocalizedContent(task.description)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;