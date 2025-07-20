import { registry } from '../OpenAPIConfig';

registry.registerPath({
  method: 'post',
  path: '/api/patients/prioritized',
  tags: ['Patients'],
  summary: 'Get prioritized patient list',
  description: 'Returns a list of up to 10 patients prioritized by their likelihood to accept appointments',
  request: {
    body: {
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/GetPrioritizedPatientsRequest',
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Successful response with prioritized patients',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/GetPrioritizedPatientsResponse',
          },
        },
      },
    },
    400: {
      description: 'Bad request - Invalid input',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/ErrorResponse',
          },
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/ErrorResponse',
          },
        },
      },
    },
  },
});
