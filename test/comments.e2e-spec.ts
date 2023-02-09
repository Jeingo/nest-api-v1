import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { useContainer } from 'class-validator';
import { HttpExceptionFilter } from '../src/helper/expceptionFilter/exception.filter';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { correctBlog } from './stubs/blogs.stub';
import { correctPost } from './stubs/posts.stub';
import {
  correctLogin,
  correctLogin2,
  correctUser,
  correctUser2
} from './stubs/users.stub';
import {
  correctComment,
  correctCommentNew,
  emptyComments,
  inCorrectComment
} from './stubs/comments.stub';
import {
  errorsMessageForIncorrectComment,
  errorsMessageForIncorrectCommentLike
} from './stubs/error.stub';
import {
  badCommentLikeStatus,
  correctCommentLikeStatus
} from './stubs/comment.likes.stub';

describe.skip('CommentsController (e2e)', () => {
  let nestApp: INestApplication;
  let app: any;
  let createdComment: any;
  let createdUser: any;
  let createdToken: any;
  let createdToken2: any;
  let createdPost: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    nestApp = moduleFixture.createNestApplication();
    useContainer(nestApp.select(AppModule), { fallbackOnErrors: true });
    nestApp.useGlobalPipes(new ValidationPipe({ stopAtFirstError: true }));
    nestApp.useGlobalFilters(new HttpExceptionFilter());
    nestApp.use(cookieParser());

    await nestApp.init();
    app = nestApp.getHttpServer();

    await request(app).delete('/testing/all-data');
    const createdResponseBlog = await request(app)
      .post('/blogs')
      .auth('admin', 'qwerty')
      .send(correctBlog)
      .expect(HttpStatus.CREATED);
    const createdBlog = createdResponseBlog.body;
    correctPost.blogId = createdBlog.id;
    const createdResponsePost = await request(app)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send(correctPost)
      .expect(HttpStatus.CREATED);
    createdPost = createdResponsePost.body;
    const createdResponseUser = await request(app)
      .post('/users')
      .auth('admin', 'qwerty')
      .send(correctUser)
      .expect(HttpStatus.CREATED);
    createdUser = createdResponseUser.body;
    const createdResponseToken = await request(app)
      .post('/auth/login')
      .send(correctLogin)
      .expect(HttpStatus.OK);
    createdToken = createdResponseToken.body;
    const createdResponseComment = await request(app)
      .post('/posts' + '/' + createdPost.id + '/comments')
      .set('Authorization', 'Bearer ' + createdToken.accessToken)
      .send(correctComment)
      .expect(HttpStatus.CREATED);
    createdComment = createdResponseComment.body;
  });

  afterAll(async () => {
    await nestApp.close();
  });

  describe('1 GET /comments/id:', () => {
    it('1.1 GET /comments/bad-id: should return 404 for not existing comments', async () => {
      await request(app).get('/comments/999').expect(HttpStatus.NOT_FOUND);
    });
    it(`1.2 GET /comments/id: should return comments by id`, async () => {
      const response = await request(app)
        .get('/comments' + '/' + createdComment.id)
        .expect(HttpStatus.OK);
      expect(response.body).toEqual({
        id: expect.any(String),
        ...correctComment,
        commentatorInfo: {
          userId: createdUser.id,
          userLogin: createdUser.login
        },
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None'
        }
      });
    });
  });
  describe('2 PUT /comments/id:', () => {
    it(`2.1 PUT /comments/id: shouldn't update comment without authorization`, async () => {
      await request(app)
        .put('/comments' + '/' + createdComment.id)
        .send(correctCommentNew)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it(`2.2 PUT /comments/id: shouldn't update comment with incorrect data`, async () => {
      const errMes = await request(app)
        .put('/comments' + '/' + createdComment.id)
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .send(inCorrectComment)
        .expect(HttpStatus.BAD_REQUEST);
      expect(errMes.body).toEqual(errorsMessageForIncorrectComment);
    });
    it(`2.3 PUT /comments/bad-id: should return 404 for not existing comment`, async () => {
      await request(app)
        .put('/comments/999')
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .send(correctCommentNew)
        .expect(HttpStatus.NOT_FOUND);
    });
    it(`2.4 PUT /comments/id: should return 403 with incorrect token`, async () => {
      await request(app)
        .post('/users')
        .auth('admin', 'qwerty')
        .send(correctUser2)
        .expect(HttpStatus.CREATED);
      const createdResponseToken = await request(app)
        .post('/auth/login')
        .send(correctLogin2)
        .expect(HttpStatus.OK);
      createdToken2 = createdResponseToken.body;
      await request(app)
        .put('/comments' + '/' + createdComment.id)
        .set('Authorization', 'Bearer ' + createdToken2.accessToken)
        .send(correctCommentNew)
        .expect(HttpStatus.FORBIDDEN);
    });
    it(`2.5 PUT /comments/id: should update comment with correct data`, async () => {
      await request(app)
        .put('/comments' + '/' + createdComment.id)
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .send(correctCommentNew)
        .expect(HttpStatus.NO_CONTENT);
      const response = await request(app)
        .get('/comments' + '/' + createdComment.id)
        .expect(HttpStatus.OK);
      expect(response.body).toEqual({
        id: expect.any(String),
        ...correctCommentNew,
        commentatorInfo: {
          userId: createdUser.id,
          userLogin: createdUser.login
        },
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None'
        }
      });
    });
  });
  describe('3 PUT /comments/id/like-status:', () => {
    it(`3.1 PUT /comments/id/like-status: should return 401 without authorization`, async () => {
      await request(app)
        .put('/comments' + '/' + createdComment.id + '/' + 'like-status')
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it(`3.2 PUT /comments/id/like-status: should return 400 with bad body`, async () => {
      const errMes = await request(app)
        .put('/comments' + '/' + createdComment.id + '/' + 'like-status')
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .send(badCommentLikeStatus)
        .expect(HttpStatus.BAD_REQUEST);
      expect(errMes.body).toEqual(errorsMessageForIncorrectCommentLike);
    });
    it(`3.3 PUT /comments/bad-id/like-status: should return 404 if comment not exist`, async () => {
      await request(app)
        .put('/comments' + '/' + 999 + '/' + 'like-status')
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .send(correctCommentLikeStatus)
        .expect(HttpStatus.NOT_FOUND);
    });
    it(`3.4 PUT /comments/id/like-status: should return 204 if all ok`, async () => {
      await request(app)
        .put('/comments' + '/' + createdComment.id + '/' + 'like-status')
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .send(correctCommentLikeStatus)
        .expect(HttpStatus.NO_CONTENT);
      const response = await request(app)
        .get('/comments' + '/' + createdComment.id)
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .expect(HttpStatus.OK);
      expect(response.body).toEqual({
        id: expect.any(String),
        ...correctCommentNew,
        commentatorInfo: {
          userId: createdUser.id,
          userLogin: createdUser.login
        },
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 1,
          dislikesCount: 0,
          myStatus: 'Like'
        }
      });
      const response2 = await request(app)
        .get('/comments' + '/' + createdComment.id)
        .expect(HttpStatus.OK);
      expect(response2.body).toEqual({
        id: expect.any(String),
        ...correctCommentNew,
        commentatorInfo: {
          userId: createdUser.id,
          userLogin: createdUser.login
        },
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 1,
          dislikesCount: 0,
          myStatus: 'None'
        }
      });
    });
  });
  describe('4 DELETE /comments/id:', () => {
    it(`4.1 DELETE /comments/id: shouldn't delete blog without authorization`, async () => {
      await request(app)
        .delete('/comments' + '/' + createdComment.id)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it(`4.2 DELETE /comments/bad-id: should return 404 for not existing comment`, async () => {
      await request(app)
        .delete('/comments/999')
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .expect(HttpStatus.NOT_FOUND);
    });
    it(`4.3 DELETE /comments/id: should return 403 with incorrect token`, async () => {
      await request(app)
        .delete('/comments' + '/' + createdComment.id)
        .set('Authorization', 'Bearer ' + createdToken2.accessToken)
        .expect(HttpStatus.FORBIDDEN);
    });
    it(`4.4 DELETE /comments/id: should delete comment with correct data`, async () => {
      await request(app)
        .delete('/comments' + '/' + createdComment.id)
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .expect(HttpStatus.NO_CONTENT);
      await request(app)
        .get('/posts' + '/' + createdPost.id + '/comments')
        .expect(HttpStatus.OK)
        .expect(emptyComments);
    });
  });
});
