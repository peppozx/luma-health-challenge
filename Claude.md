# Patient Waitlist Optimization - Guia de Implementação

## Descrição do Desafio

### Exercise – Patient Waitlist Optimization Algorithm

**Scenario**
A busy hospital manages a waitlist of patients waiting to be scheduled for doctor appointments. Patients are added to this list in FIFO (first-in, first-out) order, based on the time they call the front desk.

Currently, when an appointment slot becomes available, a staff member begins calling patients one by one in the order they were added. However, many patients do not respond, are unavailable, or decline the offer—leading to inefficiencies and wasted time.

To address this, the hospital wants to generate a smarter, prioritized list that increases the likelihood of successfully scheduling a patient within the first few calls.

**Your Task**
Your goal is to design and implement a scoring algorithm that ranks patients based on how likely they are to accept a waitlist offer. Using mocked data (attached a sample.json dataset for you to work with), you must:

1. Compute a score (1 to 10) for each patient, where 1 is least likely and 10 is most likely to accept an appointment.
2. Ensure that patients with limited behavioral data still have a fair chance of being near the top of the list by introducing controlled randomness.
3. Expose an API endpoint that takes a facility's geographic location as input and returns an ordered list of 10 patients, prioritized by their acceptance likelihood.

**Requirements**
- **Scoring Criteria**
  - The scoring algorithm should weigh both demographic and behavioral data using the following breakdown:
    - **Demographic (20%)**
      - Age — 10%
      - Distance to facility (calculated using patient and facility coordinates) — 10%
    - **Behavioral (80%)**
      - Number of accepted offers — 30%
      - Number of cancelled offers — 30%
      - Average reply time (in seconds) — 20%

- **Implementation Requirements**
  - The core scoring logic must be implemented as a Node.js library that can be imported and reused;
  - Provide an API endpoint that:
    - Accepts a facility location (latitude and longitude);
    - Returns a list of the top 10 patients, sorted by their computed score (highest first);
  - Include:
    - Documentation explaining how to run and use the library and endpoint;
    - Unit tests that validate the logic and demonstrate edge case handling;
    - A pull request with your complete implementation.

**Guidance**
Think of the system from the perspective of a staff member trying to reach a patient quickly. Your goal is to help the assistant prioritize patients who are most likely to answer and accept the appointment. Use the provided data to infer behavioral patterns and apply reasonable logic when dealing with incomplete or sparse information.

Patients with little to no history shouldn't be penalized too harshly—introduce a way to randomly rotate them into the top results, so they still have a chance of being contacted.

## Mock Data Example

```json
[
  {
    "id": "541d25c9-9500-4265-8967-240f44ecf723",
    "name": "Samir Pacocha",
    "location": { "latitude": "46.7110", "longitude": "-63.1150" },
    "age": 46,
    "acceptedOffers": 49,
    "canceledOffers": 92,
    "averageReplyTime": 2598
  },
  {
    "id": "41fd45bc-b166-444a-a69e-9d527b4aee48",
    "name": "Bernard Mosciski",
    "location": { "latitude": "-81.0341", "longitude": "144.9963" },
    "age": 21,
    "acceptedOffers": 95,
    "canceledOffers": 96,
    "averageReplyTime": 1908
  },
  // ... mais pacientes
]
```

## Análise e Abordagem

### Pontos-Chave Identificados

1. **Objetivo Principal**: Otimizar o tempo da equipe hospitalar priorizando pacientes com maior probabilidade de aceitar consultas
2. **Balanceamento**: 80% comportamental / 20% demográfico
3. **Justiça**: Pacientes novos/com poucos dados devem ter chance via randomness controlado
4. **Simplicidade**: Como é um desafio de 1 semana para vaga backend, foco em arquitetura limpa e boas práticas

### Habilidades Avaliadas

- **Arquitetura e Design**: Clean Architecture, SOLID, Design Patterns
- **Qualidade de Código**: Legibilidade, TypeScript, Error Handling
- **Testes**: Unitários e Integração
- **Pragmatismo**: Evitar over-engineering
- **DevOps**: Docker, configuração, logs
- **Documentação**: Decisões bem explicadas

## Estrutura do Projeto

```
patient-waitlist/
├── src/
│   ├── domain/                 # Regras de negócio (sem deps externas)
│   │   ├── entities/
│   │   │   ├── Patient.ts      # Entidade paciente
│   │   │   └── Facility.ts     # Entidade facility
│   │   ├── repositories/
│   │   │   └── PatientRepository.ts  # Interface do repositório
│   │   └── services/
│   │       ├── ScoringService.ts      # Lógica de scoring
│   │       └── DistanceCalculator.ts  # Cálculo Haversine
│   ├── application/            # Casos de uso
│   │   ├── use-cases/
│   │   │   └── GetPrioritizedPatients.ts
│   │   └── dto/
│   │       └── PrioritizedPatientDTO.ts
│   ├── infrastructure/         # Implementações e framework
│   │   ├── repositories/
│   │   │   └── InMemoryPatientRepository.ts
│   │   ├── api/
│   │   │   ├── controllers/
│   │   │   │   └── PatientController.ts
│   │   │   ├── middlewares/
│   │   │   │   └── ErrorHandler.ts
│   │   │   └── routes/
│   │   │       └── patientRoutes.ts
│   │   └── config/
│   │       └── AppConfig.ts
│   ├── shared/                 # Código compartilhado
│   │   ├── errors/
│   │   │   └── AppError.ts
│   │   └── utils/
│   │       └── Logger.ts
│   └── index.ts               # Entry point
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── docker/
│   └── Dockerfile
├── .env.example
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── README.md
```

## Implementações

### 1. Entidades do Domínio

```typescript
// src/domain/entities/Patient.ts
export interface Location {
  latitude: number;
  longitude: number;
}

export interface Patient {
  id: string;
  name: string;
  location: Location;
  age: number;
  acceptedOffers: number;
  canceledOffers: number;
  averageReplyTime: number; // em segundos
}

export interface ScoredPatient extends Patient {
  score: number;
  distance?: number; // distância até a facility em km
  demographicScore: number;
  behavioralScore: number;
}

// src/domain/entities/Facility.ts
export interface Facility {
  location: Location;
}

// src/domain/repositories/PatientRepository.ts
import { Patient } from '../entities/Patient';

export interface PatientRepository {
  findAll(): Promise<Patient[]>;
  findById(id: string): Promise<Patient | null>;
}
```

### 2. Serviço de Cálculo de Distância

```typescript
// src/domain/services/DistanceCalculator.ts
import { Location } from '../entities/Patient';

export class DistanceCalculator {
  private static readonly EARTH_RADIUS_KM = 6371;

  /**
   * Calcula a distância entre dois pontos usando a fórmula de Haversine
   * @param point1 Primeira localização
   * @param point2 Segunda localização
   * @returns Distância em quilômetros
   */
  static calculate(point1: Location, point2: Location): number {
    const lat1Rad = this.toRadians(point1.latitude);
    const lat2Rad = this.toRadians(point2.latitude);
    const deltaLat = this.toRadians(point2.latitude - point1.latitude);
    const deltaLon = this.toRadians(point2.longitude - point1.longitude);

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return this.EARTH_RADIUS_KM * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
```

### 3. Serviço de Scoring (Core do Sistema)

```typescript
// src/domain/services/ScoringService.ts
import { Patient, ScoredPatient, Location } from '../entities/Patient';
import { DistanceCalculator } from './DistanceCalculator';

export interface ScoringConfig {
  weights: {
    demographic: {
      age: number;
      distance: number;
    };
    behavioral: {
      acceptedOffers: number;
      canceledOffers: number;
      averageReplyTime: number;
    };
  };
  randomnessConfig: {
    enabled: boolean;
    maxBoost: number; // máximo de boost aleatório (0-1)
    lowDataThreshold: number; // número mínimo de interações para considerar "poucos dados"
  };
}

export class ScoringService {
  private readonly config: ScoringConfig;

  constructor(config?: Partial<ScoringConfig>) {
    this.config = {
      weights: {
        demographic: {
          age: 0.10,
          distance: 0.10,
        },
        behavioral: {
          acceptedOffers: 0.30,
          canceledOffers: 0.30,
          averageReplyTime: 0.20,
        },
      },
      randomnessConfig: {
        enabled: true,
        maxBoost: 0.2, // até 20% de boost aleatório
        lowDataThreshold: 20, // menos de 20 interações totais
      },
      ...config,
    };
  }

  /**
   * Calcula o score de um paciente baseado em dados demográficos e comportamentais
   */
  calculateScore(patient: Patient, facilityLocation: Location): ScoredPatient {
    const distance = DistanceCalculator.calculate(patient.location, facilityLocation);
    
    // Scores individuais (0-10)
    const ageScore = this.calculateAgeScore(patient.age);
    const distanceScore = this.calculateDistanceScore(distance);
    const acceptanceRateScore = this.calculateAcceptanceRateScore(patient);
    const responseTimeScore = this.calculateResponseTimeScore(patient.averageReplyTime);

    // Scores agregados
    const demographicScore = 
      ageScore * this.config.weights.demographic.age +
      distanceScore * this.config.weights.demographic.distance;

    const behavioralScore = 
      acceptanceRateScore * this.config.weights.behavioral.acceptedOffers +
      (10 - acceptanceRateScore) * this.config.weights.behavioral.canceledOffers +
      responseTimeScore * this.config.weights.behavioral.averageReplyTime;

    let finalScore = demographicScore * 0.2 + behavioralScore * 0.8;

    // Aplicar randomness para pacientes com poucos dados
    if (this.config.randomnessConfig.enabled) {
      finalScore = this.applyRandomnessBoost(patient, finalScore);
    }

    // Garantir que o score está entre 1 e 10
    finalScore = Math.max(1, Math.min(10, finalScore));

    return {
      ...patient,
      score: Number(finalScore.toFixed(2)),
      distance: Number(distance.toFixed(2)),
      demographicScore: Number(demographicScore.toFixed(2)),
      behavioralScore: Number(behavioralScore.toFixed(2)),
    };
  }

  private calculateAgeScore(age: number): number {
    // Preferência por idades intermediárias (30-65 anos)
    if (age < 30) {
      return 6 + (age / 30) * 2; // 6-8
    } else if (age <= 65) {
      return 10; // Score máximo
    } else {
      return 10 - ((age - 65) / 35) * 3; // 7-10
    }
  }

  private calculateDistanceScore(distanceKm: number): number {
    // Quanto mais perto, melhor
    if (distanceKm <= 10) return 10;
    if (distanceKm <= 25) return 9;
    if (distanceKm <= 50) return 7;
    if (distanceKm <= 100) return 5;
    return 3;
  }

  private calculateAcceptanceRateScore(patient: Patient): number {
    const totalOffers = patient.acceptedOffers + patient.canceledOffers;
    
    // Se não há dados suficientes, retornar score neutro
    if (totalOffers < 5) return 5;
    
    const acceptanceRate = patient.acceptedOffers / totalOffers;
    return acceptanceRate * 10;
  }

  private calculateResponseTimeScore(avgReplyTimeSeconds: number): number {
    // Quanto mais rápido responder, melhor
    if (avgReplyTimeSeconds <= 300) return 10;     // < 5 min
    if (avgReplyTimeSeconds <= 900) return 8;      // < 15 min
    if (avgReplyTimeSeconds <= 1800) return 6;     // < 30 min
    if (avgReplyTimeSeconds <= 3600) return 4;     // < 1h
    return 2;
  }

  private applyRandomnessBoost(patient: Patient, currentScore: number): number {
    const totalInteractions = patient.acceptedOffers + patient.canceledOffers;
    
    // Aplicar boost apenas para pacientes com poucos dados
    if (totalInteractions < this.config.randomnessConfig.lowDataThreshold) {
      const randomBoost = Math.random() * this.config.randomnessConfig.maxBoost * 10;
      return currentScore + randomBoost;
    }
    
    return currentScore;
  }
}
```

## Estratégia de Priorização

### Abordagem Escolhida: Simplicidade com Consciência

1. **Carregar todos os pacientes** do repositório
2. **Calcular score** para cada paciente em relação à facility
3. **Ordenar por score** decrescente
4. **Retornar top 10**

**Complexidade**: O(n log n) devido à ordenação

### Por que não otimizar mais?

- Dataset pequeno (~100-1000 pacientes)
- Código mais limpo e manutenível
- Demonstra conhecimento sem over-engineering
- Documentamos alternativas para escala futura

### Alternativas para Produção (Documentar no README):

```typescript
// 1. Min Heap para O(n log k)
// 2. Pré-filtro por distância
// 3. Cache de resultados por facility
// 4. Índices espaciais para busca geográfica
```

## Decisões de Design

### 1. Scoring de Idade
- **30-65 anos**: Score máximo (10)
- **< 30 anos**: Score 6-8 (jovens podem ser menos confiáveis)
- **> 65 anos**: Score 7-10 (idosos podem ter dificuldades de locomoção)

### 2. Scoring de Distância
- **< 10km**: Excelente (10)
- **10-25km**: Muito bom (9)
- **25-50km**: Bom (7)
- **50-100km**: Regular (5)
- **> 100km**: Difícil (3)

### 3. Scoring de Tempo de Resposta
- **< 5 min**: Excelente (10)
- **< 15 min**: Muito bom (8)
- **< 30 min**: Bom (6)
- **< 1h**: Regular (4)
- **> 1h**: Lento (2)

### 4. Randomness para Novos Pacientes
- Aplicado quando: `totalInteractions < 20`
- Boost máximo: 20% (2 pontos em escala 1-10)
- Garante rotação de pacientes novos

## Próximos Passos

1. Implementar Use Case `GetPrioritizedPatients`
2. Criar API REST com Express
3. Adicionar testes unitários e de integração
4. Configurar Docker
5. Escrever documentação completa

## Notas Importantes

- **Foco em Clean Code**: Separação clara de responsabilidades
- **Testabilidade**: Cada componente pode ser testado isoladamente
- **Configurabilidade**: Pesos e parâmetros ajustáveis
- **Extensibilidade**: Fácil adicionar novos critérios de scoring
- **Performance consciente**: Solução adequada ao problema
