'use client'

import React, { useState } from 'react'

interface CaselistGeneratorProps {
  onFileUpload: (uploadedFile: File) => void;
}

export function CaselistGeneratorComponent({ onFileUpload }: CaselistGeneratorProps) {
  const [codes, setCodes] = useState([])
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      onFileUpload(selectedFile);
    }
  };

  const handleProcessSpreadsheet = async () => {
    if (!file) {
      console.error('No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

      try {
        const response = await fetch('http://localhost:5001/upload', {
          method: 'POST',
          body: formData,
        });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Processed data:', data);
      setCodes(data.codes);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

}