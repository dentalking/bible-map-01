'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiService } from '@/lib/api';
import useAppStore from '@/store/useAppStore';
import type { Event } from '@/types';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTestament, setSelectedTestament] = useState<'OLD' | 'NEW' | null>(null);

  const setSelectedEvent = useAppStore((state) => state.setSelectedEvent);

  useEffect(() => {
    loadEvents();
  }, [selectedTestament]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const response = await apiService.events.getAll({
        testament: selectedTestament || undefined,
      });
      // Sort by year
      const sortedEvents = response.data.sort((a, b) => (a.year || 0) - (b.year || 0));
      setEvents(sortedEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">성경 사건</h1>
        <p className="text-gray-600">성경에서 일어난 주요 사건들을 시간 순서대로 탐색해보세요.</p>
      </div>

      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setSelectedTestament(null)}
          className={`px-4 py-2 rounded-md ${
            !selectedTestament
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          전체
        </button>
        <button
          onClick={() => setSelectedTestament('OLD')}
          className={`px-4 py-2 rounded-md ${
            selectedTestament === 'OLD'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          구약
        </button>
        <button
          onClick={() => setSelectedTestament('NEW')}
          className={`px-4 py-2 rounded-md ${
            selectedTestament === 'NEW'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          신약
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">로딩 중...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-start space-x-4">
                <div className="text-3xl">📅</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold mb-1">{event.title}</h2>
                      {event.year && (
                        <p className="text-sm text-gray-600 mb-2">
                          {Math.abs(event.year)} {event.year < 0 ? 'BC' : 'AD'}
                        </p>
                      )}
                      {event.location && (
                        <p className="text-sm text-gray-500 mb-2">📍 {event.location.name}</p>
                      )}
                      <p className="text-gray-700">{event.description}</p>
                      {event.persons && event.persons.length > 0 && (
                        <div className="mt-3">
                          <span className="text-sm font-semibold">관련 인물: </span>
                          {event.persons.map((person) => (
                            <span key={person.id} className="text-sm text-blue-600 mr-2">
                              {person.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {event.category && (
                      <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                        {event.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}