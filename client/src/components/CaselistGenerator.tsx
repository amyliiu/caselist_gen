'use client'

import React from 'react'
import { useState } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { DownloadIcon, UploadIcon } from 'lucide-react'
import * as XLSX from 'xlsx'

export function CaselistGeneratorComponent() {
  const [file, setFile] = useState<File | null>(null)
  const [processedData, setProcessedData] = useState<any[]>([])
  const [displayedData, setDisplayedData] = useState<any[]>([]) // For gradual display
  const [isProcessing, setIsProcessing] = useState(false) // Processing state

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFile(file)
    }
  }

  const processFile = () => {
    if (!file) return;

    setIsProcessing(true); // Set processing state to true

    const reader = new FileReader()
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const json = XLSX.utils.sheet_to_json(worksheet)

      const teams: any[] = []
      
      // Process each row of the sheet
      json.forEach((row: any) => {
        teams.push({ team: row['team'], school: row['school'] }); // Push team and school
      })

      setProcessedData(teams)

      // Call the scraping function and process 1ACs for each team
      const { scrapeTeams } = require('./scrape.js');

      try {
        const scrapedData = await scrapeTeams(teams); // Pass teams to scraping function
        displayTeamsGradually(scrapedData);
      } catch (err: any) {
        console.error('Scraping error:', err.message, err.stack);
      } finally {
        setIsProcessing(false); // Processing is done
      }
    }

    reader.readAsArrayBuffer(file);
  }

  // Function to display teams and 1ACs gradually
  const displayTeamsGradually = async (teams: any[]) => {
    for (let i = 0; i < teams.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay of 1 second
      setDisplayedData((prev) => [...prev, teams[i]]);
    }
  }

  const downloadProcessedFile = () => {
    const worksheet = XLSX.utils.json_to_sheet(processedData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Processed Caselist')
    XLSX.writeFile(workbook, 'processed_caselist.xlsx')
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Caselist Generator</CardTitle>
          <CardDescription>Upload a spreadsheet of a Tabroom Tournament to generate a caselist</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file-upload">Upload Spreadsheet</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
              />
            </div>
            <Button onClick={processFile} disabled={!file || isProcessing}>
              <UploadIcon className="mr-2 h-4 w-4" />
              {isProcessing ? "Processing..." : "Process Spreadsheet"}
            </Button>
          </div>

          {displayedData.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Processed Data Preview</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Team Name</TableHead>
                      <TableHead>School</TableHead>
                      <TableHead>1AC</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.team}</TableCell>
                        <TableCell>{row.school}</TableCell>
                        <TableCell>{row.oneAC}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}