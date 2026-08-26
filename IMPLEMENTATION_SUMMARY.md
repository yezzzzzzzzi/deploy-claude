# Express.js 백엔드 구현 요약

**완료 날짜**: 2026-08-19  
**상태**: ✓ 완료 (모든 API 정상 작동)  
**포트**: 8000

---

## 프로젝트 개요

비회원 게시판의 Express.js 백엔드 API 서버 구현
- **프레임워크**: Express.js 5.2.1
- **ORM**: Prisma 6.4.1
- **데이터베이스**: SQLite
- **스타일**: CommonJS (require/module.exports)

---

## 생성된 파일 구조

```
day02/
├── app.js                      # Express 라우터 및 미들웨어 설정
├── server.js                   # 서버 시작 파일
├── package.json                # npm 스크립트 추가
├── prisma/
│   ├── schema.prisma          # DB 스키마 정의
│   ├── client.js              # Prisma Client 초기화
│   └── dev.db                 # SQLite 데이터베이스
├── API_DOCUMENTATION.md        # API 상세 문서
├── API_TEST_RESULTS.md         # 테스트 결과 보고서
└── IMPLEMENTATION_SUMMARY.md   # 이 파일
```

---

## 구현 내용

### 1. Express 애플리케이션 설정 (app.js)

#### 미들웨어
```javascript
- express.json()           // JSON 요청 본문 파싱
- cors()                   // CORS 설정 (모든 출처 허용)
- 요청 로깅                // 모든 요청 기록
- 에러 핸들링              // 글로벌 에러 처리
```

#### 구현된 기능
- 요청 로깅 (메서드, 경로, 타임스탐프)
- 입력값 검증 (필수 필드, 타입, 길이 제한)
- Prisma를 통한 데이터베이스 접근
- 404 핸들러
- 글로벌 에러 핸들링

### 2. 서버 시작 파일 (server.js)

```javascript
- Prisma 연결 테스트
- 포트 8000에서 서버 시작
- 그레이스풀 종료 처리 (SIGINT)
- 예외 처리 (uncaughtException, unhandledRejection)
```

### 3. npm 스크립트 (package.json)

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

---

## API 엔드포인트 (완전 구현)

### 게시글 API (5개)

| HTTP | 엔드포인트 | 설명 | 상태 |
|------|-----------|------|------|
| GET | `/api/posts` | 게시글 목록 조회 (최신순) | ✓ |
| GET | `/api/posts/:id` | 게시글 상세 조회 (조회수 증가) | ✓ |
| POST | `/api/posts` | 새 게시글 작성 | ✓ |
| PUT | `/api/posts/:id` | 게시글 수정 | ✓ |
| DELETE | `/api/posts/:id` | 게시글 삭제 (CASCADE) | ✓ |

### 댓글 API (3개)

| HTTP | 엔드포인트 | 설명 | 상태 |
|------|-----------|------|------|
| GET | `/api/posts/:postId/comments` | 댓글 목록 조회 | ✓ |
| POST | `/api/posts/:postId/comments` | 댓글 작성 | ✓ |
| DELETE | `/api/comments/:id` | 댓글 삭제 | ✓ |

**총 8개 엔드포인트 모두 구현 완료**

---

## 입력값 검증

### Post 모델
| 필드 | 검증 규칙 |
|------|---------|
| title | 필수, 문자열, 1-200자 |
| content | 필수, 문자열, 1자 이상 |
| authorName | 필수, 문자열, 1-50자 |

### Comment 모델
| 필드 | 검증 규칙 |
|------|---------|
| content | 필수, 문자열, 1-500자 |
| authorName | 필수, 문자열, 1-50자 |

### 자동 처리
- 입력값 자동 trim 처리
- 필수 필드 검증
- 데이터 타입 검증
- 필드 길이 제한
- ID는 양의 정수 검증

---

## 에러 처리

### HTTP 상태 코드
| 코드 | 상황 | 처리 |
|------|------|------|
| 200 | 성공 (조회, 수정, 삭제) | 데이터 반환 |
| 201 | 생성 성공 | 생성된 데이터 반환 |
| 400 | 잘못된 요청 | 유효성 검사 실패 |
| 404 | 리소스 없음 | Prisma P2025 에러 처리 |
| 500 | 서버 에러 | 예외 처리 |

### 응답 형식 (통일)
```json
// 성공
{
  "success": true,
  "data": {},
  "message": "작업 설명",
  "count": 0
}

// 실패
{
  "success": false,
  "message": "에러 설명",
  "error": "상세 메시지"
}
```

---

## 데이터베이스 스키마

### Post 테이블 (tbl_post)
```sql
id          INTEGER PRIMARY KEY AUTOINCREMENT
title       TEXT NOT NULL
content     TEXT NOT NULL
authorName  TEXT NOT NULL
viewCount   INTEGER DEFAULT 0
createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP
updatedAt   DATETIME DEFAULT CURRENT_TIMESTAMP
```

**인덱스**:
- `tbl_post_createdAt_idx` (최신순 정렬)
- `tbl_post_authorName_idx` (작성자별 조회)

### Comment 테이블 (tbl_comment)
```sql
id          INTEGER PRIMARY KEY AUTOINCREMENT
content     TEXT NOT NULL
authorName  TEXT NOT NULL
createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP
postId      INTEGER NOT NULL (FK → Post.id)
```

**인덱스**:
- `tbl_comment_postId_idx` (게시글별 댓글)
- `tbl_comment_createdAt_idx` (최신순 정렬)

**관계**:
- ON DELETE CASCADE (게시글 삭제 시 댓글 자동 삭제)

---

## 주요 구현 기능

### 1. 조회수 자동 증가
```javascript
app.get('/api/posts/:id', async (req, res) => {
  const post = await prisma.post.update({
    where: { id: postId },
    data: { viewCount: { increment: 1 } }
  });
});
```

### 2. 관련 데이터 포함 조회
```javascript
app.get('/api/posts/:id', async (req, res) => {
  const post = await prisma.post.update({
    include: {
      comments: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });
});
```

### 3. 최신순 정렬
```javascript
const posts = await prisma.post.findMany({
  orderBy: { createdAt: 'desc' }
});
```

### 4. CASCADE 삭제
```javascript
// schema.prisma
post Post @relation(fields: [postId], references: [id], onDelete: Cascade)

// 게시글 삭제 시 자동으로 관련 댓글도 삭제됨
await prisma.post.delete({ where: { id } });
```

---

## 테스트 결과

### 모든 엔드포인트 테스트 통과 (8/8)
- ✓ 게시글 목록 조회
- ✓ 게시글 상세 조회 (조회수 증가)
- ✓ 게시글 작성
- ✓ 게시글 수정
- ✓ 게시글 삭제
- ✓ 댓글 목록 조회
- ✓ 댓글 작성
- ✓ 댓글 삭제

### 기능 테스트 통과
- ✓ 입력값 검증
- ✓ 404 Not Found 처리
- ✓ 필드 길이 제한
- ✓ CASCADE 삭제
- ✓ 타임스탐프 자동 생성
- ✓ 최신순 정렬

---

## 서버 실행 방법

### 1. 개발 환경 (자동 재시작)
```bash
# nodemon 설치 (첫 1회)
npm install -D nodemon

# 실행
npm run dev
```

### 2. 프로덕션 환경
```bash
npm start
```

### 3. 직접 실행
```bash
node server.js
```

### 4. 로그 출력
```
✓ Prisma 데이터베이스 연결 성공
✓ 서버가 시작되었습니다
  URL: http://localhost:8000

사용 가능한 엔드포인트:
[게시글 API]
  GET    /api/posts
  POST   /api/posts
  GET    /api/posts/:id
  PUT    /api/posts/:id
  DELETE /api/posts/:id

[댓글 API]
  GET    /api/posts/:postId/comments
  POST   /api/posts/:postId/comments
  DELETE /api/comments/:id
```

---

## API 사용 예시

### cURL로 테스트

#### 게시글 작성
```bash
curl -X POST http://localhost:8000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "첫 게시글",
    "content": "안녕하세요",
    "authorName": "김철수"
  }'
```

#### 게시글 목록 조회
```bash
curl http://localhost:8000/api/posts
```

#### 댓글 작성
```bash
curl -X POST http://localhost:8000/api/posts/1/comments \
  -H "Content-Type: application/json" \
  -d '{
    "content": "좋은 글입니다",
    "authorName": "이순신"
  }'
```

---

## 코드 품질

### 특징
- CommonJS 형식으로 일관성 유지
- 함수별 에러 처리 구현
- 명확한 주석 및 변수명
- Prisma 에러 코드 처리 (P2025)
- 입력값 검증 철저

### 보안
- SQL Injection 방지 (Prisma 사용)
- CORS 설정 (필요에 따라 수정 가능)
- 입력값 길이 제한
- 타입 검증

---

## 다음 단계

### 프론트엔드 개발
- 이 API를 사용하는 HTML/CSS/JavaScript 프론트엔드 구현
- API 문서: `API_DOCUMENTATION.md` 참조

### 추가 기능 (선택)
- 사용자 인증 (로그인/회원가입)
- 페이지네이션
- 검색 기능
- 정렬 옵션
- 카테고리 분류
- 이미지 첨부
- 좋아요 기능

### 배포
- Heroku, Vercel, AWS Lambda 등에 배포
- 환경 변수 설정 (.env)
- 데이터베이스 마이그레이션

---

## 파일 참조

| 파일 | 설명 | 용도 |
|------|------|------|
| app.js | Express 라우터 및 미들웨어 | 메인 로직 |
| server.js | 서버 시작 파일 | 실행 파일 |
| API_DOCUMENTATION.md | API 상세 문서 | 개발자 참고 |
| API_TEST_RESULTS.md | 테스트 결과 | 테스트 검증 |
| SCHEMA_SUMMARY.md | DB 스키마 문서 | 데이터베이스 참고 |

---

## 완료 체크리스트

- ✓ Express.js 애플리케이션 구현
- ✓ 8개 API 엔드포인트 구현
- ✓ 입력값 검증 로직
- ✓ 에러 처리
- ✓ 데이터베이스 통합
- ✓ 모든 엔드포인트 테스트
- ✓ API 문서 작성
- ✓ 테스트 결과 보고서

**상태**: ✓ 완료 - 프로덕션 준비 완료
