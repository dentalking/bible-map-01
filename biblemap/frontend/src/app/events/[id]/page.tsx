'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Event } from '@/types';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!params.id) return;

      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${params.id}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('사건을 찾을 수 없습니다.');
          } else {
            setError('데이터를 불러오는 중 오류가 발생했습니다.');
          }
          return;
        }

        const data = await response.json();
        setEvent(data);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">사건 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">📅</div>
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

  if (!event) return null;

  const formatYear = (year?: number) => {
    if (!year) return '';
    return year < 0 ? `${Math.abs(year)} BC` : `${year} AD`;
  };

  const getTestamentText = (testament: string) => {
    return testament === 'OLD' ? '구약' : '신약';
  };

  const getCategoryText = (category: string) => {
    const categoryMap: Record<string, string> = {
      'CREATION': '창조',
      'PATRIARCHS': '족장 시대',
      'EXODUS': '출애굽',
      'CONQUEST': '정착',
      'JUDGES': '사사 시대',
      'MONARCHY': '왕정',
      'EXILE': '유배',
      'RETURN': '귀환',
      'MINISTRY': '사역',
      'MIRACLE': '기적',
      'TEACHING': '가르침',
      'CRUCIFIXION': '십자가',
      'RESURRECTION': '부활',
      'CHURCH': '교회',
      'PROPHECY': '예언'
    };
    return categoryMap[category] || category;
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
            {event.imageUrl ? (
              <Image
                src={event.imageUrl}
                alt={event.title}
                width={120}
                height={120}
                className="rounded-lg object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-4xl">📅</span>
              </div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{event.title}</h1>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div><span className="font-semibold">시대:</span> {getTestamentText(event.testament)}</div>
              <div><span className="font-semibold">분류:</span> {getCategoryText(event.category)}</div>
              {event.year && (
                <div><span className="font-semibold">연도:</span> {formatYear(event.year)}</div>
              )}
              {event.yearRange && (
                <div><span className="font-semibold">기간:</span> {event.yearRange}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 설명 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3">사건 설명</h2>
        <p className="text-gray-700 leading-relaxed">{event.description}</p>
      </div>

      {/* 역사적 의의 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3">역사적 의의</h2>
        <p className="text-gray-700 leading-relaxed">{event.significance}</p>
      </div>

      {/* 발생 장소 */}
      {event.location && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">발생 장소</h2>
          <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
            <span className="text-3xl">📍</span>
            <div className="flex-1">
              <Link
                href={`/locations/${event.location.id}`}
                className="text-blue-600 hover:text-blue-800 hover:underline font-semibold text-lg"
              >
                {event.location.name}
              </Link>
              {event.location.modernName && (
                <p className="text-sm text-gray-600">현재: {event.location.modernName}</p>
              )}
              {event.location.country && (
                <p className="text-sm text-gray-600">국가: {event.location.country}</p>
              )}
              <p className="text-gray-600 mt-2">{event.location.description}</p>
              <div className="mt-2">
                <span className="text-sm font-semibold text-gray-700">좌표: </span>
                <span className="text-sm text-gray-600">
                  {event.location.latitude.toFixed(4)}°N, {event.location.longitude.toFixed(4)}°E
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 관련 인물 */}
      {event.persons && event.persons.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">관련 인물</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {event.persons.map((person) => (
              <div key={person.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <span className="text-2xl">👤</span>
                <div className="flex-1">
                  <Link
                    href={`/persons/${person.id}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline font-semibold text-lg"
                  >
                    {person.name}
                  </Link>
                  {person.nameHebrew && (
                    <p className="text-sm text-gray-600">히브리어: {person.nameHebrew}</p>
                  )}
                  {person.nameGreek && (
                    <p className="text-sm text-gray-600">그리스어: {person.nameGreek}</p>
                  )}
                  {(person.birthYear || person.deathYear) && (
                    <p className="text-sm text-gray-500 mt-1">
                      {person.birthYear && formatYear(person.birthYear)} - {person.deathYear && formatYear(person.deathYear)}
                    </p>
                  )}
                  <p className="text-gray-600 mt-2">{person.description}</p>

                  {/* 인물의 출생지/사망지 정보 */}
                  <div className="mt-2 space-y-1">
                    {person.birthPlace && (
                      <div className="text-sm">
                        <span className="font-semibold text-green-600">출생지: </span>
                        <Link
                          href={`/locations/${person.birthPlace.id}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {person.birthPlace.name}
                        </Link>
                      </div>
                    )}
                    {person.deathPlace && (
                      <div className="text-sm">
                        <span className="font-semibold text-red-600">사망지: </span>
                        <Link
                          href={`/locations/${person.deathPlace.id}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {person.deathPlace.name}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 관련 성경 구절 */}
      {event.verses && event.verses.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">관련 성경 구절</h2>
          <div className="space-y-4">
            {event.verses.map((verse) => (
              <div key={verse.id} className="border-l-4 border-purple-500 pl-4 bg-purple-50 p-4 rounded-r-lg">
                <div className="font-semibold text-purple-800 mb-2">
                  {verse.book} {verse.chapter}:{verse.verseStart}
                  {verse.verseEnd && verse.verseEnd !== verse.verseStart && `-${verse.verseEnd}`}
                  <span className="text-sm text-gray-600 ml-2">({verse.translation})</span>
                </div>
                <p className="text-gray-700 leading-relaxed">{verse.text}</p>
                {verse.textHebrew && (
                  <p className="text-gray-600 text-sm mt-2 italic">히브리어: {verse.textHebrew}</p>
                )}
                {verse.textGreek && (
                  <p className="text-gray-600 text-sm mt-1 italic">그리스어: {verse.textGreek}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 시대적 배경 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3">시대적 배경</h2>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-700">성서 시대:</span>
              <span className="ml-2 text-gray-600">{getTestamentText(event.testament)}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">사건 분류:</span>
              <span className="ml-2 text-gray-600">{getCategoryText(event.category)}</span>
            </div>
            {event.year && (
              <div>
                <span className="font-semibold text-gray-700">발생 연도:</span>
                <span className="ml-2 text-gray-600">{formatYear(event.year)}</span>
              </div>
            )}
            {event.location && (
              <div>
                <span className="font-semibold text-gray-700">발생 지역:</span>
                <span className="ml-2 text-gray-600">{event.location.country || '중동 지역'}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}