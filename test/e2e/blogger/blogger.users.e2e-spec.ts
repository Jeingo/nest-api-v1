import { HttpStatus, INestApplication } from '@nestjs/common';
import { setConfigNestApp } from '../../configuration.test';
import request from 'supertest';
import {
  correctLogin,
  correctLogin1,
  correctUser,
  correctUser1
} from '../../stubs/users.stub';
import {
  correctBlogBan,
  incorrectBlogBan
} from '../../stubs/blogger.users.stub';
import { errorsMessageForBloggerBanUser } from '../../stubs/error.stub';
import { correctBlog } from '../../stubs/blogs.stub';

describe('BloggerBlogsController (e2e)', () => {
  let configuredNesApp: INestApplication;
  let app: any;
  let createdUser: any;
  let createdUser1: any;
  let createdToken: any;
  let createdToken1: any;
  let createdBlog: any;

  const bloggerUsersPath = '/blogger/users';
  const bloggerBlogsPath = '/blogger/blogs';

  beforeAll(async () => {
    configuredNesApp = await setConfigNestApp();
    await configuredNesApp.init();
    app = configuredNesApp.getHttpServer();

    await request(app).delete('/testing/all-data');

    const createdResponseUser = await request(app)
      .post('/sa/users')
      .auth('admin', 'qwerty')
      .send(correctUser)
      .expect(HttpStatus.CREATED);
    createdUser = createdResponseUser.body;
    const createdResponseToken = await request(app)
      .post('/auth/login')
      .send(correctLogin)
      .expect(HttpStatus.OK);
    createdToken = createdResponseToken.body;

    const createdResponseBlog = await request(app)
      .post(bloggerBlogsPath)
      .set('Authorization', 'Bearer ' + createdToken.accessToken)
      .send(correctBlog)
      .expect(HttpStatus.CREATED);
    createdBlog = createdResponseBlog.body;
    expect(createdResponseBlog.body).toEqual({
      id: expect.any(String),
      ...correctBlog,
      isMembership: false,
      createdAt: expect.any(String)
    });

    const createdResponseUser2 = await request(app)
      .post('/sa/users')
      .auth('admin', 'qwerty')
      .send(correctUser1)
      .expect(HttpStatus.CREATED);
    createdUser1 = createdResponseUser.body;
    const createdResponseToken2 = await request(app)
      .post('/auth/login')
      .send(correctLogin1)
      .expect(HttpStatus.OK);
    createdToken1 = createdResponseToken.body;
  });

  afterAll(async () => {
    await configuredNesApp.close();
  });

  describe(`1 GET ${bloggerUsersPath}/blog/id:`, () => {
    it(`1.1 GET ${bloggerUsersPath}/blog/id: should return 401 without authorization`, async () => {
      await request(app)
        .get(bloggerUsersPath + '/blog/999')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
  describe(`2 PUT ${bloggerUsersPath}/id/ban:`, () => {
    it(`2.1 PUT ${bloggerUsersPath}/id/ban: should return 401 without authorization`, async () => {
      await request(app)
        .put(bloggerUsersPath + '/999/ban')
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it(`2.2 PUT ${bloggerUsersPath}/id/ban: should return 400 with incorrect data`, async () => {
      const errMes = await request(app)
        .put(bloggerUsersPath + '/' + createdUser1.id + '/ban')
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .send(incorrectBlogBan)
        .expect(HttpStatus.BAD_REQUEST);
      expect(errMes.body).toEqual(errorsMessageForBloggerBanUser);
    });
    it(`2.3 PUT ${bloggerUsersPath}/id/ban: should return 204 with correct data`, async () => {
      const blogBan = { ...correctBlogBan, blogId: createdBlog.id };
      await request(app)
        .put(bloggerUsersPath + '/' + createdUser1.id + '/ban')
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .send(blogBan)
        .expect(HttpStatus.NO_CONTENT);
    });
  });
  describe(`3 GET ${bloggerUsersPath}/blog/id:`, () => {
    it(`3.1 GET ${bloggerUsersPath}/blog/id: should return 200 with correct data`, async () => {
      const response = await request(app)
        .get(bloggerUsersPath + '/blog/' + createdBlog.id)
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
            login: createdUser1.login,
            banInfo: {
              isBanned: true,
              banDate: expect.any(String),
              banReason: correctBlogBan.banReason
            }
          }
        ]
      });
    });
  });
});
