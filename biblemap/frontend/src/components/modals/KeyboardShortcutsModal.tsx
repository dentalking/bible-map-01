'use client';

import { useRef } from 'react';
import { useFocusTrap } from '@/hooks/useKeyboardNavigation';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, isOpen);

  if (!isOpen) return null;

  const shortcuts = [
    {
      category: '네비게이션',
      items: [
        { keys: 'Ctrl + H', description: '홈으로 이동' },
        { keys: 'Ctrl + P', description: '인물 페이지' },
        { keys: 'Ctrl + L', description: '장소 페이지' },
        { keys: 'Ctrl + E', description: '사건 페이지' },
        { keys: 'Ctrl + J', description: '여정 페이지' },
        { keys: 'Ctrl + T', description: '주제 페이지' },
        { keys: '/', description: '검색' },
        { keys: 'ESC', description: '닫기/취소' },
      ],
    },
    {
      category: '보기 모드',
      items: [
        { keys: '1', description: '지도 보기' },
        { keys: '2', description: '연대기 보기' },
        { keys: '3', description: '목록 보기' },
      ],
    },
    {
      category: '지도 컨트롤',
      items: [
        { keys: '+', description: '지도 확대' },
        { keys: '-', description: '지도 축소' },
        { keys: '방향키', description: '지도 이동' },
      ],
    },
    {
      category: '목록 탐색',
      items: [
        { keys: '↑ ↓', description: '위/아래 이동' },
        { keys: '← →', description: '왼쪽/오른쪽 이동' },
        { keys: 'Enter', description: '선택된 항목 열기' },
        { keys: 'Tab', description: '다음 요소로 이동' },
        { keys: 'Shift + Tab', description: '이전 요소로 이동' },
      ],
    },
    {
      category: '기타',
      items: [
        { keys: '?', description: '도움말 (이 창)' },
        { keys: 'Ctrl + K', description: '빠른 검색' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal */}
        <div
          ref={modalRef}
          className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
                키보드 단축키
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                aria-label="닫기"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
            <div className="space-y-6">
              {shortcuts.map((section) => (
                <div key={section.category}>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                    {section.category}
                  </h3>
                  <div className="space-y-2">
                    {section.items.map((item) => (
                      <div
                        key={item.keys}
                        className="flex items-center justify-between py-2 px-3 rounded hover:bg-gray-50"
                      >
                        <span className="text-sm text-gray-600">{item.description}</span>
                        <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">
                          {item.keys}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-3 border-t">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}