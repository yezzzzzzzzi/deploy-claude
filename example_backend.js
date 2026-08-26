import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

// 미들웨어 설정
app.use(express.json());

// CORS 설정 - 모든 요청 허용
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 요청 로깅 미들웨어
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// POST /api/todos - 할일 추가
app.post('/api/todos', async (req, res) => {
  try {
    const { todoText, todoCompleted = false } = req.body;

    // 입력값 검증
    if (!todoText || typeof todoText !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'todoText는 필수 입력값이며 문자열이어야 합니다.'
      });
    }

    if (todoText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '할일 내용은 비어있을 수 없습니다.'
      });
    }

    if (typeof todoCompleted !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'todoCompleted는 boolean 값이어야 합니다.'
      });
    }

    // 데이터베이스에 저장
    const todo = await prisma.todo.create({
      data: {
        todoText: todoText.trim(),
        todoCompleted
      }
    });

    res.status(201).json({
      success: true,
      data: todo
    });
  } catch (error) {
    console.error('POST /api/todos 에러:', error);
    res.status(500).json({
      success: false,
      message: '할일 추가 중 오류가 발생했습니다.'
    });
  }
});

// GET /api/todos - 할일 목록 조회
app.get('/api/todos', async (req, res) => {
  try {
    const { todoCompleted } = req.query;

    // 조회 조건 구성
    const where = {};
    if (todoCompleted !== undefined) {
      where.todoCompleted = todoCompleted === 'true';
    }

    const todos = await prisma.todo.findMany({
      where,
      orderBy: {
        todoCreateAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      data: todos,
      count: todos.length
    });
  } catch (error) {
    console.error('GET /api/todos 에러:', error);
    res.status(500).json({
      success: false,
      message: '할일 목록 조회 중 오류가 발생했습니다.'
    });
  }
});

// GET /api/todos/:id - 할일 상세 조회
app.get('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // ID 검증
    if (!Number.isInteger(Number(id))) {
      return res.status(400).json({
        success: false,
        message: 'ID는 정수여야 합니다.'
      });
    }

    const todo = await prisma.todo.findUnique({
      where: {
        id: Number(id)
      }
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: '해당 할일을 찾을 수 없습니다.'
      });
    }

    res.status(200).json({
      success: true,
      data: todo
    });
  } catch (error) {
    console.error('GET /api/todos/:id 에러:', error);
    res.status(500).json({
      success: false,
      message: '할일 조회 중 오류가 발생했습니다.'
    });
  }
});

// PUT /api/todos/:id - 할일 수정 (완료 상태)
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { todoText, todoCompleted } = req.body;

    // ID 검증
    if (!Number.isInteger(Number(id))) {
      return res.status(400).json({
        success: false,
        message: 'ID는 정수여야 합니다.'
      });
    }

    // 입력값 검증
    const updateData = {};

    if (todoText !== undefined) {
      if (typeof todoText !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'todoText는 문자열이어야 합니다.'
        });
      }

      if (todoText.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: '할일 내용은 비어있을 수 없습니다.'
        });
      }

      updateData.todoText = todoText.trim();
    }

    if (todoCompleted !== undefined) {
      if (typeof todoCompleted !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'todoCompleted는 boolean 값이어야 합니다.'
        });
      }

      updateData.todoCompleted = todoCompleted;
    }

    // 수정할 데이터가 없으면 에러
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: '수정할 데이터가 없습니다.'
      });
    }

    // 해당 할일이 존재하는지 확인
    const existingTodo = await prisma.todo.findUnique({
      where: {
        id: Number(id)
      }
    });

    if (!existingTodo) {
      return res.status(404).json({
        success: false,
        message: '해당 할일을 찾을 수 없습니다.'
      });
    }

    // 데이터 수정
    const updatedTodo = await prisma.todo.update({
      where: {
        id: Number(id)
      },
      data: updateData
    });

    res.status(200).json({
      success: true,
      data: updatedTodo
    });
  } catch (error) {
    console.error('PUT /api/todos/:id 에러:', error);
    res.status(500).json({
      success: false,
      message: '할일 수정 중 오류가 발생했습니다.'
    });
  }
});

// DELETE /api/todos/:id - 할일 삭제
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // ID 검증
    if (!Number.isInteger(Number(id))) {
      return res.status(400).json({
        success: false,
        message: 'ID는 정수여야 합니다.'
      });
    }

    // 해당 할일이 존재하는지 확인
    const existingTodo = await prisma.todo.findUnique({
      where: {
        id: Number(id)
      }
    });

    if (!existingTodo) {
      return res.status(404).json({
        success: false,
        message: '해당 할일을 찾을 수 없습니다.'
      });
    }

    // 데이터 삭제
    const deletedTodo = await prisma.todo.delete({
      where: {
        id: Number(id)
      }
    });

    res.status(200).json({
      success: true,
      data: deletedTodo,
      message: '할일이 삭제되었습니다.'
    });
  } catch (error) {
    console.error('DELETE /api/todos/:id 에러:', error);
    res.status(500).json({
      success: false,
      message: '할일 삭제 중 오류가 발생했습니다.'
    });
  }
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error('전체 에러:', err);
  res.status(500).json({
    success: false,
    message: '서버 오류가 발생했습니다.'
  });
});

// 서버 시작
const PORT = process.env.PORT || 8000;
console.log(`포트: ${PORT}`);

async function startServer() {
  try {
    // Prisma 연결 테스트
    await prisma.$connect();
    console.log('Prisma 데이터베이스 연결 성공');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log('사용 가능한 엔드포인트:');
      console.log('  POST   /api/todos         - 할일 추가');
      console.log('  GET    /api/todos         - 할일 목록 조회');
      console.log('  GET    /api/todos/:id     - 할일 상세 조회');
      console.log('  PUT    /api/todos/:id     - 할일 수정');
      console.log('  DELETE /api/todos/:id     - 할일 삭제');
    });
  } catch (error) {
    console.error('서버 시작 오류:', error);
    process.exit(1);
  }
}

// 프로세스 종료 시 Prisma 연결 해제
process.on('SIGINT', async () => {
  console.log('\n서버를 종료합니다...');
  await prisma.$disconnect();
  process.exit(0);
});

// 예외 처리
process.on('uncaughtException', (error) => {
  console.error('예외 발생:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('처리되지 않은 거부:', reason);
  process.exit(1);
});

startServer();

export default app;
