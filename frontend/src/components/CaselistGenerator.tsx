'use client'

import React, { useState } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"

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


  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Caselist Generator</CardTitle>
          <CardDescription>Upload a spreadsheet of competing teams and schools from a Tabroom Tournament to generate a caselist</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file-upload">Upload Spreadsheet</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileChange}
              />
            </div>
            <Button onClick={handleProcessSpreadsheet}>Process Spreadsheet</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}