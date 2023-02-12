import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  correctUser,
  emptyUsers,
  emptyUsersWithQuery,
  incorrectUser,
  someQuery
} from '../stubs/users.stub';
import { errorsMessageForIncorrectUser } from '../stubs/error.stub';
import { setConfigNestApp } from '../configuration.test';

describe('UsersController (e2e)', () => {
  let configuredNesApp: INestApplication;
  let app: any;
  let createdUser: any;

  beforeAll(async () => {
    configuredNesApp = await setConfigNestApp();
    await configuredNesApp.init();
    app = configuredNesApp.getHttpServer();

    await request(app).delete('/testing/all-data');
  });

  afterAll(async () => {
    await configuredNesApp.close();
  });

  describe('1 GET /users:', () => {
    it('1.1 GET /users: should return 200 and empty array', async () => {
      await request(app)
        .get('/users')
        .auth('admin', 'qwerty')
        .expect(HttpStatus.OK)
        .expect(emptyUsers);
    });
    it(`1.2 GET /users: shouldn't get users without authorization`, async () => {
      await request(app).get('/users').expect(HttpStatus.UNAUTHORIZED);
    });
    it('1.3 GET /users: should return 200 and empty array', async () => {
      await request(app)
        .get('/users')
        .query(someQuery)
        .auth('admin', 'qwerty')
        .expect(HttpStatus.OK)
        .expect(emptyUsersWithQuery);
    });
  });
  describe('2 POST /users:', () => {
    it(`2.1 POST /users: shouldn't create user without authorization`, async () => {
      await request(app)
        .post('/users')
        .send(correctUser)
        .expect(HttpStatus.UNAUTHORIZED);
      await request(app)
        .get('/users')
        .auth('admin', 'qwerty')
        .expect(HttpStatus.OK)
        .expect(emptyUsers);
    });
    it(`2.2 POST /users: shouldn't create user with incorrect data`, async () => {
      const errMes = await request(app)
        .post('/users')
        .auth('admin', 'qwerty')
        .send(incorrectUser)
        .expect(HttpStatus.BAD_REQUEST);
      await request(app)
        .get('/users')
        .auth('admin', 'qwerty')
        .expect(HttpStatus.OK)
        .expect(emptyUsers);
      expect(errMes.body).toEqual(errorsMessageForIncorrectUser);
    });
    it(`2.3 POST /users: should create user with correct data`, async () => {
      const createdResponse = await request(app)
        .post('/users')
        .auth('admin', 'qwerty')
        .send(correctUser)
        .expect(HttpStatus.CREATED);
      createdUser = createdResponse.body;
      expect(createdUser).toEqual({
        id: expect.any(String),
        login: 'login',
        email: 'email@gmail.com',
        createdAt: expect.any(String)
      });
    });
  });
  describe('3 DELETE /users/id:', () => {
    it(`3.1 DELETE /users/id: shouldn't delete user without authorization`, async () => {
      await request(app)
        .delete('/users' + '/' + createdUser.id)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it(`3.2 DELETE /users/bad-id: should return 404 for not existing user`, async () => {
      await request(app)
        .delete('/users/999')
        .auth('admin', 'qwerty')
        .expect(HttpStatus.NOT_FOUND);
    });
    it(`3.3 DELETE /users/id: should delete user`, async () => {
      await request(app)
        .delete('/users' + '/' + createdUser.id)
        .auth('admin', 'qwerty')
        .expect(HttpStatus.NO_CONTENT);
      await request(app)
        .get('/users')
        .auth('admin', 'qwerty')
        .expect(HttpStatus.OK)
        .expect(emptyUsers);
    });
  });
});
