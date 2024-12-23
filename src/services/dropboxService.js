export const DROPBOX_CONFIG = {
    appKey: "6uf931i662aoh96"
};

class DropboxService {
  constructor() {
    this.loadDropboxChooser();
  }

  loadDropboxChooser() {
    return new Promise((resolve, reject) => {
      if (window.Dropbox) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://www.dropbox.com/static/api/2/dropins.js';
      script.id = 'dropboxjs';
      script.setAttribute('data-app-key', DROPBOX_CONFIG.appKey);
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Dropbox Chooser'));
      
      document.head.appendChild(script);
    });
  }

  async uploadFiles(files) {
    try {
      // Ensure Dropbox is loaded
      await this.loadDropboxChooser();

      return new Promise((resolve, reject) => {
        const options = {
          files: files.map(file => ({
            filename: file.filename,
            // Convert content to base64 to create a data URL
            url: `data:text/plain;base64,${btoa(unescape(encodeURIComponent(file.contents)))}`
          })),
          success: () => {
            resolve({
              success: true,
              message: 'Files successfully saved to Dropbox'
            });
          },
          error: (error) => {
            console.error('Dropbox save error:', error);
            reject(new Error('Failed to save files to Dropbox'));
          },
          progress: (progress) => {
            console.log('Upload progress:', progress);
          }
        };

        window.Dropbox.save(options);
      });
    } catch (error) {
      console.error('Error in uploadFiles:', error);
      throw error;
    }
  }
}

export const dropboxService = new DropboxService();