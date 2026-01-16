export interface Pet {
  id: string;
  digitalId?: string; // ID digital legible (ej: MASC-XXXX-XXXX)
  name: string;
  owner: string;
  phone: string;
  address: string;
  type: string;
  breed: string;
  age: number;
  illness: string;
  observations: string;
  allergies?: string;
  fears?: string;
  favoriteToys?: string;
  imageUrl: string;
  status?: 'adoption' | 'lost' | 'stolen' | 'disoriented' | 'healthy';
  likes?: number;
  comments?: string[];
  description?: string;
  medicalHistory?: {
    date: string;
    type: string;
    description: string;
  }[];
  vaccinations?: {
    name: string;
    date: string;
    nextDue: string;
  }[];
  achievements?: {
    name: string;
    date: string;
  }[];
}