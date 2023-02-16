import { HttpStatus, INestApplication } from '@nestjs/common';
import { setConfigNestApp } from '../../configuration.test';
import request from 'supertest';
import {
  correctUser,
  correctUser1,
  emptyUsers,
  emptyUsersWithQuery,
  incorrectUser,
  someQuery
} from '../../stubs/users.stub';
import {
  errorsMessageForBadBan,
  errorsMessageForIncorrectUser
} from '../../stubs/error.stub';
import { badBanInfo, banInfo } from '../../stubs/superadmin.stub';

describe('SuperAdminUsersController (e2e)', () => {
  let configuredNesApp: INestApplication;
  let app: any;
  let createdUser: any;
  let createdUser2: any;

  beforeAll(async () => {
    configuredNesApp = await setConfigNestApp();
    await configuredNesApp.init();
    app = configuredNesApp.getHttpServer();

    await request(app).delete('/testing/all-data');
  });

  afterAll(async () => {
    await configuredNesApp.close();
  });

  describe('1 GET /sa/users:', () => {
    it('1.1 GET /sa/users: should return 200 and empty array', async () => {
      await request(app)
        .get('/sa/users')
        .auth('admin', 'qwerty')
        .expect(HttpStatus.OK)
        .expect(emptyUsers);
    });
    it(`1.2 GET /sa/users: shouldn't get users without authorization`, async () => {
      await request(app).get('/sa/users').expect(HttpStatus.UNAUTHORIZED);
    });
    it('1.3 GET /sa/users: should return 200 and empty array', async () => {
      await request(app)
        .get('/sa/users')
        .query(someQuery)
        .auth('admin', 'qwerty')
        .expect(HttpStatus.OK)
        .expect(emptyUsersWithQuery);
    });
  });
  describe('2 POST /sa/users:', () => {
    it(`2.1 POST /sa/users: shouldn't create user without authorization`, async () => {
      await request(app)
        .post('/sa/users')
        .send(correctUser)
        .expect(HttpStatus.UNAUTHORIZED);
      await request(app)
        .get('/sa/users')
        .auth('admin', 'qwerty')
        .expect(HttpStatus.OK)
        .expect(emptyUsers);
    });
    it(`2.2 POST /sa/users: shouldn't create user with incorrect data`, async () => {
      const errMes = await request(app)
        .post('/sa/users')
        .auth('admin', 'qwerty')
        .send(incorrectUser)
        .expect(HttpStatus.BAD_REQUEST);
      await request(app)
        .get('/sa/users')
        .auth('admin', 'qwerty')
        .expect(HttpStatus.OK)
        .expect(emptyUsers);
      expect(errMes.body).toEqual(errorsMessageForIncorrectUser);
    });
    it(`2.3 POST /sa/users: should create user with correct data`, async () => {
      const createdResponse = await request(app)
        .post('/sa/users')
        .auth('admin', 'qwerty')
        .send(correctUser)
        .expect(HttpStatus.CREATED);
      createdUser = createdResponse.body;
      expect(createdUser).toEqual({
        id: expect.any(String),
        login: 'login',
        email: 'email@gmail.com',
        createdAt: expect.any(String),
        banInfo: {
          isBanned: false,
          banDate: null,
          banReason: null
        }
      });
    });
  });
  describe('3 DELETE /sa/users/id:', () => {
    it(`3.1 DELETE /sa/users/id: shouldn't delete user without authorization`, async () => {
      await request(app)
        .delete('/sa/users' + '/' + createdUser.id)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it(`3.2 DELETE /sa/users/bad-id: should return 404 for not existing user`, async () => {
      await request(app)
        .delete('/sa/users/999')
        .auth('admin', 'qwerty')
        .expect(HttpStatus.NOT_FOUND);
    });
    it(`3.3 DELETE /sa/users/id: should delete user`, async () => {
      await request(app)
        .delete('/sa/users' + '/' + createdUser.id)
        .auth('admin', 'qwerty')
        .expect(HttpStatus.NO_CONTENT);
      await request(app)
        .get('/sa/users')
        .auth('admin', 'qwerty')
        .expect(HttpStatus.OK)
        .expect(emptyUsers);
    });
  });
  describe('4 PUT /sa/users/id/ban:', () => {
    it(`4.1 PUT /sa/users/id/ban: should return 401 without authorization`, async () => {
      const createdResponse = await request(app)
        .post('/sa/users')
        .auth('admin', 'qwerty')
        .send(correctUser1)
        .expect(HttpStatus.CREATED);
      createdUser2 = createdResponse.body;
      await request(app)
        .put('/sa/users/' + createdUser2.id + '/ban')
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it(`4.2 PUT /sa/users/id/ban: should return 400 with incorrect data`, async () => {
      const response = await request(app)
        .put('/sa/users/' + createdUser2.id + '/ban')
        .auth('admin', 'qwerty')
        .send(badBanInfo)
        .expect(HttpStatus.BAD_REQUEST);
      const errMes = response.body;
      expect(errMes).toEqual(errorsMessageForBadBan);
    });
    it(`4.3 PUT /sa/users/id/ban: should return 204 with correct data`, async () => {
      await request(app)
        .put('/sa/users/' + createdUser2.id + '/ban')
        .auth('admin', 'qwerty')
        .send(banInfo)
        .expect(HttpStatus.NO_CONTENT);
      const response = await request(app)
        .get('/sa/users')
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
            login: 'login1',
            email: 'email@gmail.com',
            createdAt: expect.any(String),
            banInfo: {
              isBanned: true,
              banDate: expect.any(String),
              banReason: banInfo.banReason
            }
          }
        ]
      });
    });
  });
});
