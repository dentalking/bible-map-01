'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { fetchPersons, fetchPersonMapData } from '@/lib/api/persons';
import { useToast } from '@/contexts/ToastContext';

// Dynamically import the map components to avoid SSR issues
const PersonMapEnhanced = dynamic(() => import('@/components/maps/PersonMapEnhanced'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p className="text-gray-600">지도를 불러오는 중...</p>
      </div>
    </div>
  ),
});

const PersonTimelineMap = dynamic(() => import('@/components/maps/PersonTimelineMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p className="text-gray-600">타임라인 지도를 불러오는 중...</p>
      </div>
    </div>
  ),
});

interface Person {
  id: string;
  name: string;
  nameHebrew?: string;
  nameGreek?: string;
  testament: string;
  birthYear?: number;
  deathYear?: number;
  description: string;
  birthPlace?: any;
  deathPlace?: any;
  events?: any[];
  journeys?: any[];
}

export default function HomePage() {
  const { showError } = useToast();
  const [persons, setPersons] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [mapData, setMapData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [testament, setTestament] = useState<'ALL' | 'OLD' | 'NEW' | 'BOTH'>('ALL');
  const [viewMode, setViewMode] = useState<'overview' | 'timeline'>('overview');

  // Load persons list on mount
  useEffect(() => {
    loadPersons();
  }, [testament]);

  const loadPersons = async () => {
    try {
      setLoading(true);
      const testamentFilter = testament === 'ALL' ? undefined : testament;
      const response = await fetchPersons(1, 100, testamentFilter);
      setPersons(response.data || []);
    } catch (error) {
      console.error('Error loading persons:', error);
      showError('인물 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Load map data when person is selected
  useEffect(() => {
    if (selectedPerson) {
      loadMapData(selectedPerson.id);
    }
  }, [selectedPerson]);

  const loadMapData = async (personId: string) => {
    try {
      setMapLoading(true);
      const data = await fetchPersonMapData(personId);
      setMapData(data);
    } catch (error) {
      console.error('Error loading map data:', error);
      showError('지도 데이터를 불러올 수 없습니다.');
    } finally {
      setMapLoading(false);
    }
  };

  // Filter persons based on search term
  const filteredPersons = persons.filter((person) =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (person.nameHebrew && person.nameHebrew.includes(searchTerm)) ||
    (person.description && person.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Format year for display
  const formatYear = (year?: number) => {
    if (!year) return '';
    return year < 0 ? `${Math.abs(year)} BC` : `${year} AD`;
  };

  // Get testament text
  const getTestamentText = (testament: string) => {
    return testament === 'OLD' ? '구약' : testament === 'NEW' ? '신약' : '구약/신약';
  };

  return (
    <div className="h-full flex">
      {/* Left Sidebar - Person List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">성경 인물</h2>

          {/* Search Box */}
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="인물 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <svg
              className="absolute right-2 top-2.5 w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Testament Filter */}
          <div className="flex gap-1">
            <button
              onClick={() => setTestament('ALL')}
              className={`flex-1 px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                testament === 'ALL'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setTestament('OLD')}
              className={`flex-1 px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                testament === 'OLD'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              구약
            </button>
            <button
              onClick={() => setTestament('NEW')}
              className={`flex-1 px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                testament === 'NEW'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              신약
            </button>
          </div>
        </div>

        {/* Person List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">인물 목록을 불러오는 중...</p>
              </div>
            </div>
          ) : filteredPersons.length === 0 ? (
            <div className="text-center py-8 px-4">
              <p className="text-gray-500 text-sm">검색 결과가 없습니다.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredPersons.map((person) => (
                <button
                  key={person.id}
                  onClick={() => setSelectedPerson(person)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                    selectedPerson?.id === person.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {person.name}
                        {person.nameHebrew && (
                          <span className="ml-2 text-xs text-gray-500">{person.nameHebrew}</span>
                        )}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {getTestamentText(person.testament)}
                        {(person.birthYear || person.deathYear) && (
                          <span className="ml-2">
                            {formatYear(person.birthYear)} ~ {formatYear(person.deathYear)}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {person.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            총 {filteredPersons.length}명의 인물
          </p>
        </div>
      </div>

      {/* Right Content - Map */}
      <div className="flex-1 relative bg-gray-50">
        {!selectedPerson ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">🗺️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                성경 인물의 여정을 탐험해보세요
              </h2>
              <p className="text-gray-600 mb-6">
                왼쪽 목록에서 인물을 선택하면 그들의 생애와 여정을
                지도에서 확인할 수 있습니다.
              </p>
              <div className="bg-white rounded-lg p-4 shadow-sm text-left">
                <h3 className="font-semibold text-sm text-gray-700 mb-2">지도 범례</h3>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">1</div>
                    <span>여정 시작 (시간순)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">2</div>
                    <span>중간 경유지</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">n</div>
                    <span>여정 종료</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-0.5 bg-red-400 opacity-70" style={{borderTop: '2px dashed #FF6B6B'}}></div>
                    <span>시간순 이동 경로</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : mapLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-600">지도 데이터를 불러오는 중...</p>
            </div>
          </div>
        ) : mapData ? (
          <div className="h-full flex flex-col">
            {/* Selected Person Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedPerson.name}
                    {selectedPerson.nameHebrew && (
                      <span className="ml-2 text-base font-normal text-gray-500">
                        {selectedPerson.nameHebrew}
                      </span>
                    )}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {getTestamentText(selectedPerson.testament)} •
                    {selectedPerson.birthYear && ` ${formatYear(selectedPerson.birthYear)}`}
                    {selectedPerson.deathYear && ` ~ ${formatYear(selectedPerson.deathYear)}`}
                  </p>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 mr-4">
                  <button
                    onClick={() => setViewMode('overview')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      viewMode === 'overview'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🗺️ 전체보기
                  </button>
                  <button
                    onClick={() => setViewMode('timeline')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      viewMode === 'timeline'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ⏱️ 타임라인
                  </button>
                </div>

                <button
                  onClick={() => {
                    setSelectedPerson(null);
                    setMapData(null);
                    setViewMode('overview');
                  }}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  ✕ 닫기
                </button>
              </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 p-4">
              <div className="h-full bg-white rounded-lg shadow-sm overflow-hidden">
                {viewMode === 'overview' ? (
                  <PersonMapEnhanced mapData={mapData} />
                ) : (
                  <PersonTimelineMap
                    personId={selectedPerson.id}
                    personName={selectedPerson.name}
                  />
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}