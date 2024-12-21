import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface DraggableSectionProps {
  id: string;
  children: React.ReactNode;
}

const DraggableSection: React.FC<DraggableSectionProps> = ({ id, children }) => {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    transition: {
      duration: 150,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? 'opacity-50' : 'opacity-100'} transition-opacity duration-200`}
    >
      <div 
        className={`absolute ${isDesktop ? '-right-6' : '-left-6'} top-1/2 -translate-y-1/2 p-2 cursor-grab active:cursor-grabbing touch-none z-10 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow`}
        {...attributes} 
        {...listeners}
      >
        <GripVertical size={20} className="text-primary" />
      </div>
      {children}
    </div>
  );
};

export default DraggableSection;