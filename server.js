const app = require('./app');
const prisma = require('./prisma/client');

const PORT = process.env.PORT || 8000;

async function startServer() {
  try {
    // Prisma 연결 테스트
    await prisma.$connect();
    console.log('✓ Prisma 데이터베이스 연결 성공');

    app.listen(PORT, () => {
      console.log(`\n✓ 서버가 시작되었습니다`);
      console.log(`  URL: http://localhost:${PORT}`);
      console.log('\n사용 가능한 엔드포인트:');
      console.log('\n[게시글 API]');
      console.log('  GET    /api/posts           - 게시글 목록 조회');
      console.log('  POST   /api/posts           - 게시글 작성');
      console.log('  GET    /api/posts/:id       - 게시글 상세 조회 (조회수 증가)');
      console.log('  PUT    /api/posts/:id       - 게시글 수정');
      console.log('  DELETE /api/posts/:id       - 게시글 삭제');
      console.log('\n[댓글 API]');
      console.log('  GET    /api/posts/:postId/comments     - 댓글 목록 조회');
      console.log('  POST   /api/posts/:postId/comments     - 댓글 작성');
      console.log('  DELETE /api/comments/:id               - 댓글 삭제');
      console.log('\n');
    });
  } catch (error) {
    console.error('✗ 서버 시작 오류:', error);
    process.exit(1);
  }
}

// 프로세스 종료 시 Prisma 연결 해제
process.on('SIGINT', async () => {
  console.log('\n✓ 서버를 종료합니다...');
  await prisma.$disconnect();
  process.exit(0);
});

// 예외 처리
process.on('uncaughtException', (error) => {
  console.error('✗ 예외 발생:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('✗ 처리되지 않은 거부:', reason);
  process.exit(1);
});

startServer();
