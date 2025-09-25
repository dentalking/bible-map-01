'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiService } from '@/lib/api';
import useAppStore from '@/store/useAppStore';
import { CardSkeleton } from '@/components/ui/Skeleton';
import type { Person } from '@/types';

export default function PersonsPage() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTestament, setSelectedTestament] = useState<'OLD' | 'NEW' | null>(null);

  const setSelectedPerson = useAppStore((state) => state.setSelectedPerson);

  useEffect(() => {
    loadPersons();
  }, [selectedTestament]);

  const loadPersons = async () => {
    setLoading(true);
    try {
      const response = await apiService.persons.getAll({
        testament: selectedTestament || undefined,
      });
      setPersons(response.data);
    } catch (error) {
      console.error('Failed to load persons:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">성경 인물</h1>
        <p className="text-gray-600">성경에 등장하는 주요 인물들을 탐색해보세요.</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {persons.map((person) => (
            <Link
              key={person.id}
              href={`/persons/${person.id}`}
              onClick={() => setSelectedPerson(person)}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow block"
            >
              <div className="flex items-start space-x-4">
                <div className="text-3xl">👤</div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-1">{person.name}</h2>
                  <p className="text-sm text-gray-600 mb-2">
                    {person.testament === 'OLD' ? '구약' : '신약'}
                  </p>
                  {person.birthYear && (
                    <p className="text-sm text-gray-500 mb-2">
                      {Math.abs(person.birthYear)} {person.birthYear < 0 ? 'BC' : 'AD'}
                      {person.deathYear && (
                        <span> - {Math.abs(person.deathYear)} {person.deathYear < 0 ? 'BC' : 'AD'}</span>
                      )}
                    </p>
                  )}
                  <p className="text-gray-700 line-clamp-3">{person.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}