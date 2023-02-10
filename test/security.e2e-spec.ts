import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  correctLogin,
  correctLogin2,
  correctUser,
  correctUser2
} from './stubs/users.stub';
import { setConfigNestApp } from './configuration.test';

describe('SecurityDeviceController (e2e)', () => {
  let configuredNesApp: INestApplication;
  let app: any;
  let createdToken: any;
  let createdRefreshToken: any;
  let createdSession: any;
  let createdRefreshToken2: any;

  beforeAll(async () => {
    configuredNesApp = await setConfigNestApp();
    await configuredNesApp.init();
    app = configuredNesApp.getHttpServer();

    await request(app).delete('/testing/all-data');
    await request(app)
      .post('/users')
      .auth('admin', 'qwerty')
      .send(correctUser)
      .expect(HttpStatus.CREATED);
    const createdResponseLogin = await request(app)
      .post('/auth/login')
      .send(correctLogin)
      .expect(HttpStatus.OK);
    createdToken = createdResponseLogin.body;
    createdRefreshToken =
      createdResponseLogin.headers['set-cookie'][0].split(';')[0];
    expect(createdToken).toEqual({
      accessToken: expect.any(String)
    });
  });

  afterAll(async () => {
    await configuredNesApp.close();
  });

  describe('1 GET /security/devices:', () => {
    it('1.1 GET /security/devices: should return 401 with incorrect cookie', async () => {
      await request(app)
        .get('/security/devices')
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('1.2 GET /security/devices: should return 200 with correct data', async () => {
      const response = await request(app)
        .get('/security/devices')
        .set('Cookie', createdRefreshToken)
        .expect(HttpStatus.OK);
      createdSession = response.body;
      expect(createdSession).toEqual([
        {
          ip: expect.any(String),
          title: 'some device',
          lastActiveDate: expect.any(String),
          deviceId: expect.any(String)
        }
      ]);
    });
  });
  describe('2 DELETE /security/devices:', () => {
    it('2.1 DELETE /security/devices: should return 401 with incorrect cookie', async () => {
      await request(app)
        .delete('/security/devices')
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('2.2 DELETE /security/devices: should return 204 with correct data', async () => {
      await request(app)
        .delete('/security/devices')
        .set('Cookie', createdRefreshToken)
        .expect(HttpStatus.NO_CONTENT);
    });
  });
  describe('3 DELETE /security/devices:id:', () => {
    it('3.1 DELETE /security/devices/:id: should return 401 with incorrect cookie', async () => {
      await request(app)
        .delete('/security/devices' + '/' + createdSession[0].deviceId)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('3.2 DELETE /security/devices/:bad-id: should return 404 with incorrect deviceId', async () => {
      await request(app)
        .delete('/security/devices' + '/' + createdSession[0].deviceId + '!')
        .set('Cookie', createdRefreshToken)
        .expect(HttpStatus.NOT_FOUND);
    });
    it('3.3 DELETE /security/devices/id: should return 403 with other user', async () => {
      await request(app)
        .post('/users')
        .auth('admin', 'qwerty')
        .send(correctUser2)
        .expect(HttpStatus.CREATED);
      const createdResponseLogin = await request(app)
        .post('/auth/login')
        .send(correctLogin2)
        .expect(HttpStatus.OK);
      createdRefreshToken2 =
        createdResponseLogin.headers['set-cookie'][0].split(';')[0];
      const createdResponse2 = await request(app)
        .get('/security/devices')
        .set('Cookie', createdRefreshToken)
        .expect(HttpStatus.OK);
      createdSession = createdResponse2.body;
      await request(app)
        .delete('/security/devices' + '/' + createdSession[0].deviceId)
        .set('Cookie', createdRefreshToken2)
        .expect(HttpStatus.FORBIDDEN);
    });
    it('3.4 DELETE /security/devices/:id: should return 204 ', async () => {
      await request(app)
        .delete('/security/devices' + '/' + createdSession[0].deviceId)
        .set('Cookie', createdRefreshToken)
        .expect(HttpStatus.NO_CONTENT);
    });
  });
});
