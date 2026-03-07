
import React from 'react';
import { Product, Post } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'anduril',
    name: 'Andúril',
    price: 5000,
    description: 'The Flame of the West. Forged from the shards of Narsil, this blade was carried by Aragorn II Elessar to reclaim the throne of Gondor.',
    image: 'https://i.pinimg.com/736x/4c/ac/69/4cac6960386f2b181a60f6a85e9c8c52.jpg',
    rarity: 'Legendary',
    category: 'Weapon'
  },
  {
    id: 'longclaw',
    name: 'Longclaw',
    price: 3200,
    description: 'A Valyrian steel bastard sword. Formerly the ancestral blade of House Mormont, now wielded by Jon Snow, the White Wolf.',
    image: 'https://i.pinimg.com/736x/29/92/1f/29921f653f2bd9ef36e20d9c5573a8a6.jpg',
    rarity: 'Legendary',
    category: 'Weapon'
  },
  {
    id: 'lancelot-shield',
    name: 'Shield of Lancelot',
    price: 1800,
    description: 'A heavy steel kite shield embossed with the silver lions of Lancelot du Lac. Provides unmatched protection against the dark.',
    image: 'https://i.pinimg.com/1200x/26/0a/50/260a504cbf5fedc2983f2682bf8eee8c.jpg',
    rarity: 'Epic',
    category: 'Armor'
  },
  {
    id: 'glamdring',
    name: "Robert Baratheon's Warhammer",
    price: 4500,
    description: "Robert wielded his warhammer during Robert's Rebellion. The Lord of Storm's End used its spike to deal a crushing blow against Rhaegar Targaryen, Prince of Dragonstone, in the Battle of the Trident, smashing his chest, sending rubies from Rhaegar's armor into the river.",
    image: 'https://i.pinimg.com/1200x/20/37/3e/20373eac41ce4511be9f63e989eb9605.jpg',
    rarity: 'Legendary',
    category: 'Weapon'
  },
  {
    id: 'baratheon-armor',
    name: "Baratheons' armor",
    price: 2500,
    description: 'Baratheon armor is defined by heavy steel plate, often in polished steel or gold, featuring prominent stag antler motifs on the helmets to represent their sigil',
    image: 'https://i.pinimg.com/1200x/e1/6d/cf/e16dcf5c8056aec19a135244ca5ba2cf.jpg',
    rarity: 'Epic',
    category: 'Armor'
  },
  {
    id: 'dragon-scale-plate',
    name: 'Dragon Scale Plate',
    price: 3800,
    description: 'Armor crafted from the scales of a slain ancient red dragon. Highly resistant to fire and physical trauma.',  
    image: "/images/baelor-armour.png",
    rarity: 'Legendary',
    category: 'Armor'
  }
];

export const MOCK_POSTS: Post[] = [
  {
    id: '1',
    title: 'The Siege of Ironhold: A First-hand Account',
    author: 'Sir Gallahad',
    content: 'The dragons came at dawn. Their fire turned the sky to a bruised purple. I raised my shield as the heat scorched the ramparts...',
    date: '2 hours ago',
    likes: 124,
    commentsCount: 15,
    tags: ['Lore', 'Battle', 'Dragon']
  },
  {
    id: '2',
    title: 'New Alchemical Recipes Found!',
    author: 'Merlin the Wise',
    content: 'I have discovered that mixing blue mushrooms with starlight dust creates a potent tonic of resurgence. One drop is enough to heal any wound.',
    date: '5 hours ago',
    likes: 342,
    commentsCount: 42,
    tags: ['Alchemy', 'Magic']
  }
];
