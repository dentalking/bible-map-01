'use client';

import { useState } from 'react';
import Header from './Header';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import KeyboardShortcutsModal from '@/components/modals/KeyboardShortcutsModal';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Initialize keyboard navigation with custom commands
  useKeyboardNavigation([
    // Default commands are already included
    // Add custom command to show shortcuts modal
    {
      key: '?',
      shift: true,
      action: () => setShowShortcuts(true),
      description: '키보드 단축키 보기'
    },
    {
      key: 'Escape',
      action: () => {
        if (showShortcuts) {
          setShowShortcuts(false);
        }
      },
      description: '모달 닫기'
    }
  ]);

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <main className="flex-1 relative bg-gray-50">
        <div className="absolute inset-0 overflow-auto">
          {children}
        </div>
      </main>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      {/* Floating help button */}
      <button
        onClick={() => setShowShortcuts(true)}
        className="fixed bottom-4 right-4 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 z-40"
        aria-label="키보드 단축키"
        title="키보드 단축키 (Shift + ?)"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </div>
  );
}