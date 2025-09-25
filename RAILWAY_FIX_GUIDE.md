# 🚨 Railway 배포 에러 해결 가이드

## 📋 문제 원인
Railway가 잘못된 디렉토리(biblemap/)를 보고 있어서 package.json을 찾지 못함

## ✅ 해결 방법 (Railway 웹 대시보드에서 설정)

### 1️⃣ Backend 서비스 설정
1. Railway 대시보드 접속: https://railway.app
2. **Backend 서비스** 클릭
3. **Settings** 탭 이동
4. **Root Directory** 설정:
   ```
   biblemap/backend
   ```
5. **Save Changes** 클릭

### 2️⃣ Frontend 서비스 설정
1. **Frontend 서비스** 클릭
2. **Settings** 탭 이동
3. **Root Directory** 설정:
   ```
   biblemap/frontend
   ```
4. **Save Changes** 클릭

### 3️⃣ 환경 변수 확인

#### Backend 환경 변수:
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
NODE_ENV=production
PORT=4000
CORS_ORIGIN=https://${{RAILWAY_PUBLIC_DOMAIN}}
```

#### Frontend 환경 변수:
```env
NEXT_PUBLIC_API_URL=https://[backend-service].railway.app
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiXXXXXXXXXXX
PORT=3000
```

### 4️⃣ 재배포 트리거
각 서비스에서:
1. **Deployments** 탭으로 이동
2. **Redeploy** 버튼 클릭
3. 빌드 로그 확인

## 🔍 빌드 성공 확인 체크리스트

### Backend:
```
✓ Using subdirectory "biblemap/backend"
✓ Detected Node.js app
✓ Installing dependencies
✓ Running prisma generate
✓ Building TypeScript
✓ Starting server on port 4000
```

### Frontend:
```
✓ Using subdirectory "biblemap/frontend"
✓ Detected Next.js app
✓ Installing dependencies
✓ Building Next.js app
✓ Starting server on port 3000
```

## 🐛 트러블슈팅

### 여전히 "Nixpacks was unable to generate" 에러가 나온다면:

1. **GitHub 연결 확인**
   - Repository 다시 연결
   - 최신 커밋이 반영되었는지 확인

2. **Build Command 확인**
   - Backend: `npm ci && npx prisma generate && npm run build`
   - Frontend: `npm ci && npm run build`

3. **Start Command 확인**
   - Backend: `npx prisma migrate deploy && npm start`
   - Frontend: `npm start`

## 🎯 완료 후 확인

1. **Backend Health Check**:
   ```
   https://[backend-domain].railway.app/health
   ```

2. **Frontend 접속**:
   ```
   https://[frontend-domain].railway.app
   ```

3. **API 연결 테스트**:
   ```
   https://[backend-domain].railway.app/api
   ```

## 📝 주의사항

- Root Directory 설정이 가장 중요!
- 각 서비스는 독립적인 subdirectory를 가져야 함
- package.json이 올바른 위치에 있어야 함:
  - `/biblemap/backend/package.json`
  - `/biblemap/frontend/package.json`

---

설정 변경 후 반드시 **Redeploy**를 클릭하세요!