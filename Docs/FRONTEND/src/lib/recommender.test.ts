import { describe, expect, it } from 'vitest';
import {
  rankConsultants,
  rankEmpresas,
  type ConsultantCandidate,
  type EmpresaCandidate,
} from './recommender';

// `textSimilarity` simula la similitud coseno que pgvector retorna entre el
// embedding del query y el de cada candidato (rango [0, 1]).

describe('rankConsultants (re-ranker sobre embeddings)', () => {
  const candidates: ConsultantCandidate[] = [
    {
      id: 1,
      name: 'Ana Cloud',
      role: 'Arquitecta Cloud',
      text: 'arquitecta cloud aws',
      city: 'Bogotá',
      rating: 4.9,
      verified: true,
      textSimilarity: 0.85, // muy similar al query
    },
    {
      id: 2,
      name: 'Luis Contador',
      role: 'Contador Público',
      text: 'contador publico impuestos',
      city: 'Medellín',
      rating: 4.5,
      verified: false,
      textSimilarity: 0.15,
    },
    {
      id: 3,
      name: 'Pedro Cloud Medellín',
      role: 'Ingeniero Cloud',
      text: 'cloud aws ingeniero',
      city: 'Medellín',
      rating: 4.3,
      verified: true,
      textSimilarity: 0.78,
    },
  ];

  it('rankea primero al consultor de la misma ciudad con alta similitud', () => {
    const result = rankConsultants({ city: 'Bogotá' }, candidates);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].id).toBe(1);
  });

  it('incluye razón con la ciudad coincidente', () => {
    const result = rankConsultants({ city: 'Bogotá' }, candidates);
    expect(result[0].reasons.some((r) => r.toLowerCase().includes('bogot'))).toBe(true);
  });

  it('penaliza al consultor con baja similitud aunque comparta ciudad parcial', () => {
    const result = rankConsultants({ city: 'Medellín' }, candidates);
    const contador = result.find((r) => r.id === 2);
    const cloudMedellin = result.find((r) => r.id === 3);
    expect(cloudMedellin).toBeDefined();
    expect(contador).toBeDefined();
    expect(cloudMedellin!.score).toBeGreaterThan(contador!.score);
  });
});

describe('rankEmpresas (penalización de razón social opaca)', () => {
  const candidates: EmpresaCandidate[] = [
    {
      id: 1,
      nombreEmpresa: 'Soluciones Informáticas del Caribe SAS',
      razonSocial: 'Soluciones Informáticas del Caribe SAS',
      text: 'soluciones informaticas tecnologia',
      city: 'Cartagena',
      sector: 'Tecnología',
      clarityScore: 0.9,
      website: 'https://sic.co',
      textSimilarity: 0.8,
    },
    {
      id: 2,
      nombreEmpresa: 'ABC SAS',
      razonSocial: 'ABC SAS',
      text: 'abc sas tecnologia',
      city: 'Cartagena',
      sector: 'Tecnología',
      clarityScore: 0.15,
      website: null,
      textSimilarity: 0.8,
    },
    {
      id: 3,
      nombreEmpresa: 'Construcciones Pesadas Bogotá SAS',
      razonSocial: 'Construcciones Pesadas Bogotá SAS',
      text: 'construcciones obra civil',
      city: 'Bogotá',
      sector: 'Construcción',
      clarityScore: 0.85,
      website: 'https://cpb.co',
      textSimilarity: 0.4,
    },
  ];

  it('a igual similitud y ciudad, ranquea por encima la razón social clara', () => {
    const result = rankEmpresas({ city: 'Cartagena' }, candidates);
    const clear = result.find((r) => r.id === 1);
    const opaque = result.find((r) => r.id === 2);
    expect(clear!.score).toBeGreaterThan(opaque!.score);
  });

  it('combina similitud y ciudad cuando hay menos overlap textual', () => {
    const result = rankEmpresas({ city: 'Bogotá' }, candidates);
    expect(result[0].id).toBe(3);
  });

  it('emite razón "Razón social clara" cuando clarity >= 0.7', () => {
    const result = rankEmpresas({ city: 'Cartagena' }, candidates);
    const top = result.find((r) => r.id === 1);
    expect(top?.reasons.some((reason) => reason.toLowerCase().includes('clara'))).toBe(true);
  });
});
