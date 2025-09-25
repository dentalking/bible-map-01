# 🎯 Railway 배포 최종 해결 방안

## 문제 진단
- Root Directory 설정 UI가 현재 Railway 대시보드에서 보이지 않음
- Trial Plan의 제한은 아님 (Trial Plan도 monorepo 지원)
- CLI로는 Root Directory 설정 불가

## 해결 방안

### 방법 1: 새 프로젝트 생성 (추천)

1. **Railway 대시보드에서**:
   - https://railway.app/new 접속
   - **Deploy from GitHub repo** 클릭
   - `dentalking/bible-map-01` 선택
   - **배포 전 Configure 화면에서**:
     - Service Name: `frontend`
     - Root Directory: `biblemap/frontend` ← 여기서 설정!
   - **Deploy** 클릭

2. **Backend 서비스 추가**:
   - 같은 프로젝트에서 **+ New**
   - **GitHub Repo** 선택
   - 같은 레포지토리 선택
   - Service Name: `backend`
   - Root Directory: `biblemap/backend`
   - **Deploy**

3. **PostgreSQL 추가**:
   - **+ New** → **Database** → **Add PostgreSQL**

### 방법 2: Dockerfile 사용 (Root Directory 필요 없음)

1. **Frontend Dockerfile 생성**:
   `biblemap/frontend/Dockerfile`:
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **railway.json 수정**:
   ```json
   {
     "build": {
       "builder": "DOCKERFILE",
       "dockerfilePath": "biblemap/frontend/Dockerfile"
     }
   }
   ```

3. **배포**:
   ```bash
   cd biblemap/frontend
   railway up
   ```

### 방법 3: 단일 파일 프로젝트로 변환

1. **Frontend를 별도 레포지토리로 분리**:
   ```bash
   # 새 레포지토리 생성
   cd biblemap/frontend
   git init
   git remote add origin https://github.com/dentalking/bible-map-frontend.git
   git push -u origin main
   ```

2. **Railway에서 새 레포지토리 배포**

## 현재 상태 정리

### ✅ 완료된 작업:
- GitHub 레포지토리 연결
- 환경 변수 설정
- railway.json 및 nixpacks.toml 설정
- 여러 번 배포 시도

### ❌ 문제점:
- Root Directory 설정 UI를 찾을 수 없음
- 배포가 루트 디렉토리에서 실행됨
- Nixpacks가 package.json을 찾지 못함

## 💡 추천 사항

**새 프로젝트를 생성하고 처음부터 Root Directory를 설정하는 것이 가장 확실합니다.**

1. 현재 프로젝트 삭제
2. https://railway.app/new 에서 새로 시작
3. 배포 전 Configure 화면에서 Root Directory 설정

## 🆘 Railway 지원

여전히 문제가 있다면:
- Railway Discord: https://discord.gg/railway
- 스크린샷과 함께 문의
- Trial Plan 업그레이드 고려 (Hobby Plan: $5/월)