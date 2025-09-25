/**
 * Mapbox 관련 유틸리티 함수들
 */

interface MapboxConfig {
  token: string | undefined;
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Mapbox 토큰 검증
 */
export function validateMapboxToken(): MapboxConfig {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // 토큰이 없는 경우
  if (!token) {
    return {
      token: undefined,
      isValid: false,
      errorMessage: '지도 서비스 설정이 필요합니다. 환경 변수를 확인해주세요.'
    };
  }

  // 기본 토큰 값인 경우
  if (token === 'your-mapbox-token-here') {
    return {
      token,
      isValid: false,
      errorMessage: 'Mapbox 토큰이 설정되지 않았습니다. 올바른 토큰을 설정해주세요.'
    };
  }

  // 토큰 형식 검증 (pk 또는 sk로 시작해야 함)
  if (!token.startsWith('pk.') && !token.startsWith('sk.')) {
    return {
      token,
      isValid: false,
      errorMessage: '올바르지 않은 Mapbox 토큰 형식입니다.'
    };
  }

  return {
    token,
    isValid: true
  };
}

/**
 * Mapbox 스타일 URL 생성
 */
export function getMapboxStyleUrl(style: 'light' | 'dark' | 'streets' | 'satellite' = 'light'): string {
  const styles = {
    light: 'mapbox://styles/mapbox/light-v11',
    dark: 'mapbox://styles/mapbox/dark-v11',
    streets: 'mapbox://styles/mapbox/streets-v12',
    satellite: 'mapbox://styles/mapbox/satellite-streets-v12'
  };

  return styles[style] || styles.light;
}

/**
 * 지도 초기 설정값
 */
export const DEFAULT_MAP_CONFIG = {
  center: [35.2137, 31.7683] as [number, number], // Jerusalem
  zoom: 7,
  pitch: 0,
  bearing: 0,
  minZoom: 2,
  maxZoom: 18,
};

/**
 * 성경 지역 경계
 */
export const BIBLICAL_BOUNDS = {
  // 중동 지역 경계
  sw: [20, 10] as [number, number], // Southwest coordinates
  ne: [50, 45] as [number, number], // Northeast coordinates
};

/**
 * Mapbox 에러 메시지 한글화
 */
export function translateMapboxError(error: Error): string {
  const message = error.message.toLowerCase();

  if (message.includes('token') || message.includes('authorization')) {
    return '지도 인증에 실패했습니다. 토큰을 확인해주세요.';
  }

  if (message.includes('network') || message.includes('fetch')) {
    return '네트워크 연결을 확인해주세요.';
  }

  if (message.includes('webgl') || message.includes('context')) {
    return '브라우저가 WebGL을 지원하지 않습니다. 다른 브라우저를 사용해주세요.';
  }

  if (message.includes('style')) {
    return '지도 스타일을 불러올 수 없습니다.';
  }

  return '지도를 불러오는 중 오류가 발생했습니다.';
}