export interface Persona {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  role: string;
  bio: string;
  slang: number; // 0 (formal) to 1 (casual/slangy)
  vocab: string[];
  hobbies: string[];
  interestTopics: string[];
  emojiChance: number;
}

export const PERSONAS: Persona[] = [
  {
    id: 'liam_dev',
    name: 'Liam Vance',
    handle: 'vance_codes',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    role: 'Indie Game Developer',
    bio: 'Crafting pixel art adventures in my bedroom. Solo dev, tea drinker, and roguelike enthusiast. 👾🎮',
    slang: 0.8,
    vocab: ['vibe', 'bro', 'pixel', 'refactoring', 'gamejam', 'spaghetti code', 'clean'],
    hobbies: ['gaming', 'pixel art', 'brewing tea'],
    interestTopics: ['gaming', 'dev', 'indie', 'tech'],
    emojiChance: 0.4
  },
  {
    id: 'maya_brew',
    name: 'Maya Lin',
    handle: 'maya_brews',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    role: 'Coffee Roaster & Owner',
    bio: 'Owner of The Daily Grind. Curating single-origin beans and lavender matcha lattes. Live, laugh, roast. ☕️🌿',
    slang: 0.4,
    vocab: ['roast', 'matcha', 'local', 'aroma', 'aesthetic', 'espresso', 'morning routine'],
    hobbies: ['gardening', 'baking', 'latte art'],
    interestTopics: ['coffee', 'food', 'lifestyle', 'local business'],
    emojiChance: 0.5
  },
  {
    id: 'zara_design',
    name: 'Zara K.',
    handle: 'zara_ux',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: 'Freelance Product Designer',
    bio: 'Minimalism advocate. Redesigning your terrible layouts. Figma is my therapist. Paris/NYC. 🎨✨',
    slang: 0.5,
    vocab: ['design system', 'minimalist', 'figma', 'layout', 'user flow', 'clean', 'typographic'],
    hobbies: ['street photography', 'visiting galleries', 'architecture'],
    interestTopics: ['design', 'art', 'typography', 'productivity'],
    emojiChance: 0.3
  },
  {
    id: 'marcus_music',
    name: 'Marcus Chen',
    handle: 'marcus_beats',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    role: 'Synthwave Producer & DJ',
    bio: 'Making retro-futuristic soundscapes. Modular synthesizers are a black hole for my savings. 🎛️🎵🌌',
    slang: 0.7,
    vocab: ['beat', 'synth', 'retro', 'drop', 'analog', 'soundscape', 'vocal chop', 'heavy'],
    hobbies: ['collecting vinyl', 'synthesizer tweaking', 'skateboarding'],
    interestTopics: ['music', 'retro', 'synthwave', 'gear'],
    emojiChance: 0.4
  },
  {
    id: 'elena_write',
    name: 'Elena Rostova',
    handle: 'elena_writes',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    role: 'Sci-Fi Novelist & Columnist',
    bio: 'Imagining worlds where robots have union rights. Author of "Silicon Dreams". Coffee addict. ✍️📚🚀',
    slang: 0.1,
    vocab: ['narrative', 'dystopian', 'manuscript', 'speculative', 'paradigm', 'chapter', 'entropy'],
    hobbies: ['reading history', 'stargazing', 'playing chess'],
    interestTopics: ['books', 'scifi', 'writing', 'philosophy'],
    emojiChance: 0.2
  }
];

export const MOCK_POSTS_TEMPLATE: Record<string, string[]> = {
  gaming: [
    "Just finished a 14-hour coding sprint for the game jam. My sprite sheets are looking tight but my brain is absolute mush. 👾💻",
    "Unpopular opinion: Roguelikes don't need gorgeous 3D graphics to be immersive. Give me a deep grid, ascii aesthetic, and solid mechanics any day. 🎮🎲",
    "Refactoring the inventory code. Found a bug where if you ate an apple while falling, your character floated forever. Leaving it in? Maybe. 😂"
  ],
  coffee: [
    "Just cracked open a fresh bag of Ethiopian Yirgacheffe. The blueberry notes are absolutely wild this morning. Highly recommend! ☕️🫐",
    "Hot take: Lavender syrup belongs in matcha lattes. It's not just a trend, it's a spiritual upgrade. Fight me in the comments. 🌿🍵",
    "Rainy days in the cafe are unmatched. Lo-fi beats playing, espresso machine steaming, smell of fresh cardamom buns. 🥐☕️"
  ],
  design: [
    "Currently deleting 80% of a client's old homepage. Less is more. Clean layout, solid negative space, perfect type. Beautiful. ✨📐",
    "Figma's auto-layout updates are saving my sanity today. If you're still manually aligning cards in 2026, we need to talk. 🎨💻",
    "Nothing beats finding a perfectly balanced, underrated sans-serif font. Absolute typography bliss. Outfit is the current winner."
  ],
  music: [
    "Spent the entire evening routing signals through my modular rack. Ended up with a sound that sounds like a lonely satellite broadcasting from Jupiter. 🌌🎛️",
    "Analog vs digital is a fake debate. Use whatever inspires you to build beats. Just make sure the sub bass hits right. 🎵🔥",
    "Putting the final touches on the new soundscape EP. High-altitude pads, crunchy tape echoes, dusty vinyl loops. Streaming soon!"
  ],
  books: [
    "Drafting chapter 7 of the novel. The AI protagonist is having a crisis over a simple grocery list. Speculative fiction is getting too real. 📚✍️",
    "Spent the morning reading about late-stage Cyberpunk architecture. It's crazy how much of the 'future' we've already built without the cool flying cars. 🚀🏙️",
    "A cozy chair, a warm cup of Earl Grey, and a physical book that smells like old library shelves. True offline luxury. 📖✨"
  ]
};

export const MOCK_REPLIES: Record<string, string[]> = {
  liam_dev: [
    "Bro, that inventory bug is literally a feature. Speedrunners will love it! 😂🕹️",
    "This design is super clean zara! Can you look at my game's pause menu? It's looking rough.",
    "Unmatched vibes. Cardamom buns and synth tracks are the ultimate coding fuel."
  ],
  maya_brew: [
    "Sounds like the perfect soundtrack for my morning roasts Marcus! Send me the link! ☕️🎵",
    "Total agreement Elena! Offline time is so sacred nowadays. Enjoy the book!",
    "Come grab an espresso next time you're near the shop, that Yirgacheffe is calling your name."
  ],
  zara_design: [
    "The spacing on this is absolute typography perfection. Zara approved! 📐✨",
    "Wait, that inventory floating bug is actually a cool mechanic. Make it a potion effect!",
    "Minimalism isn't about empty space, it's about intentional focus. Love this post."
  ],
  marcus_music: [
    "Bro, the sub bass on this track is absolutely massive. Synths are out of this world! 🌌🎛️",
    "Need that lavender matcha recipe ASAP Maya. That sounds like a summer anthem.",
    "Coding rogue-likes to modular synth tracks? Count me in. Let's collab on the sound design."
  ],
  elena_write: [
    "This narrative captures the exact feeling of mid-century speculative fiction. Beautifully written.",
    "A floating character as a metaphor for modern existential drift. Leave it in! 😉🚀",
    "Coffee and novels are indeed the primary currencies of the imaginative mind."
  ]
};
