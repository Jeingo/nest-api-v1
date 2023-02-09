import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { useContainer } from 'class-validator';
import { HttpExceptionFilter } from '../src/helper/expceptionFilter/exception.filter';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { correctBlog } from './stubs/blogs.stub';
import { correctNewPost, correctPost, emptyPosts } from './stubs/posts.stub';
import { correctLogin, correctUser1 } from './stubs/users.stub';

describe('PostsController (e2e)', () => {
  let nestApp: INestApplication;
  let app: any;
  let createdBlog: any;
  let createdUser: any;
  let createdToken: any;

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
    const response1 = await request(app)
      .post('/blogs')
      .auth('admin', 'qwerty')
      .send(correctBlog)
      .expect(HttpStatus.CREATED);
    createdBlog = response1.body;
    correctPost.blogId = createdBlog.id;
    correctNewPost.blogId = createdBlog.id;
    const response2 = await request(app)
      .post('/users')
      .auth('admin', 'qwerty')
      .send(correctUser1)
      .expect(HttpStatus.CREATED);
    createdUser = response2.body;
    const response3 = await request(app)
      .post('/auth/login')
      .send(correctLogin)
      .expect(HttpStatus.OK);
    createdToken = response3.body;
  });

  afterAll(async () => {
    await nestApp.close();
  });

  describe('1 GET /posts:', () => {
    it('1.1 GET /posts: should return 200 and empty array', async () => {
      await request(app).get('/posts').expect(HttpStatus.OK).expect(emptyPosts);
    });
    it('1.2 GET /posts/bad-id: should return 404 for not existing posts', async () => {
      await request(app).get('/posts/999').expect(HttpStatus.NOT_FOUND);
    });
  });
});
