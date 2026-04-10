const MAP: Record<string, string> = {
  apartments: 'Departamentos',
  houses: 'Casas',
  residential_lands: 'Terrenos',
  retail_spaces: 'Locales',
  offices: 'Oficinas',
  farms: 'Campos / chacras',
  parking_spaces: 'Cocheras',
  warehouses: 'Galpones',
};

export function propertyTypeLabel(code: string): string {
  return MAP[code] ?? code.replace(/_/g, ' ');
}
