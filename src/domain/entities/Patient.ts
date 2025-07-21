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
  averageReplyTime: number;
}

export interface ScoredPatient extends Patient {
  score: number;
  distance?: number;
  demographicScore: number;
  behavioralScore: number;
}
