import { Persona, PERSONAS, MOCK_POSTS_TEMPLATE, MOCK_REPLIES } from './Personas';

export interface Post {
  id: string;
  author: Persona;
  content: string;
  timestamp: string;
  likes: number;
  comments: Comment[];
  isLikedByUser?: boolean;
}

export interface Comment {
  id: string;
  author: Persona;
  content: string;
  timestamp: string;
}

export interface SimState {
  posts: Post[];
  trending: string[];
  news: string;
  speed: number; // seconds per auto-post
  apiUrl: string;
}

const NEWS_FLASHES = [
  "Local Coffee Shop introduces Lavender Matcha Latte, sparking citywide debate.",
  "Indie Developer game jam sets new record with 4,000 game entries worldwide.",
  "Figma releases new Typographic Layout grids, simplifying freelance product design.",
  "Modular Synthesizer prices skyrocket as synthwave music sweeps national charts.",
  "Best-selling Sci-Fi novelist Elena Rostova hints at new sequel 'Silicon Dreams 2'."
];

export const INITIAL_STATE: SimState = {
  posts: [
    {
      id: 'post_1',
      author: PERSONAS[0], // Liam
      content: MOCK_POSTS_TEMPLATE.gaming[0],
      timestamp: '5m ago',
      likes: 12,
      comments: [
        {
          id: 'c_1',
          author: PERSONAS[2], // Zara
          content: MOCK_REPLIES.zara_design[1],
          timestamp: '3m ago'
        }
      ]
    },
    {
      id: 'post_2',
      author: PERSONAS[1], // Maya
      content: MOCK_POSTS_TEMPLATE.coffee[0],
      timestamp: '15m ago',
      likes: 24,
      comments: [
        {
          id: 'c_2',
          author: PERSONAS[3], // Marcus
          content: MOCK_REPLIES.marcus_music[1],
          timestamp: '10m ago'
        }
      ]
    }
  ],
  trending: ['#refactoring', '#matcha', '#design', '#modularsynth', '#cyberpunk'],
  news: NEWS_FLASHES[0],
  speed: 15,
  apiUrl: 'http://localhost:11434'
};

// Generates a completely new, realistic post from a random persona
export function generateRandomPost(state: SimState): Post {
  const author = PERSONAS[Math.floor(Math.random() * PERSONAS.length)];
  
  // Pick matching category based on author interests
  const topic = author.interestTopics[Math.floor(Math.random() * author.interestTopics.length)];
  const templates = MOCK_POSTS_TEMPLATE[topic] || MOCK_POSTS_TEMPLATE.gaming;
  const content = templates[Math.floor(Math.random() * templates.length)];
  
  return {
    id: `post_${Math.random().toString(36).substr(2, 9)}`,
    author,
    content,
    timestamp: 'Just now',
    likes: Math.floor(Math.random() * 8),
    comments: []
  };
}

// Generate an AI reply to a specific post
export function generateRandomComment(post: Post): Comment {
  // Find a persona that is NOT the post author
  const responders = PERSONAS.filter(p => p.id !== post.author.id);
  const author = responders[Math.floor(Math.random() * responders.length)];
  
  const replies = MOCK_REPLIES[author.id] || MOCK_REPLIES.liam_dev;
  const content = replies[Math.floor(Math.random() * replies.length)];

  return {
    id: `comm_${Math.random().toString(36).substr(2, 9)}`,
    author,
    content,
    timestamp: 'Just now'
  };
}

// Handle real-time generation using Ollama/LM Studio if active, or elegant template fallbacks
export async function generateAILifeCycle(
  state: SimState,
  onNewPost: (p: Post) => void,
  onNewComment: (postId: string, c: Comment) => void
): Promise<void> {
  // Periodic Simulation loop
  try {
    // 60% chance to generate a new post, 40% chance to comment on an existing post
    if (Math.random() > 0.4) {
      const newPost = generateRandomPost(state);
      onNewPost(newPost);
    } else if (state.posts.length > 0) {
      const targetPost = state.posts[Math.floor(Math.random() * state.posts.length)];
      const newComment = generateRandomComment(targetPost);
      onNewComment(targetPost.id, newComment);
    }
  } catch (err) {
    console.error("Simulation run cycle failed", err);
  }
}

// Injects breaking news flashes
export function getNextNewsFlash(currentNews: string): string {
  const index = NEWS_FLASHES.indexOf(currentNews);
  const nextIndex = (index + 1) % NEWS_FLASHES.length;
  return NEWS_FLASHES[nextIndex];
}
