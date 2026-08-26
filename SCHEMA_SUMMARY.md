# Prisma DB 스키마 설계 완료

## 프로젝트 정보
- **프로젝트명**: 비회원 게시판 (Anonymous Board)
- **데이터베이스**: SQLite
- **ORM**: Prisma 6.4.1
- **생성일**: 2026-08-19

---

## 스키마 설계 개요

### 데이터베이스 구성
```
datasource: SQLite (file:./dev.db)
generator: prisma-client-js
```

### 엔티티 관계도 (ERD)
```
┌──────────────────┐
│   Post (게시글)  │
│  (tbl_post)      │
├──────────────────┤
│ id (PK)          │ ─┐
│ title            │  │
│ content          │  │ 1:N
│ authorName       │  │
│ viewCount        │  │
│ createdAt        │  │
│ updatedAt        │  │
└──────────────────┘  │
                      │
                      │
┌──────────────────┐  │
│ Comment (댓글)   │  │
│ (tbl_comment)    │  │
├──────────────────┤  │
│ id (PK)          │  │
│ content          │  │
│ authorName       │  │
│ createdAt        │  │
│ postId (FK) ─────┘
└──────────────────┘
```

---

## 상세 스키마 정보

### 1. Post 모델 (게시글)

| 필드명 | 타입 | 제약조건 | 설명 |
|--------|------|--------|------|
| id | Int | PK, 자동증가 | 게시글 고유 ID |
| title | String | NOT NULL | 게시글 제목 |
| content | String | NOT NULL | 게시글 내용 |
| authorName | String | NOT NULL | 작성자명 |
| viewCount | Int | DEFAULT 0 | 조회수 (기본값: 0) |
| createdAt | DateTime | 자동생성 | 작성일시 |
| updatedAt | DateTime | 자동업데이트 | 수정일시 |
| comments | Comment[] | 관계 | 연결된 댓글 목록 |

**테이블명**: `tbl_post`

**인덱스**:
- `tbl_post_createdAt_idx`: createdAt (최신순 정렬 성능 최적화)
- `tbl_post_authorName_idx`: authorName (작성자별 조회 성능 최적화)

---

### 2. Comment 모델 (댓글)

| 필드명 | 타입 | 제약조건 | 설명 |
|--------|------|--------|------|
| id | Int | PK, 자동증가 | 댓글 고유 ID |
| content | String | NOT NULL | 댓글 내용 |
| authorName | String | NOT NULL | 댓글 작성자명 |
| createdAt | DateTime | 자동생성 | 작성일시 |
| postId | Int | FK, NOT NULL | 게시글 ID (외래키) |
| post | Post | 관계 | 연결된 게시글 |

**테이블명**: `tbl_comment`

**인덱스**:
- `tbl_comment_postId_idx`: postId (게시글별 댓글 조회 성능 최적화)
- `tbl_comment_createdAt_idx`: createdAt (최신순 정렬 성능 최적화)

**관계 설정**:
- Foreign Key: postId → Post.id
- ON DELETE CASCADE: 게시글 삭제 시 관련 댓글도 자동 삭제

---

## 마이그레이션 정보

### 생성된 마이그레이션
- **마이그레이션 ID**: `20260819123354_init`
- **마이그레이션 파일**: `/prisma/migrations/20260819123354_init/migration.sql`

### 생성된 테이블
1. `tbl_post` - 게시글 테이블
2. `tbl_comment` - 댓글 테이블

### 생성된 인덱스
1. `tbl_post_createdAt_idx`
2. `tbl_post_authorName_idx`
3. `tbl_comment_postId_idx`
4. `tbl_comment_createdAt_idx`

---

## Prisma Client 초기화

### 파일 위치
- `/prisma/client.js` - Prisma Client 인스턴스 생성 및 내보내기

### 사용 방법
```javascript
const prisma = require('./prisma/client');

// CREATE
const post = await prisma.post.create({
  data: { title, content, authorName }
});

// READ
const posts = await prisma.post.findMany({
  orderBy: { createdAt: 'desc' }
});

const postDetail = await prisma.post.findUnique({
  where: { id },
  include: { comments: true }
});

// UPDATE
const updated = await prisma.post.update({
  where: { id },
  data: { title, content }
});

// DELETE
await prisma.post.delete({ where: { id } });

// Disconnect
await prisma.$disconnect();
```

---

## 주요 기능별 쿼리 예시

### 1. 게시글 목록 조회 (최신순)
```javascript
const posts = await prisma.post.findMany({
  orderBy: { createdAt: 'desc' }
});
```

### 2. 게시글 상세 조회 (댓글 포함)
```javascript
const post = await prisma.post.findUnique({
  where: { id },
  include: {
    comments: {
      orderBy: { createdAt: 'desc' }
    }
  }
});
```

### 3. 조회수 증가
```javascript
const post = await prisma.post.update({
  where: { id },
  data: { viewCount: { increment: 1 } }
});
```

### 4. 게시글 생성
```javascript
const post = await prisma.post.create({
  data: {
    title,
    content,
    authorName
  }
});
```

### 5. 게시글 수정
```javascript
const post = await prisma.post.update({
  where: { id },
  data: { title, content }
});
```

### 6. 게시글 삭제 (댓글 자동 삭제)
```javascript
await prisma.post.delete({
  where: { id }
});
```

### 7. 댓글 작성
```javascript
const comment = await prisma.comment.create({
  data: {
    content,
    authorName,
    postId
  }
});
```

### 8. 댓글 목록 조회
```javascript
const comments = await prisma.comment.findMany({
  where: { postId },
  orderBy: { createdAt: 'desc' }
});
```

### 9. 댓글 삭제
```javascript
await prisma.comment.delete({
  where: { id }
});
```

---

## 데이터베이스 파일 정보

### 생성된 파일
- `/prisma/dev.db` - SQLite 데이터베이스 파일
- `/prisma/dev.db-journal` - 트랜잭션 로그 파일

### 환경설정
- `.env` 파일의 `DATABASE_URL` 설정됨:
  ```
  DATABASE_URL="file:./dev.db"
  ```

---

## 테스트 결과

### 스키마 검증 테스트 완료
✓ Post 모델 생성 - 성공
✓ Comment 모델 생성 - 성공
✓ 관계 설정 - 성공
✓ CRUD 작업 - 모두 성공
✓ CASCADE 삭제 - 성공

### 테스트 실행 파일
- `/prisma/test-schema.js` - 스키마 검증 테스트 코드

테스트 결과:
- 2개 Post 생성 성공
- 2개 Comment 생성 성공
- 게시글 조회, 수정, 댓글 조회 모두 성공
- 댓글 삭제 시 cascade 작동 확인

---

## 다음 단계

### 백엔드 구현 (Express.js)
1. `/api/posts` - GET (목록 조회)
2. `/api/posts/:id` - GET (상세 조회 + 조회수 증가)
3. `/api/posts` - POST (새 게시글 생성)
4. `/api/posts/:id` - PUT (게시글 수정)
5. `/api/posts/:id` - DELETE (게시글 삭제)
6. `/api/posts/:id/comments` - POST (댓글 작성)
7. `/api/posts/:id/comments` - GET (댓글 목록)
8. `/api/comments/:id` - DELETE (댓글 삭제)

### 필수 패키지
- express: ^5.2.1 (이미 설치)
- cors: ^2.8.6 (이미 설치)
- @prisma/client: 6.4.1 (이미 설치)
- prisma: 6.4.1 (이미 설치)

---

## 스키마 파일 위치

| 파일 | 경로 |
|------|------|
| Prisma 스키마 | `/prisma/schema.prisma` |
| Prisma Client | `/prisma/client.js` |
| 마이그레이션 | `/prisma/migrations/20260819123354_init/` |
| SQLite DB | `/prisma/dev.db` |
| 환경설정 | `/.env` |

---

## 참고사항

### 데이터 타입 고려사항
- **String**: SQLite의 TEXT로 자동 매핑 (대용량 텍스트 지원)
- **Int**: INTEGER 타입
- **DateTime**: DATETIME 타입 (ISO 8601 형식)

### 성능 최적화
- createdAt 인덱스: 최신순 정렬 성능 향상
- authorName 인덱스: 작성자별 조회 성능 향상
- postId 인덱스: 게시글별 댓글 조회 성능 향상

### 데이터 무결성
- Foreign Key 제약조건으로 참조 무결성 보장
- ON DELETE CASCADE로 고아 데이터 자동 정리
- 자동 타임스탐프로 생성/수정 시간 추적

---

**스키마 설계 완료**: 2026-08-19 21:34 UTC
**상태**: ✓ 프로덕션 준비 완료
