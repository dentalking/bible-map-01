# 📤 프로젝트 공유 가이드

친구에게 BibleMap 프로젝트를 공유하는 방법을 안내합니다.

## 🎯 공유 옵션

### 옵션 1: GitHub 리포지토리 (추천) 🌟

#### 1. GitHub 리포지토리 생성
```bash
# 1. GitHub.com에서 새 리포지토리 생성
# 2. 로컬에서 리모트 추가 및 푸시
git remote add origin https://github.com/yourusername/bible-map.git
git commit -m "Initial commit: BibleMap - 성경 인물 지도 서비스"
git branch -M main
git push -u origin main
```

#### 2. 친구에게 공유할 내용
```
🗺️ BibleMap 프로젝트 공유합니다!

GitHub: https://github.com/yourusername/bible-map
성경 인물들의 여정을 인터랙티브 지도로 볼 수 있는 서비스입니다.

✨ 주요 특징:
- 8명의 성경 인물 여정 시각화
- 시간순 번호 마커 (1, 2, 3...)
- 타임라인 애니메이션
- 7가지 지도 스타일

🚀 실행 방법:
1. git clone 후 docker-compose up
2. Mapbox 토큰 필요 (무료)
3. http://localhost:3001 접속

자세한 설치 방법은 README 참고해주세요!
```

### 옵션 2: 온라인 데모 배포

#### Vercel 배포 (Frontend)
1. [Vercel](https://vercel.com) 가입
2. GitHub 연동 후 자동 배포
3. 환경 변수 설정 (NEXT_PUBLIC_MAPBOX_TOKEN)

#### Railway/Render 배포 (Backend)
1. PostgreSQL + Node.js 서비스 생성
2. 환경 변수 설정
3. 자동 배포 설정

### 옵션 3: 로컬 실행용 ZIP 파일

#### 친구가 로컬에서 실행하는 방법
```bash
# 1. ZIP 파일 압축 해제
unzip bible-map-01.zip
cd bible-map-01

# 2. 환경 변수 설정
cp .env.example biblemap/frontend/.env
cp .env.example biblemap/backend/.env
# .env 파일들 수정 (Mapbox 토큰 추가)

# 3. Docker 실행
docker-compose up -d

# 4. 데이터베이스 초기화
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed

# 5. 브라우저에서 접속
open http://localhost:3001
```

### 옵션 4: 스크린 녹화/데모 영상

로컬에서 실행 중인 앱을 화면 녹화하여 공유:
1. QuickTime Player 또는 OBS Studio 사용
2. 주요 기능 시연:
   - 인물 선택 및 지도 표시
   - 타임라인 모드 재생
   - 지도 스타일 변경
   - 중복 위치 원형 배치 확인

## 📋 친구에게 전달할 체크리스트

### 필수 전달 사항:
- [ ] GitHub 리포지토리 URL 또는 ZIP 파일
- [ ] Mapbox 토큰 발급 방법 안내
- [ ] Docker 설치 확인
- [ ] Node.js 18+ 설치 확인

### 추가 자료:
- [ ] 스크린샷 (메인 화면, 인물별 지도)
- [ ] 주요 기능 설명
- [ ] 개선 아이디어 요청 사항

## 💬 피드백 요청 예시

```
안녕! 성경 인물 지도 프로젝트 만들어봤는데 피드백 부탁해!

특히 이런 부분들 봐주면 좋을 것 같아:
1. UI/UX - 사용하기 편한지
2. 지도 표시 - 숫자 마커가 잘 보이는지
3. 성능 - 로딩 속도나 렌더링 이슈
4. 추가하면 좋을 기능
5. 코드 구조 (개발자라면)

GitHub: [URL]
실행 방법은 README에 정리해뒀어!

시간 날 때 봐주고 의견 알려줘~ 감사!
```

## 🚀 빠른 시작 (친구용)

```bash
# 1분 안에 시작하기
git clone [your-repo-url]
cd bible-map-01
cp .env.example biblemap/frontend/.env
# Mapbox 토큰 추가
docker-compose up -d
# 브라우저에서 http://localhost:3001 접속
```

## 📞 지원

문제가 있으면 연락 주세요!
- GitHub Issues
- 이메일/메신저

---

Happy Sharing! 🎉