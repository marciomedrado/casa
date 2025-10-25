
import type { Property, Location, Item } from './types';
import { MOCK_PROPERTIES, FLATTENED_MOCK_LOCATIONS, MOCK_ITEMS } from './data';

const DB_PREFIX = 'casa-organizzata';
const PROPERTIES_KEY = `${DB_PREFIX}-properties`;
const LOCATIONS_KEY = `${DB_PREFIX}-locations`;
const ITEMS_KEY = `${DB_PREFIX}-items`;

function getFromStorage<T>(key: string): T[] {
    if (typeof window === 'undefined') {
        return [];
    }
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : [];
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return [];
    }
}

function saveToStorage<T>(key: string, value: T[]): void {
     if (typeof window === 'undefined') {
        return;
    }
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error writing to localStorage key “${key}”:`, error);
    }
}

// --- Initialization ---
export function initializeDatabase() {
     if (typeof window === 'undefined') {
        return;
    }
    if (!localStorage.getItem(PROPERTIES_KEY)) {
        saveToStorage(PROPERTIES_KEY, MOCK_PROPERTIES);
    }
    if (!localStorage.getItem(LOCATIONS_KEY)) {
        saveToStorage(LOCATIONS_KEY, FLATTENED_MOCK_LOCATIONS);
    }
     if (!localStorage.getItem(ITEMS_KEY)) {
        saveToStorage(ITEMS_KEY, MOCK_ITEMS);
    }
}

// --- Properties API ---
export function getProperties(): Property[] {
    return getFromStorage<Property>(PROPERTIES_KEY);
}

export function getPropertyById(id: string): Property | undefined {
    return getProperties().find(p => p.id === id);
}

export function saveProperty(property: Omit<Property, 'id' | 'imageUrl' | 'imageHint'> & { id?: string }): Property {
    const properties = getProperties();
    if (property.id) { // Update
        const index = properties.findIndex(p => p.id === property.id);
        if (index !== -1) {
            properties[index] = { ...properties[index], name: property.name, address: property.address };
            saveToStorage(PROPERTIES_KEY, properties);
            return properties[index];
        }
    } 
    // Create
    const newProperty: Property = {
        ...property,
        id: `prop-${Date.now()}`,
        imageUrl: `https://picsum.photos/seed/${Date.now()}/600/400`,
        imageHint: 'new property'
    };
    const updatedProperties = [...properties, newProperty];
    saveToStorage(PROPERTIES_KEY, updatedProperties);
    return newProperty;
}

export function deleteProperty(propertyId: string): void {
    const properties = getProperties().filter(p => p.id !== propertyId);
    saveToStorage(PROPERTIES_KEY, properties);

    const locations = getFromStorage<Omit<Location, 'children'>>(LOCATIONS_KEY).filter(l => l.propertyId !== propertyId);
    saveToStorage(LOCATIONS_KEY, locations);

    const items = getFromStorage<Item>(ITEMS_KEY).filter(i => i.propertyId !== propertyId);
    saveToStorage(ITEMS_KEY, items);
}


// --- Locations API ---
export function getLocations(propertyId: string): Location[] {
    const allLocations = getFromStorage<Omit<Location, 'children'>>(LOCATIONS_KEY);
    return allLocations.filter(l => l.propertyId === propertyId);
}

export function saveLocation(location: Omit<Location, 'children' | 'propertyId'> & { id?: string }, propertyId: string): Location {
    const locations = getFromStorage<Omit<Location, 'children'>>(LOCATIONS_KEY);
    if (location.id) { // Update
         const index = locations.findIndex(l => l.id === location.id);
         if (index !== -1) {
            const updatedLocation = { ...locations[index], ...location, propertyId };
            locations[index] = updatedLocation;
            saveToStorage(LOCATIONS_KEY, locations);
            return updatedLocation as Location;
         }
    }
    // Create
    const newLocation: Omit<Location, 'children'> = {
        ...location,
        id: `loc-${Date.now()}`,
        propertyId,
    };
    const updatedLocations = [...locations, newLocation];
    saveToStorage(LOCATIONS_KEY, updatedLocations);
    return newLocation as Location;
}

export function deleteLocation(locationId: string): void {
    const locations = getFromStorage<Omit<Location, 'children'>>(LOCATIONS_KEY).filter(l => l.id !== locationId);
    saveToStorage(LOCATIONS_KEY, locations);
}

// --- Items API ---
export function getItems(propertyId: string): Item[] {
    const allItems = getFromStorage<Item>(ITEMS_KEY);
    return allItems.filter(i => i.propertyId === propertyId);
}

export function saveItem(item: Item, propertyId: string): Item {
    const items = getFromStorage<Item>(ITEMS_KEY);

    if (items.some(i => i.id === item.id)) { // Update
        const index = items.findIndex(i => i.id === item.id);
        if (index !== -1) {
            items[index] = { ...items[index], ...item, propertyId };
            saveToStorage(ITEMS_KEY, items);
            return items[index];
        }
    }
    // Create
    const newItem = { ...item, propertyId };
    if (!newItem.id) {
        newItem.id = `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
    if (!newItem.imageUrl) {
        newItem.imageUrl = `https://picsum.photos/seed/${newItem.id}/400/300`;
    }

    const updatedItems = [...items, newItem];
    saveToStorage(ITEMS_KEY, updatedItems);
    return newItem;
}

export function deleteItem(itemId: string): void {
    let items = getFromStorage<Item>(ITEMS_KEY);
    
    // Find the item to delete
    const itemToDelete = items.find(i => i.id === itemId);
    if (!itemToDelete) return;

    let idsToDelete = [itemId];

    // If the item is a container, find all children recursively
    if (itemToDelete.isContainer) {
        const findChildren = (parentId: string) => {
            const children = items.filter(i => i.parentId === parentId);
            for (const child of children) {
                idsToDelete.push(child.id);
                if (child.isContainer) {
                    findChildren(child.id);
                }
            }
        };
        findChildren(itemId);
    }
    
    // Filter out the item and all its children
    items = items.filter(i => !idsToDelete.includes(i.id));
    saveToStorage(ITEMS_KEY, items);
}
