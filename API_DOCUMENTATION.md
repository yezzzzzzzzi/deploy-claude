# 비회원 게시판 API 문서

## 개요
- **기본 URL**: `http://localhost:8000`
- **Content-Type**: `application/json`
- **포트**: 8000
- **데이터베이스**: SQLite (prisma/dev.db)

---

## API 응답 형식

### 성공 응답 (200, 201)
```json
{
  "success": true,
  "data": {},
  "message": "작업 설명",
  "count": 0
}
```

### 실패 응답 (400, 404, 500)
```json
{
  "success": false,
  "message": "에러 설명",
  "error": "상세 에러 메시지"
}
```

---

## 게시글 API (Post)

### 1. 게시글 목록 조회
게시글 목록을 최신순으로 조회합니다.

**요청**
```
GET /api/posts
```

**응답 (200 OK)**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "첫 번째 게시글",
      "content": "게시글 내용",
      "authorName": "익명",
      "viewCount": 5,
      "createdAt": "2026-08-19T12:00:00.000Z",
      "updatedAt": "2026-08-19T12:00:00.000Z"
    }
  ],
  "count": 1
}
```

**cURL 예시**
```bash
curl http://localhost:8000/api/posts
```

---

### 2. 게시글 상세 조회 (조회수 증가)
특정 게시글의 상세 정보를 조회합니다. 조회할 때마다 조회수가 1씩 증가합니다.

**요청**
```
GET /api/posts/:id
```

**경로 매개변수**
- `id` (필수, 정수): 게시글 ID

**응답 (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "첫 번째 게시글",
    "content": "게시글 내용",
    "authorName": "익명",
    "viewCount": 6,
    "createdAt": "2026-08-19T12:00:00.000Z",
    "updatedAt": "2026-08-19T12:00:00.000Z",
    "comments": [
      {
        "id": 1,
        "content": "댓글 내용",
        "authorName": "댓글 작성자",
        "createdAt": "2026-08-19T12:05:00.000Z",
        "postId": 1
      }
    ]
  }
}
```

**오류 응답 (404 Not Found)**
```json
{
  "success": false,
  "message": "해당 게시글을 찾을 수 없습니다."
}
```

**cURL 예시**
```bash
curl http://localhost:8000/api/posts/1
```

---

### 3. 게시글 작성
새로운 게시글을 작성합니다.

**요청**
```
POST /api/posts
Content-Type: application/json
```

**요청 본문**
```json
{
  "title": "게시글 제목",
  "content": "게시글 내용",
  "authorName": "작성자명"
}
```

**필드 설명**
| 필드 | 타입 | 필수 | 제한 | 설명 |
|------|------|------|------|------|
| title | string | O | 1-200자 | 게시글 제목 |
| content | string | O | 1자 이상 | 게시글 내용 |
| authorName | string | O | 1-50자 | 작성자명 |

**응답 (201 Created)**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "title": "새 게시글",
    "content": "내용",
    "authorName": "작성자",
    "viewCount": 0,
    "createdAt": "2026-08-19T12:10:00.000Z",
    "updatedAt": "2026-08-19T12:10:00.000Z"
  },
  "message": "게시글이 작성되었습니다."
}
```

**오류 응답 (400 Bad Request)**
```json
{
  "success": false,
  "message": "title은 필수 입력값이며 문자열이어야 합니다."
}
```

**cURL 예시**
```bash
curl -X POST http://localhost:8000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "첫 게시글",
    "content": "안녕하세요",
    "authorName": "김철수"
  }'
```

---

### 4. 게시글 수정
특정 게시글의 제목이나 내용을 수정합니다.

**요청**
```
PUT /api/posts/:id
Content-Type: application/json
```

**경로 매개변수**
- `id` (필수, 정수): 게시글 ID

**요청 본문** (최소 하나 이상 필수)
```json
{
  "title": "수정된 제목",
  "content": "수정된 내용"
}
```

**응답 (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "수정된 제목",
    "content": "수정된 내용",
    "authorName": "작성자",
    "viewCount": 6,
    "createdAt": "2026-08-19T12:00:00.000Z",
    "updatedAt": "2026-08-19T12:15:00.000Z"
  },
  "message": "게시글이 수정되었습니다."
}
```

**오류 응답 (404 Not Found)**
```json
{
  "success": false,
  "message": "해당 게시글을 찾을 수 없습니다."
}
```

**cURL 예시**
```bash
curl -X PUT http://localhost:8000/api/posts/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "수정된 제목",
    "content": "수정된 내용"
  }'
```

---

### 5. 게시글 삭제
특정 게시글을 삭제합니다. 해당 게시글의 모든 댓글도 함께 삭제됩니다.

**요청**
```
DELETE /api/posts/:id
```

**경로 매개변수**
- `id` (필수, 정수): 게시글 ID

**응답 (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "삭제된 게시글",
    "content": "내용",
    "authorName": "작성자",
    "viewCount": 6,
    "createdAt": "2026-08-19T12:00:00.000Z",
    "updatedAt": "2026-08-19T12:15:00.000Z"
  },
  "message": "게시글이 삭제되었습니다."
}
```

**오류 응답 (404 Not Found)**
```json
{
  "success": false,
  "message": "해당 게시글을 찾을 수 없습니다."
}
```

**cURL 예시**
```bash
curl -X DELETE http://localhost:8000/api/posts/1
```

---

## 댓글 API (Comment)

### 1. 댓글 목록 조회
특정 게시글의 댓글 목록을 최신순으로 조회합니다.

**요청**
```
GET /api/posts/:postId/comments
```

**경로 매개변수**
- `postId` (필수, 정수): 게시글 ID

**응답 (200 OK)**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "content": "좋은 글입니다",
      "authorName": "이순신",
      "createdAt": "2026-08-19T12:05:00.000Z",
      "postId": 1
    }
  ],
  "count": 1
}
```

**오류 응답 (404 Not Found)**
```json
{
  "success": false,
  "message": "해당 게시글을 찾을 수 없습니다."
}
```

**cURL 예시**
```bash
curl http://localhost:8000/api/posts/1/comments
```

---

### 2. 댓글 작성
게시글에 댓글을 작성합니다.

**요청**
```
POST /api/posts/:postId/comments
Content-Type: application/json
```

**경로 매개변수**
- `postId` (필수, 정수): 게시글 ID

**요청 본문**
```json
{
  "content": "댓글 내용",
  "authorName": "댓글 작성자"
}
```

**필드 설명**
| 필드 | 타입 | 필수 | 제한 | 설명 |
|------|------|------|------|------|
| content | string | O | 1-500자 | 댓글 내용 |
| authorName | string | O | 1-50자 | 작성자명 |

**응답 (201 Created)**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "content": "좋은 내용",
    "authorName": "홍길동",
    "createdAt": "2026-08-19T12:20:00.000Z",
    "postId": 1
  },
  "message": "댓글이 작성되었습니다."
}
```

**오류 응답 (404 Not Found)**
```json
{
  "success": false,
  "message": "해당 게시글을 찾을 수 없습니다."
}
```

**cURL 예시**
```bash
curl -X POST http://localhost:8000/api/posts/1/comments \
  -H "Content-Type: application/json" \
  -d '{
    "content": "좋은 글입니다!",
    "authorName": "이순신"
  }'
```

---

### 3. 댓글 삭제
특정 댓글을 삭제합니다.

**요청**
```
DELETE /api/comments/:id
```

**경로 매개변수**
- `id` (필수, 정수): 댓글 ID

**응답 (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "content": "삭제된 댓글",
    "authorName": "이순신",
    "createdAt": "2026-08-19T12:05:00.000Z",
    "postId": 1
  },
  "message": "댓글이 삭제되었습니다."
}
```

**오류 응답 (404 Not Found)**
```json
{
  "success": false,
  "message": "해당 댓글을 찾을 수 없습니다."
}
```

**cURL 예시**
```bash
curl -X DELETE http://localhost:8000/api/comments/1
```

---

## HTTP 상태 코드

| 코드 | 의미 | 설명 |
|------|------|------|
| 200 | OK | 요청 성공 (조회, 수정, 삭제) |
| 201 | Created | 리소스 생성 성공 |
| 400 | Bad Request | 잘못된 요청 (유효성 검사 실패) |
| 404 | Not Found | 리소스를 찾을 수 없음 |
| 500 | Internal Server Error | 서버 에러 |

---

## 에러 코드

| 에러 메시지 | 원인 | 해결 방법 |
|-----------|------|---------|
| ID는 양의 정수여야 합니다 | 경로 매개변수가 정수가 아님 | ID를 정수로 입력 |
| 해당 게시글을 찾을 수 없습니다 | 존재하지 않는 ID | 올바른 ID 확인 |
| title은 필수 입력값입니다 | 필수 필드 누락 | 필수 필드 입력 |
| 제목은 200자 이하여야 합니다 | 제목이 너무 길음 | 제목 길이 감소 |
| 수정할 데이터가 없습니다 | 수정할 필드 없음 | 최소 하나 이상의 필드 지정 |

---

## 서버 실행

### 서버 시작
```bash
npm start
# 또는
node server.js
```

### 개발 환경에서 자동 재시작 (nodemon 설치 후)
```bash
npm install -D nodemon
npm run dev
# 또는
npx nodemon server.js
```

---

## 테스트 시나리오

### 시나리오 1: 게시글 작성 및 조회
```bash
# 1. 게시글 작성
curl -X POST http://localhost:8000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "테스트 게시글",
    "content": "테스트 내용입니다",
    "authorName": "테스터"
  }'

# 응답에서 id 확인 (예: id: 1)

# 2. 게시글 목록 조회
curl http://localhost:8000/api/posts

# 3. 게시글 상세 조회 (조회수 증가)
curl http://localhost:8000/api/posts/1
curl http://localhost:8000/api/posts/1  # 조회수 증가
```

### 시나리오 2: 댓글 작성 및 조회
```bash
# 1. 댓글 작성
curl -X POST http://localhost:8000/api/posts/1/comments \
  -H "Content-Type: application/json" \
  -d '{
    "content": "댓글입니다",
    "authorName": "댓글작성자"
  }'

# 2. 댓글 목록 조회
curl http://localhost:8000/api/posts/1/comments
```

### 시나리오 3: 게시글 수정
```bash
curl -X PUT http://localhost:8000/api/posts/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "수정된 제목"
  }'
```

### 시나리오 4: 삭제
```bash
# 댓글 삭제
curl -X DELETE http://localhost:8000/api/comments/1

# 게시글 삭제 (관련 댓글도 자동 삭제)
curl -X DELETE http://localhost:8000/api/posts/1
```

---

## 데이터베이스 스키마

### Post 테이블 (tbl_post)
```sql
CREATE TABLE tbl_post (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  authorName TEXT NOT NULL,
  viewCount INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Comment 테이블 (tbl_comment)
```sql
CREATE TABLE tbl_comment (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  authorName TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  postId INTEGER NOT NULL,
  FOREIGN KEY (postId) REFERENCES tbl_post(id) ON DELETE CASCADE
);
```

---

## 참고사항

- 모든 시간은 ISO 8601 형식 (UTC)으로 반환됩니다
- 게시글 삭제 시 CASCADE 설정으로 관련 댓글도 자동 삭제됩니다
- 조회수는 게시글 상세 조회할 때만 증가합니다
- authorName은 비회원 게시판이므로 자유롭게 입력 가능합니다
- 입력값에 공백이 있으면 자동으로 trim 처리됩니다
