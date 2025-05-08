// Mock data for local hardware stores and their inventory
// This will be used as fallback when the API is not available or for testing

export interface MockPart {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
  image: string;
  description: string;
  category: string;
}

export interface MockStore {
  id: number;
  name: string;
  logo: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  hours: string;
  latitude: number;
  longitude: number;
  distance?: string; // Will be calculated based on user location
}

// Mock hardware stores
export const stores: MockStore[] = [
  {
    id: 1,
    name: "Home Depot",
    logo: "home-depot-logo.svg",
    address: "3721 W Dublin Granville Rd",
    city: "Columbus",
    state: "OH",
    zipCode: "43235",
    phone: "(614) 761-7300",
    hours: "6:00 AM - 10:00 PM",
    latitude: 40.0867,
    longitude: -83.0929
  },
  {
    id: 2,
    name: "Lowe's",
    logo: "lowes-logo.svg",
    address: "2345 Silver Dr",
    city: "Columbus",
    state: "OH",
    zipCode: "43211",
    phone: "(614) 447-4420",
    hours: "6:00 AM - 9:00 PM",
    latitude: 40.0269,
    longitude: -82.9883
  },
  {
    id: 3,
    name: "Ace Hardware",
    logo: "ace-hardware-logo.svg",
    address: "4780 Reed Rd",
    city: "Columbus",
    state: "OH",
    zipCode: "43220",
    phone: "(614) 326-1950",
    hours: "7:30 AM - 8:00 PM",
    latitude: 40.0619,
    longitude: -83.0507
  },
  {
    id: 4,
    name: "Menards",
    logo: "menards-logo.svg",
    address: "1805 Morse Rd",
    city: "Columbus",
    state: "OH",
    zipCode: "43229",
    phone: "(614) 324-3700",
    hours: "6:30 AM - 9:00 PM",
    latitude: 40.0614,
    longitude: -82.9783
  }
];

// Mock plumbing parts
export const plumbingParts: MockPart[] = [
  {
    id: 1,
    name: "Dimmer Light Switch",
    price: 1799, // $17.99
    inStock: true,
    image: "dimmer-switch.jpg",
    description: "Single-pole/3-way dimmer switch with LED indicator",
    category: "Electrical"
  },
  {
    id: 2,
    name: "LED Compatible Dimmer",
    price: 2499, // $24.99
    inStock: true,
    image: "led-dimmer.jpg",
    description: "Smart dimmer switch compatible with LED and CFL bulbs",
    category: "Electrical"
  },
  {
    id: 3,
    name: "Wall Plate - Single Switch",
    price: 499, // $4.99
    inStock: true,
    image: "wall-plate.jpg",
    description: "Standard white decorator wall plate for single switch",
    category: "Electrical"
  },
  {
    id: 4,
    name: "Copper Wire 14-2",
    price: 7995, // $79.95
    inStock: true,
    image: "copper-wire.jpg",
    description: "14-gauge copper wire, 100ft roll",
    category: "Electrical"
  },
  {
    id: 5,
    name: "Wire Connector Pack",
    price: 599, // $5.99
    inStock: true,
    image: "wire-connectors.jpg",
    description: "Assorted wire nuts/connectors, pack of 50",
    category: "Electrical"
  },
  {
    id: 6,
    name: "Toilet Flapper Valve",
    price: 899, // $8.99
    inStock: true,
    image: "toilet-flapper.jpg",
    description: "Universal toilet tank flapper valve replacement",
    category: "Plumbing"
  },
  {
    id: 7,
    name: "Toilet Fill Valve",
    price: 1299, // $12.99
    inStock: true,
    image: "toilet-fill-valve.jpg",
    description: "Universal toilet tank fill valve",
    category: "Plumbing"
  },
  {
    id: 8,
    name: "Bathroom Faucet - Chrome",
    price: 7999, // $79.99
    inStock: true,
    image: "bathroom-faucet.jpg",
    description: "4-inch centerset bathroom faucet, chrome finish",
    category: "Plumbing"
  },
  {
    id: 9,
    name: "Kitchen Sink Drain Assembly",
    price: 2499, // $24.99
    inStock: true,
    image: "sink-drain.jpg",
    description: "Complete kitchen sink drain assembly with strainer",
    category: "Plumbing"
  },
  {
    id: 10,
    name: "Garbage Disposal",
    price: 8999, // $89.99
    inStock: true,
    image: "garbage-disposal.jpg",
    description: "1/3 HP continuous feed garbage disposal",
    category: "Plumbing"
  }
];

// Function to get a random price variation (±15%) for the same part at different stores
function getRandomPriceVariation(basePrice: number): number {
  const variation = basePrice * (0.85 + Math.random() * 0.3); // ±15%
  return Math.round(variation);
}

// Function to simulate a part search
export function searchPartsInMockStores(query: string): any[] {
  // Find parts that match the query
  const matchingParts = plumbingParts.filter(part => 
    part.name.toLowerCase().includes(query.toLowerCase()) ||
    part.description.toLowerCase().includes(query.toLowerCase()) ||
    part.category.toLowerCase().includes(query.toLowerCase())
  );
  
  if (matchingParts.length === 0) {
    return [];
  }
  
  // For each matching part, create a result for each store with slight price variations
  return stores.map(store => {
    // Create a random distance (1-15 miles)
    const distance = (1 + Math.random() * 14).toFixed(1) + " miles";
    
    // Create store parts with price variations
    const storeParts = matchingParts.map(part => ({
      id: part.id,
      name: part.name,
      price: getRandomPriceVariation(part.price),
      inStock: Math.random() > 0.2, // 80% chance of being in stock
      image: part.image
    }));
    
    return {
      id: store.id,
      name: store.name,
      distance,
      address: `${store.address}, ${store.city}, ${store.state}`,
      parts: storeParts
    };
  }).sort((a, b) => {
    // Sort by distance
    const distA = parseFloat(a.distance);
    const distB = parseFloat(b.distance);
    return distA - distB;
  });
}
