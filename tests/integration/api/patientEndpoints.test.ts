import request from 'supertest';

import app from '../../../src/index';

describe('INTEGRATION: Patient API Endpoints', () => {
  describe('POST /api/patients/prioritized', () => {
    it('should return prioritized patients for valid facility location', async () => {
      const response = await request(app)
        .post('/api/patients/prioritized')
        .send({
          facility: {
            location: {
              latitude: 40.7128,
              longitude: -74.0060
            }
          }
        })
        .expect(200);

      expect(response.body).toHaveProperty('patients');
      expect(Array.isArray(response.body.patients)).toBe(true);
      expect(response.body.patients.length).toBeLessThanOrEqual(10);

      if (response.body.patients.length > 0) {
        const firstPatient = response.body.patients[0];
        expect(firstPatient).toHaveProperty('id');
        expect(firstPatient).toHaveProperty('name');
        expect(firstPatient).toHaveProperty('score');
        expect(firstPatient).toHaveProperty('distance');
        expect(firstPatient).toHaveProperty('demographicScore');
        expect(firstPatient).toHaveProperty('behavioralScore');

        // Verify patients are sorted by score (descending)
        for (let i = 1; i < response.body.patients.length; i++) {
          expect(response.body.patients[i - 1].score).toBeGreaterThanOrEqual(
            response.body.patients[i].score
          );
        }
      }
    });

    it('should return 400 for empty request body', async () => {
      const response = await request(app)
        .post('/api/patients/prioritized')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toContain('Validation failed');
      expect(response.body.error.message).toContain('facility');
    });

    it('should return 400 for missing facility object', async () => {
      const response = await request(app)
        .post('/api/patients/prioritized')
        .send({ notFacility: {} })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toContain('Validation failed');
      expect(response.body.error.message).toContain('facility');
    });

    it('should return 400 for missing facility location', async () => {
      const response = await request(app)
        .post('/api/patients/prioritized')
        .send({ facility: {} })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toContain('Validation failed');
      expect(response.body.error.message).toContain('facility.location');
    });

    it('should return 400 for missing latitude', async () => {
      const response = await request(app)
        .post('/api/patients/prioritized')
        .send({
          facility: {
            location: {
              longitude: -74.0060
            }
          }
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toContain('Validation failed');
      expect(response.body.error.message).toContain('facility.location.latitude');
    });

    it('should return 400 for missing longitude', async () => {
      const response = await request(app)
        .post('/api/patients/prioritized')
        .send({
          facility: {
            location: {
              latitude: 40.7128
            }
          }
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toContain('Validation failed');
      expect(response.body.error.message).toContain('facility.location.longitude');
    });

    it('should return 400 for invalid latitude', async () => {
      const response = await request(app)
        .post('/api/patients/prioritized')
        .send({
          facility: {
            location: {
              latitude: 91,
              longitude: -74.0060
            }
          }
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toContain('Latitude must be between -90 and 90');
    });

    it('should return 400 for invalid longitude', async () => {
      const response = await request(app)
        .post('/api/patients/prioritized')
        .send({
          facility: {
            location: {
              latitude: 40.7128,
              longitude: -181
            }
          }
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toContain('Longitude must be between -180 and 180');
    });

    it('should return 400 for non-numeric coordinates', async () => {
      const response = await request(app)
        .post('/api/patients/prioritized')
        .send({
          facility: {
            location: {
              latitude: "40.7128",
              longitude: "-74.0060"
            }
          }
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toContain('Validation failed');
      expect(response.body.error.message).toContain('expected number');
    });
  });

  describe('GET /health', () => {
    it('should return health check status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});
