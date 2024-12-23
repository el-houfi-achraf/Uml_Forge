import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Snackbar,
  Alert,
  CircularProgress
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { dropboxService } from '../../services/dropboxService';

function CodePreviewDialog({ open, onClose, code, filename }) {
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  const splitCodeIntoClasses = (code) => {
    //return code.split(/(?=class\s|interface\s|enum\s|abstract\sclass\s)/g);
    return code.split(/(# Class|\/\* Class \*\/)/g);
  };

  const extractName = (classCode) => {
    const match = classCode.match(/(.*class|.*interface|.*enum|.*abstract\sclass)\s+(\w+)/);
    return match ? match[2] : 'unknown';
  };

  const getFileExtension = () => {
    if (filename.match(/.*\.php$/)) return '.php';
    if (filename.match(/.*\.java$/)) return '.java';
    if (filename.match(/.*\.py$/)) return '.py';
    return '.txt';
  };

  const handleDropboxUpload = async () => {
    try {
      setUploading(true);
      const classes = splitCodeIntoClasses(code);
      const extension = getFileExtension();
      
      // Prepare files array for Dropbox
      const files = classes
        .map(classCode => {
          const className = extractName(classCode);
          if (className === 'unknown') return null;
          
          // Add proper line endings and formatting
          const formattedCode = classCode.trim() + '\n';
          
          return {
            filename: `${className}${extension}`,
            contents: formattedCode
          };
        })
        .filter(Boolean); // Remove null entries

      if (files.length === 0) {
        throw new Error('No valid files to upload');
      }

      const result = await dropboxService.uploadFiles(files);
      
      setNotification({
        open: true,
        message: result.message,
        severity: 'success'
      });
    } catch (error) {
      console.error('Upload failed:', error);
      setNotification({
        open: true,
        message: error.message || 'Failed to upload files to Dropbox',
        severity: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = () => {
    const classes = splitCodeIntoClasses(code);
    const extension = getFileExtension();

    classes.forEach((classCode) => {
      const className = extractName(classCode);
      if (className !== "unknown") {
        const blob = new Blob([classCode], { type: "text/plain" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${className}${extension}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Code Preview - {filename}</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            backgroundColor: "#f5f5f5",
            padding: 2,
            borderRadius: 1,
            maxHeight: "60vh",
            overflow: "auto",
          }}
        >
          {splitCodeIntoClasses(code).map((classCode, index) => (
            <pre key={index} style={{ margin: 0, whiteSpace: "pre-wrap", marginBottom: "16px" }}>
              <code>{classCode}</code>
            </pre>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
          onClick={handleDropboxUpload}
          variant="contained"
          color="secondary"
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Save to Dropbox'}
        </Button>
        <Button
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          variant="contained"
          color="primary"
        >
          Download
        </Button>
      </DialogActions>

      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}

export default CodePreviewDialog;
