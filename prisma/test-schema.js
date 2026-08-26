const prisma = require('./client');

async function testSchema() {
  try {
    console.log('=== Prisma 스키마 테스트 시작 ===\n');

    // 1. Post 생성
    console.log('1. 테스트 게시글 생성 중...');
    const post1 = await prisma.post.create({
      data: {
        title: '첫 번째 게시글입니다',
        content: '이것은 테스트 게시글의 내용입니다.',
        authorName: '홍길동',
        viewCount: 0
      }
    });
    console.log('✓ 생성된 게시글:', post1);

    // 2. 추가 Post 생성
    console.log('\n2. 추가 게시글 생성 중...');
    const post2 = await prisma.post.create({
      data: {
        title: 'Prisma ORM 학습',
        content: 'Prisma는 Node.js ORM으로 매우 강력합니다.',
        authorName: '김철수',
        viewCount: 5
      }
    });
    console.log('✓ 생성된 게시글:', post2);

    // 3. Comment 생성
    console.log('\n3. 댓글 생성 중...');
    const comment1 = await prisma.comment.create({
      data: {
        content: '좋은 글이네요!',
        authorName: '이영희',
        postId: post1.id
      }
    });
    console.log('✓ 생성된 댓글:', comment1);

    const comment2 = await prisma.comment.create({
      data: {
        content: 'Prisma 정말 좋습니다!',
        authorName: '박민수',
        postId: post1.id
      }
    });
    console.log('✓ 생성된 댓글:', comment2);

    // 4. 전체 Post 조회
    console.log('\n4. 모든 게시글 조회 중...');
    const allPosts = await prisma.post.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    console.log(`✓ 조회된 게시글 수: ${allPosts.length}`);
    allPosts.forEach((post, idx) => {
      console.log(`  ${idx + 1}. ${post.title} (작성자: ${post.authorName})`);
    });

    // 5. 특정 Post 상세 조회 (댓글 포함)
    console.log('\n5. 게시글 상세 조회 중...');
    const postDetail = await prisma.post.findUnique({
      where: { id: post1.id },
      include: {
        comments: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
    console.log('✓ 게시글:', postDetail.title);
    console.log(`  댓글 수: ${postDetail.comments.length}`);
    postDetail.comments.forEach((comment, idx) => {
      console.log(`  ${idx + 1}. ${comment.content} (작성자: ${comment.authorName})`);
    });

    // 6. 게시글 수정
    console.log('\n6. 게시글 수정 중...');
    const updatedPost = await prisma.post.update({
      where: { id: post1.id },
      data: {
        title: '수정된 첫 번째 게시글입니다',
        viewCount: 10
      }
    });
    console.log('✓ 수정된 게시글:', updatedPost.title);

    // 7. 댓글 삭제
    console.log('\n7. 댓글 삭제 중...');
    const deletedComment = await prisma.comment.delete({
      where: { id: comment2.id }
    });
    console.log('✓ 삭제된 댓글:', deletedComment.content);

    // 8. 삭제 후 댓글 수 확인
    console.log('\n8. 삭제 후 댓글 수 확인...');
    const remainingComments = await prisma.comment.findMany({
      where: { postId: post1.id }
    });
    console.log(`✓ 남은 댓글 수: ${remainingComments.length}`);

    console.log('\n=== 테스트 완료 ===');
    console.log('모든 Prisma 스키마 테스트가 성공적으로 완료되었습니다!');

  } catch (error) {
    console.error('❌ 에러 발생:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testSchema();
