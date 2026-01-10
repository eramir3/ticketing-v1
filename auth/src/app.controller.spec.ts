import request from 'supertest';
import { app } from '../test/setup';

describe('AppController  Signup (e2e)', () => {
  it('returns a 201 on successful signup', async () => {
    return request(app.getHttpServer())
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: 'password'
      })
      .expect(400);
  });

  it('returns a 400 with an invalid email', async () => {
    return request(app.getHttpServer())
      .post('/api/users/signup')
      .send({
        email: 'alskdflaskjfd',
        password: 'password'
      })
      .expect(400);
  });

  it('returns a 400 with an invalid password', async () => {
    return request(app.getHttpServer())
      .post('/api/users/signup')
      .send({
        email: 'alskdflaskjfd',
        password: 'p'
      })
      .expect(400);
  });

  it('returns a 400 with missing email and password', async () => {
    await request(app.getHttpServer())
      .post('/api/users/signup')
      .send({
        email: 'test@test.com'
      })
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/users/signup')
      .send({
        password: 'alskjdf'
      })
      .expect(400);
  });

  it('disallows duplicate emails', async () => {
    await request(app.getHttpServer())
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: 'password'
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: 'password'
      })
      .expect(400);
  });

  it('sets a cookie after successful signup', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: 'password'
      })
      .expect(201);

    expect(response.get('Set-Cookie')).toBeDefined();
  });
});

describe('AppController  Signin (e2e)', () => {
  it('fails when a email that does not exist is supplied', async () => {
    await request(app.getHttpServer())
      .post('/api/users/signin')
      .send({
        email: 'test@test.com',
        password: 'password'
      })
      .expect(400);
  });

  it('fails when an incorrect password is supplied', async () => {
    await request(app.getHttpServer())
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: 'password'
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/users/signin')
      .send({
        email: 'test@test.com',
        password: 'aslkdfjalskdfj'
      })
      .expect(400);
  });

  it('responds with a cookie when given valid credentials', async () => {
    await request(app.getHttpServer())
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: 'password'
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/api/users/signin')
      .send({
        email: 'test@test.com',
        password: 'password'
      })
      .expect(200);

    expect(response.get('Set-Cookie')).toBeDefined();
  });
});

describe('AppController  Signout (e2e)', () => {
  it("clears the cookie after signing out", async () => {
    await request(app.getHttpServer())
      .post("/api/users/signup")
      .send({
        email: "test@test.com",
        password: "password",
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post("/api/users/signout")
      .send({})
      .expect(200);

    const cookie = response.get("Set-Cookie");
    if (!cookie) {
      throw new Error("Expected cookie but got undefined.");
    }

    expect(cookie[0]).toEqual(
      "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly"
    );
  });
});

describe('AppController  CurrentUser (e2e)', () => {
  it('responds with details about the current user', async () => {
    const cookie = await global.signin();

    const response = await request(app.getHttpServer())
      .get('/api/users/currentuser')
      .set('Cookie', cookie)
      .send()
      .expect(200);

    expect(response.body.currentUser.email).toEqual('test@test.com');
  });

  it('responds with null if not authenticated', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/users/currentuser')
      .send()
      .expect(200);

    expect(response.body.currentUser).toEqual(null);
  });
});
