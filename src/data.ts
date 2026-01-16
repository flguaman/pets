import { Pet } from './types';

export const initialPets: Pet[] = [
  {
    id: 1,
    name: 'Duke',
    owner: 'Jonathan Guaman',
    phone: '0962760094',
    address: 'Zhucay',
    type: 'Perro',
    breed: 'Común',
    age: 2,
    illness: 'Ninguna',
    observations: 'Siempre está dormido',
    imageUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeKqMboWhSDweSNHHw1G21X8mlKa029ZpjMg&s', // URL de la imagen
  },
  {
    id: 2,
    name: 'Pelusa',
    owner: 'García',
    phone: '0987654321',
    address: 'Avenida Siempre Viva 456',
    type: 'Gato',
    breed: 'Siamés',
    age: 2,
    illness: 'Alergia al polen',
    observations: 'Le encanta jugar con ovillos de lana',
    imageUrl:
      'https://images.ctfassets.net/denf86kkcx7r/4IPlg4Qazd4sFRuCUHIJ1T/f6c71da7eec727babcd554d843a528b8/gatocomuneuropeo-97?fm=webp&w=612', // URL de la imagen
  },
  {
    id: 3,
    name: 'Rocky',
    owner: 'Pedro Rodríguez',
    phone: '5555555555',
    address: 'Camino del Bosque 789',
    type: 'Hámster',
    breed: 'Dorado',
    age: 1,
    illness: 'Ninguna',
    observations: 'Rápido y curioso',
    imageUrl: 'https://example.com/images/rocky.jpg', // URL de la imagen
  },
  {
    id: 4,
    name: 'Pipas',
    owner: 'Pipo',
    phone: '1111111111',
    address: 'Turi',
    type: 'Gato',
    breed: 'Fino',
    age: 1,
    illness: 'Ictioftiriasis',
    observations: 'Miau muy suave',
    imageUrl: 'https://example.com/images/pipas.jpg', // URL de la imagen
  },
  {
    id: 5,
    name: 'Rex',
    owner: 'Ana López',
    phone: '0981234567',
    address: 'Colón 345',
    type: 'Perro',
    breed: 'Labrador',
    age: 3,
    illness: 'Ninguna',
    observations: 'Muy amigable y juguetón',
    imageUrl:
      'https://dragpharma.cl/wp-content/uploads/2023/10/576x640_PERRO-ESPECIE.jpg', // URL de la imagen
  },
  {
    id: 6,
    name: 'Gizmo',
    owner: 'Marco Pérez',
    phone: '0976543210',
    address: 'Av. de la Luz 321',
    type: 'Hámster',
    breed: 'Rayado',
    age: 1,
    illness: 'Ninguna',
    observations: 'Le gusta hacer ejercicio en rueda',
    imageUrl: 'https://example.com/images/gizmo.jpg', // URL de la imagen
  },
];
