import * as fs from 'fs';
import * as path from 'path';

import { Service } from 'typedi';

import { Patient } from '../../domain/entities/Patient';
import { PatientRepository } from '../../domain/repositories/PatientRepository';

@Service()
export class InMemoryPatientRepository implements PatientRepository {
  private patients: Patient[] = [];

  constructor() {
    this.loadPatientsFromFile();
  }

  async findAll(): Promise<Patient[]> {
    return Promise.resolve([...this.patients]);
  }

  async findById(id: string): Promise<Patient | null> {
    const patient = this.patients.find((p) => p.id === id);
    return Promise.resolve(patient || null);
  }

  private loadPatientsFromFile(): void {
    try {
      const dataPath = path.join(process.cwd(), 'sample.json');

      if (fs.existsSync(dataPath)) {
        const rawData = fs.readFileSync(dataPath, 'utf-8');
        const parsedData = JSON.parse(rawData) as Patient[];

        this.patients = parsedData.map((item: Patient) => ({
          id: item.id,
          name: item.name,
          location: {
            latitude: Number(item.location.latitude),
            longitude: Number(item.location.longitude),
          },
          age: item.age,
          acceptedOffers: item.acceptedOffers,
          canceledOffers: item.canceledOffers,
          averageReplyTime: item.averageReplyTime,
        }));
      } else {
        console.warn('sample.json not found. Repository initialized with empty data.');
        this.patients = [];
      }
    } catch (error) {
      console.error('Error loading patient data:', error);
      this.patients = [];
    }
  }
}
