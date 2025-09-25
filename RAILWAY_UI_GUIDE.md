# 🎯 Railway UI에서 Root Directory 설정하기

## 🔍 공식 문서 확인 결과

Railway 공식 문서에 따르면 Root Directory 설정은 **Service Settings**에 있어야 합니다.

## 🗺️ 설정 위치 찾기 (업데이트된 UI)

### 1. 서비스 페이지로 이동
1. https://railway.app 로그인
2. **soothing-curiosity** 프로젝트 클릭
3. **bible-map-01** 서비스 박스 클릭

### 2. Settings 찾기 - 가능한 위치들:

#### 옵션 A: Service 페이지 상단
- **Deployments** 탭 옆에 **Settings** 탭이 있는지 확인

#### 옵션 B: Deploy 탭
1. **Deploy** 탭 클릭
2. **Deploy Settings** 또는 **Configuration** 섹션 찾기
3. **Source** 또는 **Build** 섹션 확인

#### 옵션 C: Variables 탭 아래
1. **Variables** 탭 아래 스크롤
2. **Service Settings** 또는 **Build Configuration** 섹션 찾기

#### 옵션 D: 우측 패널
- 서비스 페이지 우측에 **Configuration** 패널

### 3. Root Directory 필드 찾기

다음 중 하나를 찾으세요:
- **Root Directory**
- **Root Path**
- **Source Directory**
- **Build Root**
- **Working Directory**
- **Service Root**

### 4. 설정할 값
```
biblemap/frontend
```

## 🆕 대체 방법: 새 서비스 생성

만약 위 설정을 찾을 수 없다면:

### 1. 현재 서비스 삭제
- 서비스 페이지 → Settings (또는 ⋮ 메뉴) → Delete Service

### 2. 새로운 서비스 생성
1. 프로젝트 페이지에서 **+ New** 클릭
2. **GitHub Repo** 선택
3. **Configure GitHub App** 후 `dentalking/bible-map-01` 선택
4. **중요**: 배포 전 설정 화면에서:
   - **Root Directory**: `biblemap/frontend`
   - **Service Name**: `frontend`
5. **Deploy Now** 클릭

## 📝 railway.json 설정 (frontend 폴더에 있음)

`biblemap/frontend/railway.json`:
```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm ci && npm run build"
  },
  "deploy": {
    "startCommand": "npm start"
  }
}
```

## ✅ 확인 방법

배포 성공 후:
```bash
railway logs
curl https://bible-map-01-production.up.railway.app
```

## 🆘 긴급 지원

여전히 문제가 있다면:
1. Railway Discord: https://discord.gg/railway
2. 스크린샷을 찍어서 공유해주세요
3. 새 프로젝트를 만들고 처음부터 Root Directory 설정