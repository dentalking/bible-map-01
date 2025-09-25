'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { DetailPageSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/contexts/ToastContext';
import { fetchPerson, fetchPersonMapData } from '@/lib/api/persons';
import type { Person } from '@/types';

// Dynamically import the map component to avoid SSR issues
const PersonMap = dynamic(() => import('@/components/maps/PersonMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

export default function PersonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [person, setPerson] = useState<Person | null>(null);
  const [mapData, setMapData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPersonData = async () => {
      if (!params.id) return;

      try {
        setLoading(true);

        // Fetch both person details and map data in parallel
        const [personData, mapDataResponse] = await Promise.all([
          fetchPerson(params.id as string),
          fetchPersonMapData(params.id as string),
        ]);

        setPerson(personData);
        setMapData(mapDataResponse);
        showSuccess('인물 정보를 성공적으로 불러왔습니다.');
      } catch (err: any) {
        console.error('Error fetching person data:', err);
        if (err.response?.status === 404) {
          setError('인물을 찾을 수 없습니다.');
          showError('인물을 찾을 수 없습니다.', '404 오류');
        } else {
          setError('데이터를 불러오는 중 오류가 발생했습니다.');
          showError('데이터를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadPersonData();
  }, [params.id]);

  if (loading) {
    return <DetailPageSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">오류 발생</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!person) return null;

  const formatYear = (year?: number) => {
    if (!year) return '';
    return year < 0 ? `${Math.abs(year)} BC` : `${year} AD`;
  };

  const getTestamentText = (testament: string) => {
    return testament === 'OLD' ? '구약' : testament === 'NEW' ? '신약' : '구약/신약';
  };

  const getGenderText = (gender?: string) => {
    return gender === 'MALE' ? '남성' : gender === 'FEMALE' ? '여성' : '';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 뒤로가기 버튼 */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          돌아가기
        </button>
      </div>

      {/* 헤더 정보 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0">
            {person.imageUrl ? (
              <Image
                src={person.imageUrl}
                alt={person.name}
                width={120}
                height={120}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-4xl">👤</span>
              </div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{person.name}</h1>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              {person.nameHebrew && (
                <div><span className="font-semibold">히브리어:</span> {person.nameHebrew}</div>
              )}
              {person.nameGreek && (
                <div><span className="font-semibold">그리스어:</span> {person.nameGreek}</div>
              )}
              <div><span className="font-semibold">성서:</span> {getTestamentText(person.testament)}</div>
              {person.gender && (
                <div><span className="font-semibold">성별:</span> {getGenderText(person.gender)}</div>
              )}
              {(person.birthYear || person.deathYear) && (
                <div className="col-span-2">
                  <span className="font-semibold">생애:</span> {formatYear(person.birthYear)} - {formatYear(person.deathYear)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 설명 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3">설명</h2>
        <p className="text-gray-700 leading-relaxed">{person.description}</p>
      </div>

      {/* 의의/중요성 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3">역사적 의의</h2>
        <p className="text-gray-700 leading-relaxed">{person.significance}</p>
      </div>

      {/* 인물 생애 지도 */}
      {mapData && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">생애 지도</h2>
          <PersonMap mapData={mapData} />
        </div>
      )}

      {/* 관련 장소 */}
      {(person.birthPlace || person.deathPlace) && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">관련 장소</h2>
          <div className="space-y-3">
            {person.birthPlace && (
              <div className="flex items-center space-x-3">
                <span className="text-green-600 font-semibold">출생지:</span>
                <Link
                  href={`/locations/${person.birthPlace.id}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {person.birthPlace.name} ({person.birthPlace.modernName})
                </Link>
              </div>
            )}
            {person.deathPlace && (
              <div className="flex items-center space-x-3">
                <span className="text-red-600 font-semibold">사망지:</span>
                <Link
                  href={`/locations/${person.deathPlace.id}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {person.deathPlace.name} ({person.deathPlace.modernName})
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 관련 사건 */}
      {person.events && person.events.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">관련 사건</h2>
          <div className="space-y-3">
            {person.events.map((event) => (
              <div key={event.id} className="flex items-center space-x-3">
                <span className="text-2xl">📅</span>
                <div>
                  <Link
                    href={`/events/${event.id}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                  >
                    {event.title}
                  </Link>
                  {event.year && (
                    <span className="text-gray-500 ml-2">({formatYear(event.year)})</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 관련 여정 */}
      {person.journeys && person.journeys.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">관련 여정</h2>
          <div className="space-y-3">
            {person.journeys.map((journey) => (
              <div key={journey.id} className="flex items-center space-x-3">
                <span className="text-2xl">🚶</span>
                <div>
                  <Link
                    href={`/journeys/${journey.id}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                  >
                    {journey.title}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}