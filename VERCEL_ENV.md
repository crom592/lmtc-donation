# Vercel 환경 변수 설정 가이드

## 필수 환경 변수

Vercel 대시보드에서 다음 환경 변수를 설정해주세요:

### 1. DATABASE_URL
```
postgresql://neondb_owner:npg_8vS2OoNeFKnA@ep-billowing-mouse-adr3y9dd-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### 2. ADMIN_PASSWORD
```
100400
```

## 설정 방법

1. [Vercel Dashboard](https://vercel.com) 접속
2. 프로젝트 선택 (lmtc-donation)
3. Settings 탭 클릭
4. Environment Variables 메뉴 선택
5. 위의 환경 변수 추가:
   - Key: `DATABASE_URL`
   - Value: 위의 PostgreSQL URL 전체 복사/붙여넣기
   - Environment: Production, Preview, Development 모두 체크
   - Add 클릭
6. 동일하게 ADMIN_PASSWORD 추가
7. 저장 후 자동으로 재배포됨

## 확인 사항

- ✅ Neon 데이터베이스 이미 생성됨
- ✅ 스키마 이미 적용됨
- ✅ Production 준비 완료

## 배포 URL

배포 완료 후:
- 메인: https://lmtc-donation.vercel.app
- 관리자: https://lmtc-donation.vercel.app/admin/login

## 문제 해결

만약 "Failed to fetch orders" 에러가 발생하면:
1. Vercel 대시보드에서 환경 변수 확인
2. Redeploy 실행 (Deployments → ... → Redeploy)