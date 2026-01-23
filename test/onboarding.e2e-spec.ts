import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';

describe('Onboarding flow (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userId: string;

  beforeAll(async () => {
    const mockJwtGuard = {
      canActivate: (context) => {
        const req = context.switchToHttp().getRequest();
        const id = req.headers['x-user-id'] as string;
        if (!id) return false;
        req.user = { id, isOnboardingCompleted: false };
        return true;
      },
    };

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtGuard)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

    await app.init();

    prisma = app.get(PrismaService);

    // create a test user
    const user = await prisma.user.create({ data: { email: `test+onb@example.com`, name: 'E2E Test', password: '' } });
    userId = user.id;
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.user.deleteMany({ where: { email: { contains: 'test+' } } });
    }
    await app.close();
  });

  it('should complete onboarding flow for parental user - PRE_LICENSE', async () => {
    // helper to add authorization header simulating JWT guard
    const authHeader = { 'x-user-id': userId };

    // Start: Step 1 - user data
    const step1 = await request(app.getHttpServer())
      .post('/onboarding/start')
      .set(authHeader)
      .send({
        birthday: '1990-01-01',
        city: 'Ciudad',
        country: 'Pais',
        genre: 'M',
        phone: '123456789',
        userType: 'parental',
      })
      .expect(201);

    expect(step1.body.message).toBeDefined();

    // Step 2 parental data
    const step2 = await request(app.getHttpServer())
      .post('/onboarding/parental')
      .set(authHeader)
      .send({
        currentEmploymentStatus: 'Employed',
        currentRole: 'Developer',
        familyType: 'MADRE',
        numberOfChildren: '1',
        organizationType: 'Company',
        parentalStage: 'preLicencia',
        userDescription: 'madre',
      })
      .expect(201);

    expect(step2.body.data.currentEmploymentStatus).toBe('Employed');

    // Step 2 stage-specific details (PRE_LICENSE) - valid and finalize
    const step2details = await request(app.getHttpServer())
      .put('/onboarding/stage-details')
      .set(authHeader)
      .send({
        trimester: 'TRIMESTER_1',
        estimatedDueDate: '2026-06-01',
        preLicenseSupportNeeds: ['Emotional support'],
      })
      .expect(200);

    expect(step2details.body.message).toMatch(/Detalles de la etapa actualizados/i);
    expect(step2details.body.data.is_onboarding_completed).toBe(true);

    // Negative case: try to send LICENSE data while on PRE_LICENSE -> expect 400
    await request(app.getHttpServer())
      .put('/onboarding/stage-details')
      .set(authHeader)
      .send({ babyBirthDate: '2026-06-01', licenseDuration: 'THREE_TO_6_MONTHS' })
      .expect(400);

    // Status should be completed
    const status = await request(app.getHttpServer()).get('/onboarding/status').set(authHeader).expect(200);
    expect(status.body.isOnboardingCompleted).toBe(true);
  }, 20000);

  it('should complete onboarding flow for parental user - POST_LICENSE', async () => {
    // Create a new user for POST_LICENSE flow with unique email
    const timestamp = Date.now();
    const user = await prisma.user.create({ data: { email: `test+post-lic-${timestamp}@example.com`, name: 'Post License Test', password: '' } });
    const authHeader = { 'x-user-id': user.id };

    // Step 1: user data
    await request(app.getHttpServer())
      .post('/onboarding/start')
      .set(authHeader)
      .send({
        birthday: '1988-05-15',
        city: 'Madrid',
        country: 'España',
        genre: 'F',
        phone: '987654321',
        userType: 'parental',
      })
      .expect(201);

    // Step 2: parental data - POST_LICENSE stage
    await request(app.getHttpServer())
      .post('/onboarding/parental')
      .set(authHeader)
      .send({
        currentEmploymentStatus: 'Employed',
        currentRole: 'Product Manager',
        familyType: 'PADRE',
        numberOfChildren: '2',
        organizationType: 'Startup',
        parentalStage: 'postLicencia',
        userDescription: 'padre activo',
      })
      .expect(201);

    // Step 3: POST_LICENSE stage-specific details
    const step3 = await request(app.getHttpServer())
      .put('/onboarding/stage-details')
      .set(authHeader)
      .send({
        returnDate: '2026-02-01',
        workModality: 'FULL_TIME_HYBRID',
        postLicenseSupportNeeds: ['Flexible schedule', 'Mental health support', 'Work-life balance'],
      })
      .expect(200);

    expect(step3.body.message).toMatch(/Detalles de la etapa actualizados/i);
    expect(step3.body.data.is_onboarding_completed).toBe(true);
    expect(step3.body.data.returnDate).toBeDefined();
    expect(step3.body.data.workModality).toBe('FULL_TIME_HYBRID');

    // Cleanup
    await prisma.user.delete({ where: { id: user.id } });
  }, 20000);
});