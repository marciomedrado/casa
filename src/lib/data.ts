import type { Property, Location, Item, User } from './types';
import { PlaceHolderImages } from './placeholder-images';

const findImage = (id: string) => {
    const img = PlaceHolderImages.find(p => p.id === id);
    if (!img) return { imageUrl: 'https://picsum.photos/seed/placeholder/400/300', imageHint: 'placeholder' };
    return { imageUrl: img.imageUrl, imageHint: img.imageHint };
}

export let MOCK_USER: User = {
    name: "Alex Silva",
    email: "alex.silva@email.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d"
}

export let MOCK_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    name: 'Casa Principal',
    address: 'Rua das Flores, 123, São Paulo',
    ...findImage('property-1'),
  },
  {
    id: 'prop-2',
    name: 'Apartamento Praia',
    address: 'Av. Beira Mar, 456, Rio de Janeiro',
    ...findImage('property-2'),
  },
];

const locationsProp1: Location[] = [
    {
        id: 'loc-1-1', name: 'Sala de Estar', propertyId: 'prop-1', parentId: null, type: 'room', icon: 'DoorOpen',
        children: [
            { id: 'loc-1-1-1', name: 'Estante de Livros', propertyId: 'prop-1', parentId: 'loc-1-1', type: 'shelf', icon: 'Library', children: [] },
            { id: 'loc-1-1-2', name: 'Mesa de Centro', propertyId: 'prop-1', parentId: 'loc-1-1', type: 'other', icon: 'GanttChartSquare', children: [] },
        ],
    },
    {
        id: 'loc-1-2', name: 'Garagem', propertyId: 'prop-1', parentId: null, type: 'room', icon: 'Warehouse',
        children: [
            { id: 'loc-1-2-1', name: 'Armário de Ferramentas', propertyId: 'prop-1', parentId: 'loc-1-2', type: 'cabinet', icon: 'Archive',
                children: [
                    { id: 'loc-1-2-1-1', name: 'Caixa A', propertyId: 'prop-1', parentId: 'loc-1-2-1', type: 'box', icon: 'Box', children: [] },
                ]
            }
        ]
    },
    {
        id: 'loc-1-3', name: 'Escritório', propertyId: 'prop-1', parentId: null, type: 'room', icon: 'BookOpen',
        children: [
            { id: 'loc-1-3-1', name: 'Gaveteiro', propertyId: 'prop-1', parentId: 'loc-1-3', type: 'drawer', icon: 'Archive',
                children: [
                    { id: 'loc-1-3-1-1', name: 'Documentos 2023', propertyId: 'prop-1', parentId: 'loc-1-3-1', type: 'box', icon: 'FileText', children: [] },
                ]
            }
        ]
    }
];

const locationsProp2: Location[] = [
    { id: 'loc-2-1', name: 'Cozinha', propertyId: 'prop-2', parentId: null, type: 'room', icon: 'DoorOpen',
        children: [
            { id: 'loc-2-1-1', name: 'Armário de Louças', propertyId: 'prop-2', parentId: 'loc-2-1', type: 'cabinet', icon: 'Archive',
                children: [
                    { id: 'loc-2-1-1-1', name: 'Prateleira 2', propertyId: 'prop-2', parentId: 'loc-2-1-1', type: 'shelf', icon: 'GanttChartSquare', children: [] },
                ]
            }
        ]
    },
];

export let MOCK_LOCATIONS: Location[] = [...locationsProp1, ...locationsProp2];


export let MOCK_ITEMS: Item[] = [
    {
        id: 'item-1', propertyId: 'prop-1', locationId: 'loc-1-2-1-1', name: 'Furadeira Bosch',
        description: '110V com conjunto de brocas', quantity: 1, tags: ['ferramenta', 'elétrica'],
        ...findImage('item-drill'), isContainer: false, parentId: null,
        locationPath: ['Garagem', 'Armário de Ferramentas', 'Caixa A']
    },
    {
        id: 'item-2', propertyId: 'prop-1', locationId: 'loc-1-1-1', name: 'Coleção Guia do Mochileiro',
        description: 'Box com 5 livros', quantity: 1, tags: ['livro', 'ficção científica'],
        ...findImage('item-books'), isContainer: false, parentId: null,
        locationPath: ['Sala de Estar', 'Estante de Livros']
    },
    {
        id: 'item-3', propertyId: 'prop-2', locationId: 'loc-2-1-1-1', name: 'Taças de vinho de cristal',
        description: 'Conjunto com 6 peças', quantity: 6, tags: ['cozinha', 'vidro', 'frágil'],
        ...findImage('item-glasses'), isContainer: false, parentId: null,
        locationPath: ['Cozinha', 'Armário de Louças', 'Prateleira 2']
    },
    {
        id: 'item-4', propertyId: 'prop-1', locationId: 'loc-1-3', name: 'Gaveteiro de Documentos',
        description: 'Gaveteiro com 3 gavetas para organização de documentos', quantity: 1, tags: ['móvel', 'organizador', 'escritório'],
        ...findImage('item-file-cabinet'), isContainer: true, parentId: null,
        doorCount: 0, drawerCount: 3,
        locationPath: ['Escritório']
    },
    {
        id: 'item-5', propertyId: 'prop-1', locationId: 'loc-1-3', name: 'Contratos e Apólices',
        description: 'Contratos de aluguel e apólices de seguro.', quantity: 1, tags: ['documentos', 'legal'],
        ...findImage('item-contracts'), isContainer: false, parentId: 'item-4', subContainer: { type: 'drawer', number: 1},
        locationPath: ['Escritório', 'Gaveteiro de Documentos', 'Gaveta 1']
    },
     {
        id: 'item-6', propertyId: 'prop-1', locationId: 'loc-1-3', name: 'Passaportes e Vistos',
        description: 'Documentos de viagem da família', quantity: 4, tags: ['documentos', 'viagem'],
        ...findImage('item-passports'), isContainer: false, parentId: 'item-4', subContainer: { type: 'drawer', number: 1},
        locationPath: ['Escritório', 'Gaveteiro de Documentos', 'Gaveta 1']
    },
    {
        id: 'item-7', propertyId: 'prop-1', locationId: 'loc-1-3', name: 'Manuais de Eletrônicos',
        description: 'Manuais e garantias de aparelhos.', quantity: 1, tags: ['manuais', 'garantia'],
        ...findImage('item-manuals'), isContainer: false, parentId: 'item-4', subContainer: { type: 'drawer', number: 2},
        locationPath: ['Escritório', 'Gaveteiro de Documentos', 'Gaveta 2']
    },
    {
        id: 'item-8', propertyId: 'prop-1', locationId: 'loc-1-3', name: 'Carregadores e Cabos',
        description: 'Cabos USB, carregadores de celular e adaptadores diversos.', quantity: 1, tags: ['eletrônicos', 'cabos'],
        ...findImage('item-cables'), isContainer: false, parentId: 'item-4',
        locationPath: ['Escritório', 'Gaveteiro de Documentos']
    }
];

// Helper to build location tree
export const buildLocationTree = (locations: Location[], parentId: string | null = null): Location[] => {
  return locations
    .filter(location => location.parentId === parentId)
    .map(location => ({
      ...location,
      children: buildLocationTree(locations, location.id),
    }));
};

export const buildItemTree = (items: Item[]): Item[] => {
  const itemMap = new Map(items.map(item => [item.id, { ...item, children: [] }]));
  const tree: Item[] = [];

  items.forEach(item => {
    const treeItem = itemMap.get(item.id);
    if (!treeItem) return;

    if (item.parentId && itemMap.has(item.parentId)) {
      const parent = itemMap.get(item.parentId);
      parent?.children?.push(treeItem);
    } else {
      tree.push(treeItem);
    }
  });

  return tree;
}

// Functions to update mock data in-memory
export const addProperty = (property: Property) => {
  MOCK_PROPERTIES.push(property);
};

export const updateProperty = (property: Property) => {
  const index = MOCK_PROPERTIES.findIndex(p => p.id === property.id);
  if (index !== -1) {
    MOCK_PROPERTIES[index] = property;
  }
};

export const addLocation = (location: Location) => {
  MOCK_LOCATIONS.push(location);
}

export const updateLocation = (location: Location) => {
    const index = MOCK_LOCATIONS.findIndex(l => l.id === location.id);
    if (index !== -1) {
        const { children, ...rest } = location;
        MOCK_LOCATIONS[index] = rest as Location;
    }
}

export const addItem = (item: Item) => {
  MOCK_ITEMS.push(item);
}

export const updateItem = (item: Item) => {
    const index = MOCK_ITEMS.findIndex(i => i.id === item.id);
    if (index !== -1) {
        MOCK_ITEMS[index] = item;
    }
}
