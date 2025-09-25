# 🚀 Railway 배포 최종 가이드

## 📦 현재 구조
```
bible-map-01/
├── railway.json          # ✅ 모노레포 설정 (생성완료)
├── railway.toml          # ✅ 서비스별 설정 (업데이트완료)
└── biblemap/
    ├── backend/
    │   ├── package.json
    │   ├── nixpacks.toml  # ✅ 백엔드 빌드 설정
    │   └── railway.json   # ✅ 백엔드 배포 설정
    └── frontend/
        ├── package.json
        ├── nixpacks.toml  # ✅ 프론트엔드 빌드 설정
        └── railway.json   # ✅ 프론트엔드 배포 설정
```

## 🎯 Railway 대시보드 설정

### 🔴 핵심: 각 서비스의 Root Directory 설정

#### 1️⃣ Backend 서비스
1. Railway 대시보드 → **Backend 서비스** 클릭
2. **Settings** 탭 → **Service** 섹션
3. 설정:
   ```
   Root Directory: biblemap/backend
   Watch Paths: biblemap/backend/**
   ```
4. **환경 변수** 탭:
   ```env
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   NODE_ENV=production
   PORT=4000
   CORS_ORIGIN=https://${{RAILWAY_PUBLIC_DOMAIN}}
   ```

#### 2️⃣ Frontend 서비스
1. Railway 대시보드 → **Frontend 서비스** 클릭
2. **Settings** 탭 → **Service** 셉션
3. 설정:
   ```
   Root Directory: biblemap/frontend
   Watch Paths: biblemap/frontend/**
   ```
4. **환경 변수** 탭:
   ```env
   NEXT_PUBLIC_API_URL=https://[backend-service].railway.app
   NEXT_PUBLIC_MAPBOX_TOKEN=[your-mapbox-token]
   PORT=3000
   ```

#### 3️⃣ PostgreSQL 서비스
- 이미 설정되어 있으면 확인만
- 없으면: **New** → **Database** → **Add PostgreSQL**

## 🔄 재배포 방법

### 옵션 1: Railway 대시보드에서
1. 각 서비스 → **Deployments** 탭
2. **Redeploy** 버튼 클릭

### 옵션 2: Git Push로 자동 배포
```bash
git add .
git commit -m "fix: Railway 모노레포 설정 수정"
git push origin main
```

## ✅ 성공 확인 기준

### Backend 빌드 로그:
```
✅ Using Nixpacks
✅ context: biblemap/backend
✅ Detected Node.js app
✅ Installing dependencies (npm ci)
✅ Running prisma generate
✅ Building TypeScript (npm run build)
✅ Build successful!
```

### Frontend 빌드 로그:
```
✅ Using Nixpacks
✅ context: biblemap/frontend
✅ Detected Next.js app
✅ Installing dependencies (npm ci)
✅ Building Next.js app (npm run build)
✅ Build successful!
```

## ❌ 실패 시 체크리스트

### "Nixpacks was unable to generate" 에러:
- [ ] Root Directory가 `biblemap/backend` 또는 `biblemap/frontend`로 설정되어 있는가?
- [ ] GitHub 리포지토리가 연결되어 있는가?
- [ ] 최신 커밋이 push 되었는가?

### Build 실패:
- [ ] package.json이 올바른 위치에 있는가?
- [ ] 모든 dependencies가 package.json에 정의되어 있는가?
- [ ] TypeScript 에러가 있는가? (next.config.ts에서 ignoreBuildErrors: true 설정)

## 📝 현재 설정 파일 요약

### 1. 루트 railway.json
- 모노레포 전체 구조 정의
- 서비스별 root 디렉토리 명시

### 2. 루트 railway.toml
- 서비스별 상세 설정
- rootDirectory, buildCommand, startCommand 포함

### 3. 각 서비스의 nixpacks.toml
- Node.js 버전, 빌드/실행 명령어 정의

### 4. 각 서비스의 railway.json
- 서비스별 배포 설정

## 🏁 다음 단계

1. **Railway 대시보드에서 Root Directory 설정** (가장 중요!)
2. 환경 변수 설정 확인
3. Redeploy 클릭
4. 빌드 로그 모니터링

---

⚠️ **핑심**: Root Directory가 설정되지 않으면 Railway는 계속 `biblemap` 폴더를 보고 실패합니다!