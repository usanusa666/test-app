const { contextBridge } = require('electron');

// Expose the API key from the main process's environment variables to the renderer process.
// This is a secure way to handle secrets without exposing all of `process.env`.
contextBridge.exposeInMainWorld('electron', {
  apiKey: process.env.API_KEY,
});
