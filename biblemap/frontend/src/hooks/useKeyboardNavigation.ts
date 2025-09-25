'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import useAppStore from '@/store/useAppStore';

interface KeyCommand {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

const defaultCommands: KeyCommand[] = [
  // Navigation shortcuts
  { key: 'h', ctrl: true, action: () => window.location.href = '/', description: '홈으로 이동' },
  { key: 'p', ctrl: true, action: () => window.location.href = '/persons', description: '인물 페이지' },
  { key: 'l', ctrl: true, action: () => window.location.href = '/locations', description: '장소 페이지' },
  { key: 'e', ctrl: true, action: () => window.location.href = '/events', description: '사건 페이지' },
  { key: 'j', ctrl: true, action: () => window.location.href = '/journeys', description: '여정 페이지' },
  { key: 't', ctrl: true, action: () => window.location.href = '/themes', description: '주제 페이지' },

  // Search shortcut
  { key: '/', action: () => {
    const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    } else {
      window.location.href = '/search';
    }
  }, description: '검색' },

  // View mode shortcuts (numbers)
  { key: '1', action: () => useAppStore.getState().setViewMode('map'), description: '지도 보기' },
  { key: '2', action: () => useAppStore.getState().setViewMode('timeline'), description: '연대기 보기' },
  { key: '3', action: () => useAppStore.getState().setViewMode('grid'), description: '목록 보기' },

  // Map controls
  { key: '+', action: () => {
    const mapContainer = document.querySelector('.mapboxgl-canvas');
    if (mapContainer) {
      // Zoom in logic would go here
      console.log('Zoom in');
    }
  }, description: '지도 확대' },
  { key: '-', action: () => {
    const mapContainer = document.querySelector('.mapboxgl-canvas');
    if (mapContainer) {
      // Zoom out logic would go here
      console.log('Zoom out');
    }
  }, description: '지도 축소' },

  // Help
  { key: '?', shift: true, action: () => {
    // Show keyboard shortcuts modal
    console.log('Show keyboard shortcuts');
  }, description: '도움말' },
];

export function useKeyboardNavigation(customCommands?: KeyCommand[]) {
  const router = useRouter();
  const commands = customCommands || defaultCommands;

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Don't trigger if user is typing in an input field
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    // Check each command
    for (const command of commands) {
      const matchesKey = event.key.toLowerCase() === command.key.toLowerCase();
      const matchesCtrl = command.ctrl ? event.ctrlKey || event.metaKey : true;
      const matchesShift = command.shift ? event.shiftKey : true;
      const matchesAlt = command.alt ? event.altKey : true;

      if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
        event.preventDefault();
        command.action();
        break;
      }
    }
  }, [commands]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return { commands };
}

// Arrow key navigation for lists and grids
export function useArrowNavigation(
  items: any[],
  selectedIndex: number,
  onSelect: (index: number) => void,
  onEnter?: (item: any) => void
) {
  const handleArrowKeys = useCallback((event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    let newIndex = selectedIndex;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        newIndex = Math.max(0, selectedIndex - 1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        newIndex = Math.min(items.length - 1, selectedIndex + 1);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        // For grid layout - move left
        newIndex = Math.max(0, selectedIndex - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        // For grid layout - move right
        newIndex = Math.min(items.length - 1, selectedIndex + 1);
        break;
      case 'Enter':
        if (onEnter && items[selectedIndex]) {
          event.preventDefault();
          onEnter(items[selectedIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        onSelect(-1); // Deselect
        break;
    }

    if (newIndex !== selectedIndex) {
      onSelect(newIndex);

      // Scroll into view if needed
      const element = document.querySelector(`[data-index="${newIndex}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [items, selectedIndex, onSelect, onEnter]);

  useEffect(() => {
    window.addEventListener('keydown', handleArrowKeys);
    return () => window.removeEventListener('keydown', handleArrowKeys);
  }, [handleArrowKeys]);
}

// Focus trap for modals and dialogs
export function useFocusTrap(containerRef: React.RefObject<HTMLElement>, isActive = true) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstFocusable?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [containerRef, isActive]);
}