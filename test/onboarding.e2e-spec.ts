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
      
      canActivate: async (context) => {
        const req = context.switchToHttp().getRequest();
        const id = req.headers['x-user-id'] as string;
        if (!id) return false;
        let completed = false;
        if (prisma) {
          const u = await prisma.user.findUnique({ where: { id } });
          completed = !!u?.isOnboardingCompleted;
        }
        req.user = { id, isOnboardingCompleted: completed };
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

    await request(app.getHttpServer())
      .put('/onboarding/stage-details')
      .set(authHeader)
      .send({ babyBirthDate: '2026-06-01', licenseDuration: 'THREE_TO_6_MONTHS' })
      .expect(403);

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

  it('should complete onboarding flow for organization user in a single final submission', async () => {
    // create organization user
    const orgUser = await prisma.user.create({ data: { email: `test+org-${Date.now()}@example.com`, name: 'Org Test', password: '' } });
    const authHeader = { 'x-user-id': orgUser.id };

    // Step 1: start with organization type (general user data)
    await request(app.getHttpServer())
      .post('/onboarding/start')
      .set(authHeader)
      .send({
        birthday: '1980-07-07',
        city: 'Ciudad',
        country: 'Pais',
        genre: 'M',
        phone: '5551234',
        userType: 'organization',
      })
      .expect(201);

    
    const allAnswers = {
      organizationName: 'Test Org',
      organizationSize: 'startup',
      organizationIndustry: 'Tech',
      organizationRole: 'HR',
      genderDistribution: 'EQUILIBRADA',
      percentageMothers: 'BETWEEN_21_AND_40',
      percentageFathers: 'LESS_THAN_20',
      maternityLeaveDays: 'legal',
      paternityLeaveDays: 'BETWEEN_1_AND_7_DAYS',
      flexibilityScore: 4,
      workLifeBalanceScore: 3,
      emotionalSupportScore: 5,
      currentInitiatives: ['parentalLeave'],
      desiredInitiatives: ['workshops'],
      organizationalMaturity: 'policiesAndProcesses',
      organizationalChallenges: ['talentTurnover', 'productivity'],
    };

    const resp = await request(app.getHttpServer())
      .put('/onboarding/organization/complete')
      .set(authHeader)
      .send(allAnswers)
      .expect(200);

    expect(resp.body.data.organizationName).toBe(allAnswers.organizationName);
    expect(resp.body.data.organizationSize).toBe('SMALL');
    expect(resp.body.data.organizationalChallenges).toEqual(allAnswers.organizationalChallenges);
    expect(resp.body.data.is_onboarding_completed).toBe(true);

    const progress = await request(app.getHttpServer())
      .get('/onboarding/organization/progress')
      .set(authHeader)
      .expect(200);

    expect(progress.body.completedSteps).toBe(16);
    expect(progress.body.isCompleted).toBe(true);

    // cleanup
    await prisma.user.delete({ where: { id: orgUser.id } });
  }, 30000);

  it('should complete professional profile using linkedinOrCV field', async () => {
    const user = await prisma.user.create({ data: { email: `test+prof-${Date.now()}@example.com`, name: 'Prof Test', password: '' } });
    const authHeader = { 'x-user-id': user.id };

    // step 1: start with professional type
    await request(app.getHttpServer())
      .post('/onboarding/start')
      .set(authHeader)
      .send({
        birthday: '1992-03-10',
        city: 'Barcelona',
        country: 'España',
        genre: 'F',
        phone: '444333222',
        userType: 'professional',
      })
      .expect(201);

    // step complete professional profile with single field
    const profileData = {
      linkedinOrCV: 'https://linkedin.com/in/prof-test',
      areasOfSpecialization: ['PSYCHOLOGY'],
      estimatedPricePerSession: 120,
      motivation: 'Helping families',
      yearsOfExperience: 4,
    };

    const completeResp = await request(app.getHttpServer())
      .post('/onboarding/professional/complete')
      .set(authHeader)
      .send(profileData)
      .expect(201);

    expect(completeResp.body.data.linkedinUrl).toBe(profileData.linkedinOrCV);
    expect(completeResp.body.data.cvUrl).toBe(profileData.linkedinOrCV);
    expect(completeResp.body.data.is_onboarding_completed).toBe(true);

    // get professional profile back
    const getResp = await request(app.getHttpServer())
      .get('/onboarding/professional')
      .set(authHeader)
      .expect(200);

    expect(getResp.body.linkedinOrCV).toBe(profileData.linkedinOrCV);
    expect(getResp.body.areasOfSpecialization).toEqual(profileData.areasOfSpecialization);

    // update profile with new value
    const newUrl = 'https://example.com/cv-prof.pdf';
    const patchResp = await request(app.getHttpServer())
      .patch('/onboarding/professional')
      .set(authHeader)
      .send({ linkedinOrCV: newUrl })
      .expect(200);

    expect(patchResp.body.data.linkedinUrl).toBe(newUrl);
    expect(patchResp.body.data.cvUrl).toBe(newUrl);

    // cleanup
    await prisma.user.delete({ where: { id: user.id } });
  }, 20000);
});