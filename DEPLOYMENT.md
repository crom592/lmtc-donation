# LMTC 티켓 시스템 배포 가이드

## 1. Neon 데이터베이스 설정

1. [Neon](https://neon.tech) 가입 및 로그인
2. 새 프로젝트 생성
3. PostgreSQL 데이터베이스 URL 복사
   - 형식: `postgresql://username:password@host/database?sslmode=require`

## 2. Vercel 배포

### 2.1 GitHub 저장소 생성
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/lmtc-donation.git
git push -u origin main
```

### 2.2 Vercel 배포
1. [Vercel](https://vercel.com) 가입 및 로그인
2. "New Project" 클릭
3. GitHub 저장소 연결
4. 환경 변수 설정:
   - `DATABASE_URL`: Neon PostgreSQL URL
   - `ADMIN_PASSWORD`: 100400 (또는 원하는 비밀번호)

### 2.3 Production 데이터베이스 초기화
```bash
# Production 스키마 사용
cp prisma/schema.production.prisma prisma/schema.prisma

# Neon DB URL로 환경변수 설정
export DATABASE_URL="your-neon-database-url"

# 데이터베이스 초기화
npx prisma db push
```

## 3. 시스템 사용법

### 구매자 (사용자)
1. 메인 페이지에서 티켓 구매
2. 이름과 전화번호 입력
3. 계좌 정보 확인 후 입금
4. 관리자 승인 대기
5. 승인 후 티켓 이미지 다운로드

### 판매자 (관리자)
1. `/admin/login` 접속
2. 비밀번호 입력 (기본: 100400)
3. 주문 목록 확인
4. 입금 확인 버튼으로 티켓 발행
5. 티켓 사용 처리

## 4. API 엔드포인트

### 주문 관리
- `POST /api/orders` - 주문 생성
- `GET /api/orders` - 주문 목록 조회
- `PATCH /api/orders/[id]` - 주문 상태 업데이트
- `DELETE /api/orders/[id]` - 주문 삭제

### 티켓 관리
- `GET /api/tickets?name=홍길동&phone=010-1234-5678` - 티켓 조회
- `POST /api/tickets/[id]/use` - 티켓 사용 처리

### 인증
- `POST /api/auth/admin` - 관리자 로그인

## 5. 로컬 개발

```bash
# 의존성 설치
npm install

# 환경 변수 설정 (.env)
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD="100400"

# 데이터베이스 초기화
npx prisma db push

# 개발 서버 실행
npm run dev
```

## 6. 주의사항

- Vercel 무료 플랜은 SQLite를 지원하지 않음 (Neon PostgreSQL 사용 필수)
- Neon 무료 플랜: 0.5GB 스토리지, 100시간/월 컴퓨팅
- 환경 변수는 반드시 Vercel 대시보드에서 설정
- Production 배포 시 `schema.production.prisma` 사용

## 7. 문제 해결

### 데이터베이스 연결 오류
- Neon URL의 `?sslmode=require` 파라미터 확인
- Vercel 환경 변수 설정 확인

### Prisma 오류
```bash
# Prisma 클라이언트 재생성
npx prisma generate

# 스키마 동기화
npx prisma db push
```