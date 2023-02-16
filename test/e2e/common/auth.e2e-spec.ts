import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  correctBadLogin,
  correctLogin,
  correctUser,
  correctUser2,
  incorrectLogin
} from '../../stubs/users.stub';
import {
  errorsMessageForConfirmation,
  errorsMessageForEmailResending,
  errorsMessageForIncorrectLogin,
  errorsMessageForNewPassword,
  errorsMessageForPasswordRecovery,
  errorsMessageForRegistration
} from '../../stubs/error.stub';
import {
  badEmailForResending,
  incorrectCodeConfirmation,
  incorrectEmailForResending
} from '../../stubs/auth.stub';
import { setConfigNestApp } from '../../configuration.test';

describe('AuthController (e2e)', () => {
  let configuredNesApp: INestApplication;
  let app: any;
  let createdUser: any;
  let createdToken: any;
  let createdRefreshToken: any;
  let createdRefreshToken2: any;
  let gotRegistrationUser: any;

  beforeAll(async () => {
    configuredNesApp = await setConfigNestApp();
    await configuredNesApp.init();
    app = configuredNesApp.getHttpServer();

    await request(app).delete('/testing/all-data');
    const response = await request(app)
      .post('/sa/users')
      .auth('admin', 'qwerty')
      .send(correctUser)
      .expect(HttpStatus.CREATED);
    createdUser = response.body;
  });

  afterAll(async () => {
    await configuredNesApp.close();
  });

  describe('1 POST /auth/login:', () => {
    it('1.1 POST /auth/login: should return 400 with incorrect data', async () => {
      const errMes = await request(app)
        .post('/auth/login')
        .send(incorrectLogin)
        .expect(HttpStatus.BAD_REQUEST);
      expect(errMes.body).toEqual(errorsMessageForIncorrectLogin);
    });
    it('1.2 POST /auth/login: should return 401 if the password or login is wrong', async () => {
      await request(app)
        .post('/auth/login')
        .send(correctBadLogin)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('1.3 POST /auth/login: should return 200 if the password or login is correct', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send(correctLogin)
        .expect(HttpStatus.OK);
      createdToken = response.body;
      createdRefreshToken = response.headers['set-cookie'][0].split(';')[0];
      expect(createdToken).toEqual({
        accessToken: expect.any(String)
      });
    });
  });
  describe('2 GET /auth/me:', () => {
    it('2.1 GET /auth/me: should return 401 if token is wrong', async () => {
      await request(app).get('/auth/me').expect(HttpStatus.UNAUTHORIZED);
    });
    it('2.2 GET /auth/me: should return 200', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer ' + createdToken.accessToken)
        .expect(HttpStatus.OK);
      gotRegistrationUser = response.body;
      expect(gotRegistrationUser).toEqual({
        email: createdUser.email,
        login: createdUser.login,
        userId: createdUser.id
      });
    });
  });
  describe('3 POST /auth/registration:', () => {
    it('3.1 POST /auth/registration: should return 400 with invalid data', async () => {
      const response = await request(app)
        .post('/auth/registration')
        .send(correctUser)
        .expect(HttpStatus.BAD_REQUEST);
      expect(response.body).toEqual(errorsMessageForRegistration);
    });
    it('3.2 POST /auth/registration: should return 204 with correct data', async () => {
      await request(app)
        .post('/auth/registration')
        .send(correctUser2)
        .expect(HttpStatus.NO_CONTENT);
    });
  });
  describe('4 POST /auth/registration-confirmation:', () => {
    it('4.1 POST /auth/registration-confirmation: should return 400 with invalid data', async () => {
      const response = await request(app)
        .post('/auth/registration-confirmation')
        .send(incorrectCodeConfirmation)
        .expect(HttpStatus.BAD_REQUEST);
      expect(response.body).toEqual(errorsMessageForConfirmation);
    });
    it('4.2 POST /auth/registration-confirmation: should return 204 with correct code (Try it yourself)', async () => {
      expect(1).toBe(1);
    });
  });
  describe('5 POST /auth/registration-email-resending:', () => {
    it('5.1 POST /auth/registration-email-resending: should return 400 with invalid data', async () => {
      const createdResponse = await request(app)
        .post('/auth/registration-email-resending')
        .send(incorrectEmailForResending)
        .expect(HttpStatus.BAD_REQUEST);
      expect(createdResponse.body).toEqual(errorsMessageForEmailResending);
    });
  });
  describe('6 POST /auth/refresh-token:', () => {
    it('6.1 POST /auth/refresh-token: should return 401 if refresh-token is wrong', async () => {
      await request(app)
        .post('/auth/refresh-token')
        .set('Cookie', createdRefreshToken + '!')
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('6.2 POST /auth/refresh-token: should return 200 with correct refresh token', async () => {
      const response = await request(app)
        .post('/auth/refresh-token')
        .set('Cookie', createdRefreshToken)
        .expect(HttpStatus.OK);
      const token = response.body;
      createdRefreshToken2 = response.headers['set-cookie'][0].split(';')[0];
      expect(token).toEqual({ accessToken: expect.any(String) });
    });
  });
  describe('7 POST /auth/logout:', () => {
    it('7.1 POST /auth/logout: should return 401 if refresh-token is wrong', async () => {
      await request(app)
        .post('/auth/logout')
        .set('Cookie', createdRefreshToken + '!')
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('7.2 POST /auth/logout: should return 200 with correct refresh token', async () => {
      await request(app)
        .post('/auth/logout')
        .set('Cookie', createdRefreshToken2)
        .expect(HttpStatus.NO_CONTENT);
    });
  });
  describe.skip('8 POST /auth/login: (429)', () => {
    it('8.1 POST /auth/login: should return 429 after 5 request in 10 seconds ', async () => {
      for (let i = 0; i < 5; i++) {
        await request(app).post('/auth/login').send(correctLogin);
      }
      await request(app)
        .post('/auth/login')
        .send(correctLogin)
        .expect(HttpStatus.TOO_MANY_REQUESTS);
    });
  });
  describe('9 POST /auth/password-recovery:', () => {
    it('9.1 POST /auth/password-recovery: should return 400 with incorrect email', async () => {
      const errMes = await request(app)
        .post('/auth/password-recovery')
        .send(badEmailForResending)
        .expect(HttpStatus.BAD_REQUEST);
      expect(errMes.body).toEqual(errorsMessageForPasswordRecovery);
    });
    it('9.2 POST /auth/password-recovery: should return 204 with correct code (Try it yourself)', async () => {
      expect(1).toBe(1);
    });
  });
  describe('10 POST /auth/new-password:', () => {
    it('10.1 POST /auth/new-password: should return 400 with incorrect value', async () => {
      const errMes = await request(app)
        .post('/auth/new-password')
        .send({ newPassword: '123', recoveryCode: '' })
        .expect(HttpStatus.BAD_REQUEST);
      expect(errMes.body).toEqual(errorsMessageForNewPassword);
    });
  });
});
