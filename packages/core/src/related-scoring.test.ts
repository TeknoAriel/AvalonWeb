import { describe, expect, it } from 'vitest';
import type { NormalizedProperty } from '@avalon/types';
import { pickSmartRelated } from './related-scoring';

const agent = {
  id: 1,
  name: 'Agente',
  email: null,
  phone: null,
  phone_whatsapp: null,
  avatar: null,
};
const agency = { id: 1, name: 'Agencia' };

function baseProp(id: number, patch: Partial<NormalizedProperty> = {}): NormalizedProperty {
  const core: NormalizedProperty = {
    id,
    slug: `prop-${id}`,
    canonicalUrl: '',
    title: `Prop ${id}`,
    descriptionHtml: '',
    plainDescription: '',
    status: 'active',
    lastUpdate: '2024-06-01',
    propertyType: 'apartment',
    propertyTypeLabel: 'Departamento',
    operation: {
      forSale: true,
      forRent: false,
      forTempRental: false,
      salePrice: '100000',
      rentPrice: null,
      tempPrices: { day: null, week: null, month: null },
      currency: 'USD',
      hidePrices: false,
    },
    rooms: { totalRooms: 4, bedrooms: 2, bathrooms: 1, halfBathrooms: null },
    surfaces: { totalM2: '80', coveredM2: '70', uncoveredM2: null, frontM: null },
    building: { floor: '3', floorsInBuilding: 10, parkings: 1, yearBuilt: 2020 },
    location: {
      address: 'Calle 1',
      city: 'Rosario',
      region: 'Santa Fe',
      country: 'AR',
      zone: 'Centro',
      zoneSecondary: '',
      postcode: null,
      latitude: null,
      longitude: null,
      hideExactLocation: false,
    },
    media: { images: [], youtubeUrl: null, tour360Html: null },
    amenities: [{ id: 'balcon', label: 'Balcón', group: 'exteriores' }],
    agent,
    agency,
    isPremier: false,
    editorial: { isFeatured: false, priorityRank: null },
  };
  return { ...core, ...patch };
}

describe('pickSmartRelated', () => {
  it('prioriza misma ciudad y zona frente a otra ciudad con precio parecido', () => {
    const current = baseProp(1);
    const sameCityZone = baseProp(2, {
      location: { ...current.location, address: 'Otra' },
      operation: { ...current.operation, salePrice: '105000' },
    });
    const otherCity = baseProp(3, {
      location: {
        ...current.location,
        city: 'Córdoba',
        zone: 'Centro',
      },
      operation: { ...current.operation, salePrice: '102000' },
    });
    const out = pickSmartRelated(current, [otherCity, sameCityZone], 2);
    expect(out.map((p) => p.id)).toEqual([2, 3]);
  });

  it('entre candidatos de la misma ciudad, acerca precio y dormitorios', () => {
    const current = baseProp(10, {
      rooms: { totalRooms: 5, bedrooms: 3, bathrooms: 2, halfBathrooms: null },
      operation: { ...baseProp(10).operation, salePrice: '200000' },
    });
    const close = baseProp(11, {
      location: current.location,
      rooms: { totalRooms: 5, bedrooms: 3, bathrooms: 2, halfBathrooms: null },
      operation: { ...current.operation, salePrice: '205000' },
    });
    const farPrice = baseProp(12, {
      location: current.location,
      rooms: { totalRooms: 5, bedrooms: 3, bathrooms: 2, halfBathrooms: null },
      operation: { ...current.operation, salePrice: '450000' },
    });
    const out = pickSmartRelated(current, [farPrice, close], 2);
    expect(out[0]!.id).toBe(11);
  });

  it('aplica bonus débil por favoritos sin imponerse a fuerte match geográfico', () => {
    const current = baseProp(20);
    const strong = baseProp(21, {
      location: current.location,
      operation: { ...current.operation, salePrice: '100000' },
    });
    const weakButFav = baseProp(22, {
      location: {
        ...current.location,
        city: 'Rosario',
        zone: 'Fisherton',
      },
      operation: { ...current.operation, salePrice: '100000' },
    });
    const plain = pickSmartRelated(current, [weakButFav, strong], 2);
    expect(plain[0]!.id).toBe(21);

    const hinted = pickSmartRelated(current, [weakButFav, strong], 2, {
      hints: { favoritedPropertyIds: [22] },
    });
    expect(hinted[0]!.id).toBe(21);
  });
});
