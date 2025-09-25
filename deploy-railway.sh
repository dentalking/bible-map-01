#!/bin/bash

echo "🚂 Railway 배포 스크립트"
echo "========================"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Railway 로그인 확인
echo -e "${YELLOW}1. Railway 로그인 확인...${NC}"
if ! railway whoami &>/dev/null; then
    echo -e "${RED}❌ Railway에 로그인되어 있지 않습니다.${NC}"
    echo "다음 명령어를 실행하세요:"
    echo "  railway login"
    exit 1
fi
echo -e "${GREEN}✅ Railway 로그인 완료${NC}"

# 프로젝트 연결 확인
echo -e "${YELLOW}2. Railway 프로젝트 연결 확인...${NC}"
if ! railway status &>/dev/null; then
    echo -e "${RED}❌ Railway 프로젝트가 연결되어 있지 않습니다.${NC}"
    echo "다음 명령어를 실행하세요:"
    echo "  railway link"
    exit 1
fi
echo -e "${GREEN}✅ Railway 프로젝트 연결됨${NC}"

# 환경 변수 설정
echo -e "${YELLOW}3. 환경 변수 설정...${NC}"

# Backend 환경 변수
echo "Backend 환경 변수 설정..."
railway variables set NODE_ENV=production --service backend
railway variables set PORT=4000 --service backend
railway variables set CORS_ORIGIN=https://\${{RAILWAY_PUBLIC_DOMAIN}} --service backend

# Frontend 환경 변수
echo "Frontend 환경 변수 설정..."
echo -e "${YELLOW}⚠️  Mapbox 토큰을 입력하세요:${NC}"
read -p "NEXT_PUBLIC_MAPBOX_TOKEN: " MAPBOX_TOKEN

railway variables set NEXT_PUBLIC_MAPBOX_TOKEN=$MAPBOX_TOKEN --service frontend
railway variables set NEXT_PUBLIC_API_URL=https://\${{backend.RAILWAY_PUBLIC_DOMAIN}} --service frontend
railway variables set PORT=3000 --service frontend

echo -e "${GREEN}✅ 환경 변수 설정 완료${NC}"

# 배포
echo -e "${YELLOW}4. 서비스 배포 중...${NC}"

# Backend 배포
echo "Backend 배포 중..."
cd biblemap/backend
railway up --service backend
cd ../..

# Frontend 배포
echo "Frontend 배포 중..."
cd biblemap/frontend
railway up --service frontend
cd ../..

echo -e "${GREEN}✅ 배포 완료!${NC}"

# 상태 확인
echo -e "${YELLOW}5. 배포 상태 확인...${NC}"
railway status

echo ""
echo -e "${GREEN}🎉 Railway 배포가 완료되었습니다!${NC}"
echo ""
echo "📋 다음 단계:"
echo "1. Railway 대시보드에서 도메인 생성"
echo "2. PostgreSQL 데이터베이스 마이그레이션"
echo "3. 접속 테스트"
echo ""
echo "Railway 대시보드: https://railway.app/dashboard"