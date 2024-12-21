import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from '../hooks/useMediaQuery';
import DraggableSection from '../components/DraggableSection';
import ActiveChallenges from '../components/home/ActiveChallenges';
import DailyAffirmation from '../components/home/DailyAffirmation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  const [sections, setSections] = useState([
    'affirmation',
    'quote',
    'challenges'
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'affirmation':
        return (
          <DraggableSection key="affirmation" id="affirmation">
            <DailyAffirmation />
          </DraggableSection>
        );
      case 'quote':
        return (
          <DraggableSection key="quote" id="quote">
            <div className="card">
              <h2 className="text-lg font-bold mb-4">{t('home.quote.title')}</h2>
              <p className="text-lg font-display italic">
                {t('home.quote.text')}
              </p>
            </div>
          </DraggableSection>
        );
      case 'challenges':
        return (
          <DraggableSection key="challenges" id="challenges">
            <ActiveChallenges />
          </DraggableSection>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {!isDesktop && (
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-display font-bold">{t('home.today')}</h1>
        </header>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sections} strategy={verticalListSortingStrategy}>
          <div className={isDesktop ? 'home-grid' : 'flex flex-col gap-6'}>
            {sections.map((sectionId) => renderSection(sectionId))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default Home;