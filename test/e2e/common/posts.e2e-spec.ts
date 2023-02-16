import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { correctBlog } from '../../stubs/blogs.stub';
import {
  correctNewPost,
  correctPost,
  emptyPosts,
  incorrectPost
} from '../../stubs/posts.stub';
import { correctLogin1, correctUser1 } from '../../stubs/users.stub';
import {
  errorsMessageForIncorrectComment,
  errorsMessageForIncorrectPostLike,
  errorsMessageForIncorrectPostWithBlogId
} from '../../stubs/error.stub';
import { correctComment, inCorrectComment } from '../../stubs/comments.stub';
import {
  badPostLikeStatus,
  correctPostLikeStatus
} from '../../stubs/post.likes.stub';
import { setConfigNestApp } from '../../configuration.test';

describe('PostsController (e2e)', () => {
  let configuredNesApp: INestApplication;
  let app: any;
  let createdBlog: any;
  let createdUser: any;
  let createdToken: any;
  let createdPost: any;
  let createdPost2: any;
  let createdComment: any;

  beforeAll(async () => {
    configuredNesApp = await setConfigNestApp();
    await configuredNesApp.init();
    app = configuredNesApp.getHttpServer();

    await request(app).delete('/testing/all-data');
    const response1 = await request(app)
      .post('/blogs')
      .auth('admin', 'qwerty')
      .send(correctBlog)
      .expect(HttpStatus.CREATED);
    createdBlog = response1.body;
    correctPost.blogId = createdBlog.id;
    correctNewPost.blogId = createdBlog.id;
    const response2 = await request(app)
      .post('/sa/users')
      .auth('admin', 'qwerty')
      .send(correctUser1)
      .expect(HttpStatus.CREATED);
    createdUser = response2.body;
    const response3 = await request(app)
      .post('/auth/login')
      .send(correctLogin1)
      .expect(HttpStatus.OK);
    createdToken = response3.body;
  });

  afterAll(async () => {
    await configuredNesApp.close();
  });

  describe('1 GET /posts:', () => {
    it('1.1 GET /posts: should return 200 and empty array', async () => {
      await request(app).get('/posts').expect(HttpStatus.OK).expect(emptyPosts);
    });
    it('1.2 GET /posts/bad-id: should return 404 for not existing posts', async () => {
      await request(app).get('/posts/999').expect(HttpStatus.NOT_FOUND);
    });
  });
  describe('2 POST /posts:', () => {
    it(`2.1 POST /posts: shouldn't create posts without authorization`, async () => {
      await request(app)
        .post('/posts')
        .send(correctPost)
        .expect(HttpStatus.UNAUTHORIZED);
      await request(app).get('/posts').expect(HttpStatus.OK).expect(emptyPosts);
    });
    it(`2.2 POST /posts: shouldn't create posts with incorrect data`, async () => {
      const errMes = await request(app)
        .post('/posts')
        .auth('admin', 'qwerty')
        .send(incorrectPost)
        .expect(HttpStatus.BAD_REQUEST);
      await request(app).get('/posts').expect(HttpStatus.OK).expect(emptyPosts);
      expect(errMes.body).toEqual(errorsMessageForIncorrectPostWithBlogId);
    });
    it(`2.3 POST /posts: should create posts with correct data`, async () => {
      const response = await request(app)
        .post('/posts')
        .auth('admin', 'qwerty')
        .send(correctPost)
        .expect(HttpStatus.CREATED);
      createdPost = response.body;
      expect(createdPost).toEqual({
        id: expect.any(String),
        ...correctPost,
        blogName: createdBlog.name,
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: []
        }
      });
    });
  });
  describe('3 GET /posts:', () => {
    it(`3.1 GET /posts/id: should return post by id`, async () => {
      const response = await request(app)
        .get('/posts' + '/' + createdPost.id)
        .expect(HttpStatus.OK);
      expect(response.body).toEqual({
        id: expect.any(String),
        ...createdPost,
        blogName: createdBlog.name,
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: []
        }
      });
    });
  });
  describe('4 PUT /posts:', () => {
    it(`4.1 PUT /posts/id: shouldn't update post without authorization`, async () => {
      await request(app)
        .put('/posts' + '/' + createdPost.id)
        .send(correctNewPost)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it(`4.2 PUT /posts/id: shouldn't update post with incorrect data`, async () => {
      const errMes = await request(app)
        .put('/posts' + '/' + createdPost.id)
        .auth('admin', 'qwerty')
        .send(incorrectPost)
        .expect(HttpStatus.BAD_REQUEST);
      expect(errMes.body).toEqual(errorsMessageForIncorrectPostWithBlogId);
    });
    it(`4.3 PUT /posts/id: should update post with correct data`, async () => {
      await request(app)
        .put('/posts' + '/' + createdPost.id)
        .auth('admin', 'qwerty')
        .send(correctNewPost)
        .expect(HttpStatus.NO_CONTENT);
      const response = await request(app)
        .get('/posts' + '/' + createdPost.id)
        .expect(HttpStatus.OK);
      expect(response.body).toEqual({
        id: expect.any(String),
        ...correctNewPost,
        blogName: createdBlog.name,
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: []
        }
      });
    });
    it('4.4 PUT /posts/bad-id: should return 404 for not existing post', async () => {
      await request(app)
        .put('/posts/999')
        .auth('admin', 'qwerty')
        .send(correctNewPost)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
  describe('5 DELETE /posts:', () => {
    it(`5.1 DELETE /posts/id: shouldn't delete post without authorization`, async () => {
      await request(app)
        .delete('/posts' + '/' + createdPost.id)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it(`5.2 DELETE /posts/bad-id: should return 404 for not existing post`, async () => {
      await request(app)
        .delete('/posts/999')
        .auth('admin', 'qwerty')
        .expect(HttpStatus.NOT_FOUND);
    });
    it(`5.3 DELETE /posts/id: should delete post`, async () => {
      await request(app)
        .delete('/posts' + '/' + createdPost.id)
        .auth('admin', 'qwerty')
        .expect(HttpStatus.NO_CONTENT);
      await request(app).get('/posts').expect(HttpStatus.OK).expect(emptyPosts);
    });
  });
  describe('6 POST /posts/id/comments:', () => {
    it(`6.1 POST /posts/id/comments: shouldn't create comment without authorization`, async () => {
      await request(app)
        .post('/posts' + '/' + createdPost.id + '/comments')
        .send(correctComment)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it(`6.2 POST /posts/id/comments: shouldn't update comment with incorrect data`, async () => {
      const errMes = await request(app)
        .post('/posts' + '/' + createdPost.id + '/comments')
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .send(inCorrectComment)
        .expect(HttpStatus.BAD_REQUEST);
      expect(errMes.body).toEqual(errorsMessageForIncorrectComment);
    });
    it(`6.3 POST /posts/bad-id/comments: should return 404 for not existing comment`, async () => {
      await request(app)
        .post('/posts/999/comments')
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .send(correctComment)
        .expect(HttpStatus.NOT_FOUND);
    });
    it(`6.4 POST /posts/id/comments:  should create comment with correct data`, async () => {
      const response = await request(app)
        .post('/posts')
        .auth('admin', 'qwerty')
        .send(correctPost)
        .expect(HttpStatus.CREATED);
      createdPost2 = response.body;
      const response2 = await request(app)
        .post('/posts' + '/' + createdPost2.id + '/comments')
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .send(correctComment)
        .expect(HttpStatus.CREATED);
      createdComment = response2.body;
      expect(createdComment).toEqual({
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
  describe('7 GET /posts/id/comments:', () => {
    it(`7.1 GET /posts/bad-id/comments: should return 404 for not existing comment`, async () => {
      await request(app)
        .get('/posts/999/comments')
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .expect(HttpStatus.NOT_FOUND);
    });
    it(`7.2 GET /posts/id/comments:  should return comments by post's id`, async () => {
      const result = await request(app)
        .get('/posts' + '/' + createdPost2.id + '/comments')
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .expect(HttpStatus.OK);
      expect(result.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
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
          }
        ]
      });
    });
  });
  describe('8 PUT /posts/id/like-status:', () => {
    it(`8.1 PUT /posts/id/like-status: should return 401 without authorization`, async () => {
      await request(app)
        .put('/posts' + '/' + createdPost2.id + '/' + 'like-status')
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it(`8.2 PUT /posts/id/like-status: should return 400 with bad body`, async () => {
      const errMes = await request(app)
        .put('/posts' + '/' + createdPost2.id + '/' + 'like-status')
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .send(badPostLikeStatus)
        .expect(HttpStatus.BAD_REQUEST);
      expect(errMes.body).toEqual(errorsMessageForIncorrectPostLike);
    });
    it(`8.3 PUT /posts/bad-id/like-status: should return 404 if post not exist`, async () => {
      await request(app)
        .put('/posts' + '/' + 999 + '/' + 'like-status')
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .send(correctPostLikeStatus)
        .expect(HttpStatus.NOT_FOUND);
    });
    it(`8.4 PUT /posts/id/like-status: should return 204 if all ok`, async () => {
      await request(app)
        .put('/posts' + '/' + createdPost2.id + '/' + 'like-status')
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .send(correctPostLikeStatus)
        .expect(HttpStatus.NO_CONTENT);
      const response = await request(app)
        .get('/posts' + '/' + createdPost2.id)
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .expect(HttpStatus.OK);
      expect(response.body).toEqual({
        id: expect.any(String),
        ...correctPost,
        blogName: createdBlog.name,
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 1,
          dislikesCount: 0,
          myStatus: 'Like',
          newestLikes: [
            {
              addedAt: expect.any(String),
              userId: createdUser.id,
              login: createdUser.login
            }
          ]
        }
      });
      const response2 = await request(app)
        .get('/posts' + '/' + createdPost2.id)
        .expect(HttpStatus.OK);
      expect(response2.body).toEqual({
        id: expect.any(String),
        ...correctPost,
        blogName: createdBlog.name,
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 1,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [
            {
              addedAt: expect.any(String),
              userId: createdUser.id,
              login: createdUser.login
            }
          ]
        }
      });
    });
  });
});
