import { InputCreateUserDto } from '../../../src/superadmin/users/api/dto/input.create.user.dto';
import { StringID } from '../types/test.type';
import request from 'supertest';
import { superAdminLogin, superAdminPassword } from '../auth/basic.auth';
import { superAdminUsersPath } from '../paths-to-endpoints/paths';

export const createUsers = (count: number): InputCreateUserDto[] => {
  const users: InputCreateUserDto[] = [];
  for (let i = 0; i < count; i++) {
    const user: InputCreateUserDto = {
      login: `login${i}`,
      email: `email${i}@gmail.com`,
      password: `password${i}`
    };
    users.push(user);
  }
  return users;
};

export const createUser = (): InputCreateUserDto => {
  return {
    login: `login`,
    email: `email@gmail.com`,
    password: `password`
  };
};

export const saveUser = async (
  app: any,
  user: InputCreateUserDto
): Promise<StringID> => {
  const response = await request(app)
    .post(superAdminUsersPath)
    .auth(superAdminLogin, superAdminPassword)
    .send(user);
  return response.body.id;
};

export const saveUsers = async (
  app: any,
  users: InputCreateUserDto[]
): Promise<StringID[]> => {
  const ids: StringID[] = [];
  for (let i = 0; i < users.length; i++) {
    const response = await request(app)
      .post(superAdminUsersPath)
      .auth(superAdminLogin, superAdminPassword)
      .send(users[i]);
    ids.push(response.body.id);
  }
  return ids;
};
