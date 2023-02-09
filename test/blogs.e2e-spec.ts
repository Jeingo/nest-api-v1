import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/helper/expceptionFilter/exception.filter';
import cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import {
  correctBlog,
  correctNewBlog,
  emptyBlogs,
  incorrectBlog
} from './stubs/blogs.stub';
import {
  errorsMessageForIncorrectBlog,
  errorsMessageForIncorrectPost
} from './stubs/error.stub';
import {
  correctPostById,
  emptyPosts,
  incorrectPostById
} from './stubs/posts.stub';

describe('BlogsController (e2e)', () => {
  let nestApp: INestApplication;
  let app: any;
  let createdBlog: any;
  let createdBlog2: any;

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
  });

  afterAll(async () => {
    await nestApp.close();
  });

  describe('1 GET /blogs:', () => {
    it('1.1 GET /blogs: should return 200 and empty paginated array', async () => {
      await request(app).get('/blogs').expect(HttpStatus.OK).expect(emptyBlogs);
    });
    it('1.2 GET /blogs/bad-id: should return 404 for not existing blog', async () => {
      await request(app).get('/blogs/999').expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('2 POST /blogs:', () => {
    it(`2.1 POST /blogs: shouldn't create blog without authorization`, async () => {
      await request(app)
        .post('/blogs')
        .send(correctBlog)
        .expect(HttpStatus.UNAUTHORIZED);
      await request(app).get('/blogs').expect(HttpStatus.OK).expect(emptyBlogs);
    });
    it(`2.2 POST /blogs: shouldn't create blog with incorrect data`, async () => {
      const errMes = await request(app)
        .post('/blogs')
        .auth('admin', 'qwerty')
        .send(incorrectBlog)
        .expect(HttpStatus.BAD_REQUEST);
      await request(app).get('/blogs').expect(HttpStatus.OK).expect(emptyBlogs);
      expect(errMes.body).toEqual(errorsMessageForIncorrectBlog);
    });
    it(`2.3 POST /blogs: should create blog with correct data`, async () => {
      const response = await request(app)
        .post('/blogs')
        .auth('admin', 'qwerty')
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
  describe('3 GET /blogs:', () => {
    it('3.1 GET /blogs/id: should return blog by id', async () => {
      const response = await request(app)
        .get('/blogs' + '/' + createdBlog.id)
        .expect(HttpStatus.OK);
      expect(response.body).toEqual({
        id: expect.any(String),
        ...correctBlog,
        isMembership: false,
        createdAt: expect.any(String)
      });
    });
  });
  describe('4 PUT /blogs:', () => {
    it(`4.1 PUT /blogs/id: shouldn't update blog without authorization`, async () => {
      await request(app)
        .put('/blogs' + '/' + createdBlog.id)
        .send(correctNewBlog)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it(`4.2 PUT /blogs/id: shouldn't update blog with incorrect data`, async () => {
      const errMes = await request(app)
        .put('/blogs' + '/' + createdBlog.id)
        .auth('admin', 'qwerty')
        .send(incorrectBlog)
        .expect(HttpStatus.BAD_REQUEST);
      expect(errMes.body).toEqual(errorsMessageForIncorrectBlog);
    });
    it(`4.3 PUT /blogs/id: should update blog with correct data`, async () => {
      await request(app)
        .put('/blogs' + '/' + createdBlog.id)
        .auth('admin', 'qwerty')
        .send(correctNewBlog)
        .expect(HttpStatus.NO_CONTENT);
      const response = await request(app)
        .get('/blogs' + '/' + createdBlog.id)
        .expect(HttpStatus.OK);
      expect(response.body).toEqual({
        id: expect.any(String),
        ...correctNewBlog,
        isMembership: false,
        createdAt: expect.any(String)
      });
    });
    it('4.4 PUT /blogs/bad-id: should return 404 for not existing blog', async () => {
      await request(app)
        .put('/blogs/999')
        .auth('admin', 'qwerty')
        .send(correctNewBlog)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
  describe('5 DELETE /blogs:', () => {
    it(`5.1 DELETE /blogs/id: shouldn't delete blog without authorization`, async () => {
      await request(app)
        .delete('/blogs' + '/' + createdBlog.id)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it(`5.2 DELETE /blogs/bad-id: should return 404 for not existing blog`, async () => {
      await request(app)
        .delete('/blogs/999')
        .auth('admin', 'qwerty')
        .expect(HttpStatus.NOT_FOUND);
    });
    it(`5.3 DELETE /blogs/id: should delete blog`, async () => {
      await request(app)
        .delete('/blogs' + '/' + createdBlog.id)
        .auth('admin', 'qwerty')
        .expect(HttpStatus.NO_CONTENT);
      await request(app).get('/blogs').expect(HttpStatus.OK).expect(emptyBlogs);
    });
  });
  describe('6 POST /blogs/id/posts:', () => {
    it(`6.1 POST /blogs/id/posts: shouldn't create post by blog's id without authorization`, async () => {
      const createdResponse = await request(app)
        .post('/blogs')
        .auth('admin', 'qwerty')
        .send(correctBlog)
        .expect(HttpStatus.CREATED);
      createdBlog2 = createdResponse.body;
      await request(app)
        .post('/blogs' + '/' + createdBlog2.id + '/posts')
        .send(correctPostById)
        .expect(HttpStatus.UNAUTHORIZED);
      await request(app).get('/posts').expect(HttpStatus.OK).expect(emptyPosts);
    });
    it(`6.2 POST /blogs/id/posts: shouldn't create post by blog's id with incorrect data`, async () => {
      const errMes = await request(app)
        .post('/blogs' + '/' + createdBlog2.id + '/posts')
        .auth('admin', 'qwerty')
        .send(incorrectPostById)
        .expect(HttpStatus.BAD_REQUEST);
      expect(errMes.body).toEqual(errorsMessageForIncorrectPost);
    });
    it(`6.3 POST /blogs/id/posts: should create posts by blog's id with correct data`, async () => {
      const response = await request(app)
        .post('/blogs' + '/' + createdBlog2.id + '/posts')
        .auth('admin', 'qwerty')
        .send(correctPostById)
        .expect(HttpStatus.CREATED);
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
    it(`6.4 POST /blogs/bad-id/posts: should return 404 for not existing post by blog's id`, async () => {
      await request(app)
        .post('/blogs/999/posts')
        .auth('admin', 'qwerty')
        .send(correctPostById)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
  describe('7 GET /blogs/id/posts:', () => {
    it(`7.1 GET /blogs/bad-id/posts: should return 404 for not existing post by blog's id`, async () => {
      await request(app).get('/blogs/999/posts').expect(HttpStatus.NOT_FOUND);
    });
    it(`7.2 GET /blogs/id/posts: should return post by blog's id`, async () => {
      const response = await request(app)
        .get('/blogs' + '/' + createdBlog2.id + '/posts')
        .expect(HttpStatus.OK);
      expect(response.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
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
          }
        ]
      });
    });
  });
});
