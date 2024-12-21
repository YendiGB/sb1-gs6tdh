import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Check, X, BookOpen } from 'lucide-react';
import type { User } from '../../types/user';

interface UserActionsProps {
  user: User;
  editingUser: User | null;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onUpdate: (userId: string, updates: Partial<User>) => void;
  onCancelEdit: () => void;
  onAssign: (user: User) => void;
}

const UserActions: React.FC<UserActionsProps> = ({
  user,
  editingUser,
  onEdit,
  onDelete,
  onUpdate,
  onCancelEdit,
  onAssign
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && menuRef.current && buttonRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Check if menu would extend beyond viewport bottom
      if (buttonRect.bottom + menuRect.height > viewportHeight) {
        // Position menu above the button
        menuRef.current.style.bottom = '100%';
        menuRef.current.style.top = 'auto';
      } else {
        // Position menu below the button
        menuRef.current.style.top = '100%';
        menuRef.current.style.bottom = 'auto';
      }
    }
  }, [isOpen]);

  if (editingUser?.id === user.id) {
    return (
      <div className="flex justify-end items-center gap-2">
        <button
          onClick={() => onUpdate(user.id, editingUser)}
          className="p-1 text-green-600 hover:bg-green-50 rounded"
        >
          <Check size={16} />
        </button>
        <button
          onClick={onCancelEdit}
          className="p-1 text-red-600 hover:bg-red-50 rounded"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button 
        ref={buttonRef}
        className="p-1 hover:bg-gray-100 rounded"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreVertical size={16} />
      </button>
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[60]" 
            onClick={() => setIsOpen(false)}
          />
          <div 
            ref={menuRef}
            className="absolute right-0 w-48 bg-white rounded-lg shadow-lg border z-[70]"
            style={{ minWidth: '12rem' }}
          >
            <button
              onClick={() => {
                onAssign(user);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 rounded-t-lg"
            >
              <BookOpen size={14} />
              Assign Content
            </button>
            <button
              onClick={() => {
                onEdit(user);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
            >
              Edit User
            </button>
            <button
              onClick={() => {
                onDelete(user.id);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
            >
              Delete User
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserActions;