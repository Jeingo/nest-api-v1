import { HttpStatus, INestApplication } from '@nestjs/common';
import { setConfigNestApp } from '../../configuration.test';
import request from 'supertest';
import { correctLogin, correctUser } from '../../stubs/users.stub';
import { correctBlog } from '../../stubs/blogs.stub';

describe('SuperAdminBlogsController (e2e)', () => {
  let configuredNesApp: INestApplication;
  let app: any;
  let createdUser: any;
  let createdToken: any;

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
    await request(app)
      .post(bloggerBlogsPath)
      .set('Authorization', 'Bearer ' + createdToken.accessToken)
      .send(correctBlog)
      .expect(HttpStatus.CREATED);
  });

  afterAll(async () => {
    await configuredNesApp.close();
  });

  describe('1 GET /sa/blogs:', () => {
    it('1.1 GET /sa/blogs: should return 401 without authorization', async () => {
      await request(app).get('/sa/blogs').expect(HttpStatus.UNAUTHORIZED);
    });
    it(`1.2 GET /sa/blogs: should return 200`, async () => {
      const response = await request(app)
        .get('/sa/blogs')
        .auth('admin', 'qwerty')
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
            createdAt: expect.any(String),
            blogOwnerInfo: {
              userId: expect.any(String),
              userLogin: createdUser.login
            }
          }
        ]
      });
    });
  });
  describe('2 PUT /sa/blogs/id/bind-with-user/userId:', () => {
    it('2.1 PUT /sa/blogs/id/bind-with-user/userId: should return 401 without authorization', async () => {
      await request(app)
        .put('/sa/blogs/999/bind-with-user/999')
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('2.2 PUT /sa/blogs/id/bind-with-user/userId: should return 404 with incorrect id', async () => {
      await request(app)
        .put('/sa/blogs/999/bind-with-user/999')
        .auth('admin', 'qwerty')
        .expect(HttpStatus.BAD_REQUEST);
    });
  });
});
