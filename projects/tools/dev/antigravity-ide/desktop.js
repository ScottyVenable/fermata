import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow;
let wss;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'Antigravity IDE 2.0',
    backgroundColor: '#0a0a0b',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  // Load standard Vite local URL when running dev, or production dist index.html
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(join(__dirname, 'dist', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Start local sync server on port 3001
function startSyncServer() {
  const server = createServer();
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    console.log('Mobile Companion paired!');
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        
        // Handle remote commands from mobile companion
        if (data.type === 'remote_prompt') {
          // Send to active electron window to run agent loop
          mainWindow.webContents.send('execute_agent_prompt', data.prompt);
        }
      } catch (err) {
        console.error(err);
      }
    });

    ws.send(JSON.stringify({ type: 'sync_welcome', status: 'connected' }));
  });

  server.listen(3001, () => {
    console.log('Workspace Sync host online on port 3001');
  });
}

app.whenReady().then(() => {
  createWindow();
  startSyncServer();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
