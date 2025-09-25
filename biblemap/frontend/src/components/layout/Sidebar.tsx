'use client';

import { useState, useEffect } from 'react';
import useAppStore from '@/store/useAppStore';
import { apiService } from '@/lib/api';
import type { Person } from '@/types';

// 핵심 인물 10명 정의
const CORE_BIBLICAL_FIGURES = [
  { name: '아브라함', icon: '🏛️', testament: 'OLD', description: '믿음의 조상, 하나님의 부르심' },
  { name: '모세', icon: '🌊', testament: 'OLD', description: '출애굽의 지도자, 율법 전달자' },
  { name: '다윗', icon: '👑', testament: 'OLD', description: '목자에서 왕까지, 하나님의 마음' },
  { name: '솔로몬', icon: '⭐', testament: 'OLD', description: '지혜의 왕, 성전 건축자' },
  { name: '엘리야', icon: '🔥', testament: 'OLD', description: '능력의 선지자, 갈멜산의 승리' },
  { name: '예수', icon: '❤️', testament: 'NEW', description: '메시아, 십자가와 부활' },
  { name: '베드로', icon: '🗝️', testament: 'NEW', description: '수제자, 초대교회의 반석' },
  { name: '바울', icon: '✈️', testament: 'NEW', description: '이방인의 사도, 3차 선교여행' },
  { name: '요한', icon: '📜', testament: 'NEW', description: '사랑의 사도, 계시록의 저자' },
  { name: '마리아', icon: '🌹', testament: 'NEW', description: '예수의 어머니, 순종과 믿음' }
];

// 인물별 핵심 교훈
const getPersonLessons = (name: string): string => {
  const lessons: Record<string, string> = {
    '아브라함': '하나님의 부르심에 순종하며 고향을 떠나는 믿음의 용기. 약속을 기다리며 견디는 인내. 하나님을 전적으로 신뢰하는 완전한 믿음의 모습을 보여줍니다.',
    '모세': '하나님의 백성을 해방시키는 리더십과 용기. 어려운 상황에서도 하나님의 뜻을 따르는 순종. 백성들을 위해 중보기도하는 목자의 심정을 가르쳐 줍니다.',
    '다윗': '작은 자라도 하나님 안에서 큰 일을 할 수 있음을 보여줍니다. 죄를 지었을 때 진심으로 회개하는 마음. 하나님을 향한 뜨거운 예배와 찬양의 삶.',
    '솔로몬': '하나님께 지혜를 구하는 겸손한 마음. 하나님이 주신 지혜로 백성을 다스리는 리더십. 하지만 말년의 실수를 통해 끝까지 신실해야 함을 보여줍니다.',
    '엘리야': '혼자라도 하나님의 편에 서는 용기. 기도의 능력과 하나님께 대한 열정. 절망할 때도 하나님은 우리와 함께 하신다는 위로를 전해줍니다.',
    '예수': '완전한 사랑으로 인류를 구원하신 메시아. 섬김의 리더십과 희생. 십자가를 통해 보여주신 무조건적인 사랑과 용서가 우리 삶의 모델입니다.',
    '베드로': '실수하고 넘어져도 다시 일어설 수 있는 소망. 예수님을 부인한 후 회개하고 변화된 모습. 두려움을 이기고 복음을 담대히 전하는 용기.',
    '바울': '원수에서 사도로 변화된 하나님의 은혜. 복음을 위해 모든 것을 포기하는 헌신. 어떤 상황에서도 복음을 전하는 열정과 사명감.',
    '요한': '예수님의 사랑을 깊이 체험하고 전하는 삶. 사랑이 모든 것의 중심임을 가르침. 끝까지 신실한 제자의 삶과 영원한 소망에 대한 계시.',
    '마리아': '하나님의 뜻에 완전히 순종하는 믿음. "주의 뜻대로 이루어지이다"라는 겸손한 고백. 어머니로서의 사랑과 희생, 그리고 침묵 중에도 마음에 간직하는 깊은 신앙.'
  };

  return lessons[name] || '하나님과 함께 걸어간 신앙의 여정에서 배우는 귀한 교훈들이 있습니다.';
};

export default function Sidebar() {
  const { sidebarOpen, selectedPerson, setSelectedPerson } = useAppStore();
  const [availablePersons, setAvailablePersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCorePersons();
  }, []);

  const loadCorePersons = async () => {
    try {
      setLoading(true);
      const personsResponse = await apiService.persons.getAll({ limit: 50 });

      // 핵심 인물들과 매칭되는 실제 DB 데이터 찾기
      const matchedPersons = CORE_BIBLICAL_FIGURES.map(coreTemplate => {
        const matchedPerson = personsResponse.data.find(person =>
          person.name.includes(coreTemplate.name) ||
          coreTemplate.name.includes(person.name)
        );

        return matchedPerson ? {
          ...matchedPerson,
          icon: coreTemplate.icon,
          coreDescription: coreTemplate.description
        } : null;
      }).filter(Boolean) as Person[];

      setAvailablePersons(matchedPersons);
    } catch (error) {
      console.error('Failed to load core persons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePersonSelect = (person: Person) => {
    setSelectedPerson(person);
    console.log(`Selected person: ${person.name}`);
  };

  if (!sidebarOpen) return null;

  return (
    <aside className="w-80 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-6">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">성경 인물 여정</h1>
          <p className="text-sm text-gray-600">인물을 선택하면 그들의 모든 여정을 지도에서 확인할 수 있습니다</p>
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">핵심 인물들을 불러오는 중...</p>
            </div>
          </div>
        )}

        {/* 선택된 인물 스토리텔링 */}
        {selectedPerson && (
          <div className="mb-8">
            {/* 인물 헤더 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 mb-4">
              <div className="flex items-start space-x-3">
                <span className="text-3xl">{(selectedPerson as any).icon}</span>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedPerson.name}</h3>
                  <p className="text-sm font-medium text-blue-600 mb-2">{(selectedPerson as any).coreDescription}</p>
                  {selectedPerson.birthYear && (
                    <p className="text-sm text-gray-600 bg-white px-2 py-1 rounded-full inline-block">
                      ⏳ {Math.abs(selectedPerson.birthYear)} {selectedPerson.birthYear < 0 ? 'BC' : 'AD'}
                      {selectedPerson.deathYear && (
                        <span> - {Math.abs(selectedPerson.deathYear)} {selectedPerson.deathYear < 0 ? 'BC' : 'AD'}</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 인물 스토리 */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                📖 <span>생애 이야기</span>
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">{selectedPerson.description}</p>

              {/* 출생지/사망지 정보 */}
              <div className="space-y-2 text-sm">
                {selectedPerson.birthPlace && (
                  <div className="flex items-center gap-2 text-green-700">
                    <span>🏡</span>
                    <span>출생: {selectedPerson.birthPlace.name}</span>
                  </div>
                )}
                {selectedPerson.deathPlace && (
                  <div className="flex items-center gap-2 text-red-700">
                    <span>⚰️</span>
                    <span>사망: {selectedPerson.deathPlace.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 핵심 교훈 */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-4">
              <h4 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
                ✨ <span>핵심 교훈</span>
              </h4>
              <p className="text-sm text-amber-700 leading-relaxed">
                {getPersonLessons(selectedPerson.name)}
              </p>
            </div>

            {/* 지도 안내 */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                🗺️ <span>지도에서 확인하기</span>
              </h4>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>주요 장소들이 표시됩니다</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">📅</span>
                  <span>생애의 중요한 사건들</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🚶</span>
                  <span>인생 여정의 경로</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedPerson(undefined)}
              className="w-full px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              다른 인물 선택하기
            </button>
          </div>
        )}

        {/* 핵심 인물 리스트 */}
        {!loading && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">핵심 인물 10명</h2>

            {/* 구약 인물 */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wider">📖 구약</h3>
              <div className="space-y-2">
                {availablePersons
                  .filter(person => person.testament === 'OLD')
                  .map((person) => (
                    <button
                      key={person.id}
                      onClick={() => handlePersonSelect(person)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        selectedPerson?.id === person.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{(person as any).icon}</span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{person.name}</p>
                          <p className="text-xs text-gray-600">{(person as any).coreDescription}</p>
                        </div>
                        {selectedPerson?.id === person.id && (
                          <span className="text-blue-500">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            {/* 신약 인물 */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wider">✝️ 신약</h3>
              <div className="space-y-2">
                {availablePersons
                  .filter(person => person.testament === 'NEW')
                  .map((person) => (
                    <button
                      key={person.id}
                      onClick={() => handlePersonSelect(person)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        selectedPerson?.id === person.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{(person as any).icon}</span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{person.name}</p>
                          <p className="text-xs text-gray-600">{(person as any).coreDescription}</p>
                        </div>
                        {selectedPerson?.id === person.id && (
                          <span className="text-blue-500">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* 하단 안내 */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              💡 인물을 선택하면 출생지, 사망지, 여정, 관련 사건이 자동으로 지도에 표시됩니다
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}