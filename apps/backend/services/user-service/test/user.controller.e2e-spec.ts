import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestingApp } from './test-utils';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let createdUserId: number;

  beforeAll(async () => {
    app = await createTestingApp();
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  it('/user (POST) - create user with profile data', async () => {
    const createUserPayload = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      phoneNumber: '1234567890',
      profile: {
        gender: 'male',
        dateOfBirth: '1990-01-01',
        activityLevel: 'active',
      },
    };

    const response = await request(app.getHttpServer())
      .post('/user')
      .send(createUserPayload)
      .expect(201);

    createdUserId = response.body.id;
    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toEqual('john@example.com');
  });

  it('/user/profile/:userId (GET) - get user profile', async () => {
    const response = await request(app.getHttpServer())
      .get(`/user/profile/${createdUserId}`)
      .expect(200);

    expect(response.body).toHaveProperty('userId', createdUserId);
    expect(response.body).toHaveProperty('gender', 'male');
  });

  it('/user (GET) - get all users', async () => {
    const response = await request(app.getHttpServer())
      .get('/user')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('/user/:id (PUT) - update user', async () => {
    const updateUserPayload = {
      phoneNumber: '0987654321',
    };

    const response = await request(app.getHttpServer())
      .put(`/user/${createdUserId}`)
      .send(updateUserPayload)
      .expect(200);

    expect(response.body.phoneNumber).toEqual('0987654321');
  });

  it('/user/profile/:userId (PUT) - update user profile', async () => {
    const updateProfilePayload = {
      weightKg: 70,
      heightCm: 180,
    };

    const response = await request(app.getHttpServer())
      .put(`/user/profile/${createdUserId}`)
      .send(updateProfilePayload)
      .expect(200);

    expect(response.body).toHaveProperty('weightKg', 70);
    expect(response.body).toHaveProperty('heightCm', 180);
  });

  it('/user/:id (DELETE) - delete user', async () => {
    await request(app.getHttpServer())
      .delete(`/user/${createdUserId}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/user/${createdUserId}`)
      .expect(404);
  });
});
