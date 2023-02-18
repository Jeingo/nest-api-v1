import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  correctBlog,
  correctNewBlog,
  emptyBlogs,
  incorrectBlog
} from '../../stubs/blogs.stub';
import {
  errorsMessageForIncorrectBlog,
  errorsMessageForIncorrectPost,
  errorsMessageForIncorrectPostWithBlogId
} from '../../stubs/error.stub';
import {
  correctNewPost,
  correctPostById,
  emptyPosts,
  incorrectPost,
  incorrectPostById
} from '../../stubs/posts.stub';
import { setConfigNestApp } from '../../configuration.test';
import {
  correctLogin,
  correctLogin1,
  correctUser,
  correctUser1
} from '../../stubs/users.stub';

describe('BloggerBlogsController (e2e)', () => {
  let configuredNesApp: INestApplication;
  let app: any;
  let createdBlog: any;
  let createdBlogAnotherUser: any;
  let createdBlog2: any;
  let createdToken: any;
  let createdToken2: any;
  let createdPost: any;

  const bloggerBlogsPath = '/blogger/blogs';

  beforeAll(async () => {
    configuredNesApp = await setConfigNestApp();
    await configuredNesApp.init();
    app = configuredNesApp.getHttpServer();

    await request(app).delete('/testing/all-data');

    await request(app)
      .post('/sa/users')
      .auth('admin', 'qwerty')
      .send(correctUser)
      .expect(HttpStatus.CREATED);

    const createdResponseToken = await request(app)
      .post('/auth/login')
      .send(correctLogin)
      .expect(HttpStatus.OK);
    createdToken = createdResponseToken.body;

    await request(app)
      .post('/sa/users')
      .auth('admin', 'qwerty')
      .send(correctUser1)
      .expect(HttpStatus.CREATED);

    const createdResponseToken2 = await request(app)
      .post('/auth/login')
      .send(correctLogin1)
      .expect(HttpStatus.OK);
    createdToken2 = createdResponseToken2.body;
  });

  afterAll(async () => {
    await configuredNesApp.close();
  });

  describe(`1 GET ${bloggerBlogsPath}:`, () => {
    it(`1.1 GET ${bloggerBlogsPath}: should return 401 without authorization`, async () => {
      await request(app).get(bloggerBlogsPath).expect(HttpStatus.UNAUTHORIZED);
    });
    it(`1.2 GET ${bloggerBlogsPath}: should return 200 and empty paginated array`, async () => {
      await request(app)
        .get(bloggerBlogsPath)
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .expect(HttpStatus.OK)
        .expect(emptyBlogs);
    });
  });

  describe(`2 POST ${bloggerBlogsPath}:`, () => {
    it(`2.1 POST ${bloggerBlogsPath}: should return 401 without authorization`, async () => {
      await request(app)
        .post(bloggerBlogsPath)
        .send(correctBlog)
        .expect(HttpStatus.UNAUTHORIZED);
      await request(app)
        .get(bloggerBlogsPath)
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .expect(HttpStatus.OK)
        .expect(emptyBlogs);
    });
    it(`2.2 POST ${bloggerBlogsPath}: should return 400 with incorrect data`, async () => {
      const errMes = await request(app)
        .post(bloggerBlogsPath)
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .send(incorrectBlog)
        .expect(HttpStatus.BAD_REQUEST);
      await request(app)
        .get(bloggerBlogsPath)
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .expect(HttpStatus.OK)
        .expect(emptyBlogs);
      expect(errMes.body).toEqual(errorsMessageForIncorrectBlog);
    });
    it(`2.3 POST ${bloggerBlogsPath}: should return 201 and create blog`, async () => {
      const response = await request(app)
        .post(bloggerBlogsPath)
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .send(correctBlog)
        .expect(HttpStatus.CREATED);
      createdBlog = response.body;
      expect(response.body).toEqual({
        id: expect.any(String),
        ...correctBlog,
        isMembership: false,
        createdAt: expect.any(String)
      });
    });
  });
  describe(`3 GET ${bloggerBlogsPath}:`, () => {
    it(`3.1 GET ${bloggerBlogsPath}: should return 200 and paginated blog`, async () => {
      const response = await request(app)
        .get(bloggerBlogsPath)
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .expect(HttpStatus.OK);
      expect(response.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: expect.any(String),
            ...correctBlog,
            isMembership: false,
            createdAt: expect.any(String)
          }
        ]
      });
    });
  });
  describe(`4 PUT ${bloggerBlogsPath}:`, () => {
    it(`4.1 PUT ${bloggerBlogsPath}/id: should return 401 without authorization`, async () => {
      await request(app)
        .put(bloggerBlogsPath + '/' + createdBlog.id)
        .send(correctNewBlog)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it(`4.2 PUT ${bloggerBlogsPath}/id: should return 400 with incorrect data`, async () => {
      const errMes = await request(app)
        .put(bloggerBlogsPath + '/' + createdBlog.id)
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .send(incorrectBlog)
        .expect(HttpStatus.BAD_REQUEST);
      expect(errMes.body).toEqual(errorsMessageForIncorrectBlog);
    });
    it(`4.3 PUT ${bloggerBlogsPath}/id: should return 204 with correct data`, async () => {
      await request(app)
        .put(bloggerBlogsPath + '/' + createdBlog.id)
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .send(correctNewBlog)
        .expect(HttpStatus.NO_CONTENT);
      const response = await request(app)
        .get(bloggerBlogsPath)
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .expect(HttpStatus.OK);
      expect(response.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: expect.any(String),
            ...correctNewBlog,
            isMembership: false,
            createdAt: expect.any(String)
          }
        ]
      });
    });
    it(`4.4 PUT ${bloggerBlogsPath}/bad-id: should return 404 for not existing blog`, async () => {
      await request(app)
        .put(bloggerBlogsPath + '/999')
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .send(correctNewBlog)
        .expect(HttpStatus.NOT_FOUND);
    });
    it(`4.5 PUT ${bloggerBlogsPath}/id: should return 403 if blogId another user `, async () => {
      const response = await request(app)
        .post(bloggerBlogsPath)
        .set('Authorization', 'Bearer ' + createdToken2.accessToken)
        .send(correctBlog)
        .expect(HttpStatus.CREATED);
      createdBlogAnotherUser = response.body;
      await request(app)
        .put(bloggerBlogsPath + '/' + createdBlogAnotherUser.id)
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .send(correctNewBlog)
        .expect(HttpStatus.FORBIDDEN);
    });
  });
  describe(`5 DELETE ${bloggerBlogsPath}:`, () => {
    it(`5.1 DELETE ${bloggerBlogsPath}/id: should return 401 without authorization`, async () => {
      await request(app)
        .delete(bloggerBlogsPath + '/' + createdBlog.id)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it(`5.2 DELETE${bloggerBlogsPath}/bad-id: should return 404 for not existing blog`, async () => {
      await request(app)
        .delete(bloggerBlogsPath + '/999')
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .expect(HttpStatus.NOT_FOUND);
    });
    it(`5.3 DELETE ${bloggerBlogsPath}/id: should return 204 and delete blog`, async () => {
      await request(app)
        .delete(bloggerBlogsPath + '/' + createdBlog.id)
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .expect(HttpStatus.NO_CONTENT);
      await request(app)
        .get(bloggerBlogsPath)
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .expect(HttpStatus.OK)
        .expect(emptyBlogs);
    });
    it(`5.4 DELETE ${bloggerBlogsPath}/id: should return 403 if blogId another user`, async () => {
      await request(app)
        .delete(bloggerBlogsPath + '/' + createdBlogAnotherUser.id)
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .expect(HttpStatus.FORBIDDEN);
    });
  });
  describe(`6 POST ${bloggerBlogsPath}/id/posts:`, () => {
    it(`6.1 POST ${bloggerBlogsPath}/id/posts: should return 401 without authorization`, async () => {
      const createdResponse = await request(app)
        .post(bloggerBlogsPath)
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .send(correctBlog)
        .expect(HttpStatus.CREATED);
      createdBlog2 = createdResponse.body;
      await request(app)
        .post(bloggerBlogsPath + '/' + createdBlog2.id + '/posts')
        .send(correctPostById)
        .expect(HttpStatus.UNAUTHORIZED);
      await request(app).get('/posts').expect(HttpStatus.OK).expect(emptyPosts);
    });
    it(`6.2 POST ${bloggerBlogsPath}/id/posts: should return 400 with incorrect data`, async () => {
      const errMes = await request(app)
        .post(bloggerBlogsPath + '/' + createdBlog2.id + '/posts')
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .send(incorrectPostById)
        .expect(HttpStatus.BAD_REQUEST);
      expect(errMes.body).toEqual(errorsMessageForIncorrectPost);
    });
    it(`6.3 POST ${bloggerBlogsPath}/id/posts: should return 201 with correct data`, async () => {
      const response = await request(app)
        .post(bloggerBlogsPath + '/' + createdBlog2.id + '/posts')
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .send(correctPostById)
        .expect(HttpStatus.CREATED);
      createdPost = response.body;
      expect(response.body).toEqual({
        id: expect.any(String),
        ...correctPostById,
        blogId: createdBlog2.id,
        blogName: createdBlog2.name,
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: []
        }
      });
    });
    it(`6.4 POST${bloggerBlogsPath}/bad-id/posts: should return 404 for not existing post by blog's id`, async () => {
      await request(app)
        .post(bloggerBlogsPath + '/999/posts')
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .send(correctPostById)
        .expect(HttpStatus.NOT_FOUND);
    });
    it(`6.5 POST${bloggerBlogsPath}/id/posts: should return 403 if blogId another user`, async () => {
      await request(app)
        .post(bloggerBlogsPath + '/' + createdBlogAnotherUser.id + '/posts')
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .send(correctPostById)
        .expect(HttpStatus.FORBIDDEN);
    });
  });
  describe(`7 PUT ${bloggerBlogsPath}/id/posts:`, () => {
    it(`7.1 PUT ${bloggerBlogsPath}/blogId/posts/postId: should return 401 without authorization`, async () => {
      await request(app)
        .put(
          bloggerBlogsPath +
            '/' +
            createdBlog2.id +
            '/posts' +
            '/' +
            createdPost.id
        )
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it(`7.2 PUT ${bloggerBlogsPath}/blogId/posts/postId: should return 400 with incorrect data`, async () => {
      const errMes = await request(app)
        .put(
          bloggerBlogsPath +
            '/' +
            createdBlog2.id +
            '/posts' +
            '/' +
            createdPost.id
        )
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .send(incorrectPost)
        .expect(HttpStatus.BAD_REQUEST);
      expect(errMes.body).toEqual(errorsMessageForIncorrectPostWithBlogId);
    });
    it(`7.3 PUT ${bloggerBlogsPath}/bad-blogId/posts/bad-postId: should return 404 with incorrect id`, async () => {
      await request(app)
        .put(bloggerBlogsPath + '/999/posts/999')
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .send(correctNewPost)
        .expect(HttpStatus.NOT_FOUND);
    });
    it(`7.4 PUT ${bloggerBlogsPath}/blogId/posts/postId: should return 403 if id another user`, async () => {
      await request(app)
        .put(
          bloggerBlogsPath +
            '/' +
            createdBlog2.id +
            '/posts' +
            '/' +
            createdPost.id
        )
        .set('Authorization', 'Bearer ' + createdToken2.accessToken)
        .send(correctNewPost)
        .expect(HttpStatus.FORBIDDEN);
    });
    it(`7.4 PUT ${bloggerBlogsPath}/blogId/posts/postId: should return 204 with correct data`, async () => {
      await request(app)
        .put(
          bloggerBlogsPath +
            '/' +
            createdBlog2.id +
            '/posts' +
            '/' +
            createdPost.id
        )
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .send(correctNewPost)
        .expect(HttpStatus.NO_CONTENT);
      const response = await request(app)
        .get('/posts' + '/' + createdPost.id)
        .expect(HttpStatus.OK);
      expect(response.body).toEqual({
        id: expect.any(String),
        ...correctNewPost,
        blogId: createdBlog2.id,
        blogName: createdBlog2.name,
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
  describe(`8 DELETE ${bloggerBlogsPath}/id/posts:`, () => {
    it(`8.1 DELETE ${bloggerBlogsPath}/blogId/posts/postId: should return 401 without authorization`, async () => {
      await request(app)
        .delete(
          bloggerBlogsPath +
            '/' +
            createdBlog2.id +
            '/posts' +
            '/' +
            createdPost.id
        )
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it(`8.2 DELETE ${bloggerBlogsPath}/blogId/posts/postId: should return 404 with incorrect id`, async () => {
      await request(app)
        .delete(bloggerBlogsPath + '/999/posts/999')
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .expect(HttpStatus.NOT_FOUND);
    });
    it(`8.3 DELETE ${bloggerBlogsPath}/blogId/posts/postId: should return 403 if id another user`, async () => {
      await request(app)
        .delete(
          bloggerBlogsPath +
            '/' +
            createdBlog2.id +
            '/posts' +
            '/' +
            createdPost.id
        )
        .set('Authorization', 'Bearer ' + createdToken2.accessToken)
        .expect(HttpStatus.FORBIDDEN);
    });
    it(`8.4 DELETE ${bloggerBlogsPath}/blogId/posts/postId: should return 204 and delete post`, async () => {
      await request(app)
        .delete(
          bloggerBlogsPath +
            '/' +
            createdBlog2.id +
            '/posts' +
            '/' +
            createdPost.id
        )
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .expect(HttpStatus.NO_CONTENT);
      await request(app).get('/posts').expect(HttpStatus.OK).expect(emptyPosts);
    });
  });
  // describe(`9 GET ${bloggerBlogsPath}/comments:`, () => {
  //   it(`9.1 GET ${bloggerBlogsPath}/comments: should return 401 without authorization`, async () => {
  //     await request(app)
  //       .get(bloggerBlogsPath + '/comments')
  //       .expect(HttpStatus.UNAUTHORIZED);
  //   });
  //   it(`9.2 GET ${bloggerBlogsPath}/comments: should return 200 and comments`, async () => {
  //     const response = await request(app)
  //       .get(bloggerBlogsPath + '/comments')
  //       .set('Authorization', 'Bearer ' + createdToken.accessToken)
  //       .expect(HttpStatus.OK);
  //     expect(response.body).toEqual({
  //       pagesCount: 1,
  //       page: 1,
  //       pageSize: 10,
  //       totalCount: 1,
  //       items: [
  //         {
  //           id: expect.any(String),
  //           content: 'string',
  //           commentatorInfo: {
  //             userId: 'string',
  //             userLogin: 'string'
  //           },
  //           createdAt: expect.any(String),
  //           postInfo: {
  //             id: expect.any(String),
  //             title: 'string',
  //             blogId: 'string',
  //             blogName: 'string'
  //           }
  //         }
  //       ]
  //     });
  //   });
  // });
});
