import type { Property, Location, Item, User } from './types';
import { PlaceHolderImages } from './placeholder-images';

const findImage = (id: string) => {
    const img = PlaceHolderImages.find(p => p.id === id);
    if (!img) return { imageUrl: 'https://picsum.photos/seed/placeholder/400/300', imageHint: 'placeholder' };
    return { imageUrl: img.imageUrl, imageHint: img.imageHint };
}

export const MOCK_USER: User = {
    name: "Alex Silva",
    email: "alex.silva@email.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d"
}

export const MOCK_PROPERTIES: Property[] = [
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

export const MOCK_LOCATIONS: Location[] = [...locationsProp1, ...locationsProp2];


export const MOCK_ITEMS: Item[] = [
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
        id: 'item-4', propertyId: 'prop-1', locationId: 'loc-1-3-1', name: 'Caixa de Documentos Importantes',
        description: 'Pasta com documentos importantes de 2023', quantity: 1, tags: ['documentos', 'importante', 'arquivo'],
        ...findImage('item-documents'), isContainer: true, parentId: null,
        locationPath: ['Escritório', 'Gaveteiro']
    },
    {
        id: 'item-5', propertyId: 'prop-1', locationId: 'loc-1-3-1', name: 'Contratos e Apólices',
        description: 'Contratos de aluguel e apólices de seguro.', quantity: 1, tags: ['documentos', 'legal'],
        ...findImage('item-contracts'), isContainer: false, parentId: 'item-4',
        locationPath: ['Escritório', 'Gaveteiro', 'Caixa de Documentos Importantes']
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
