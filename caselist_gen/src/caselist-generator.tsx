'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DownloadIcon, UploadIcon } from 'lucide-react'
import * as XLSX from 'xlsx'

export function CaselistGeneratorComponent() {
  const [file, setFile] = useState<File | null>(null)
  const [processedData, setProcessedData] = useState<any[]>([])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFile(file)
    }
  }

  const processFile = () => {
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const json = XLSX.utils.sheet_to_json(worksheet)

      const processedData = json.map((row: any) => ({
        ...row,
        affCases: generateMockCases('aff'),
        negCases: generateMockCases('neg')
      }))

      setProcessedData(processedData)
    }
    reader.readAsArrayBuffer(file)
  }

  const generateMockCases = (type: 'aff' | 'neg') => {
    const affCases = [
      "Climate Change Mitigation",
      "Universal Basic Income",
      "Renewable Energy Transition",
      "Education Reform"
    ]
    const negCases = [
      "Economic Impact Disadvantage",
      "Federalism Counterplan",
      "Spending Tradeoff Kritik",
      "States Counterplan"
    ]
    return type === 'aff' ? affCases.join(', ') : negCases.join(', ')
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
          <CardDescription>Upload a spreadsheet of team names and schools to generate a caselist</CardDescription>
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
            <Button onClick={processFile} disabled={!file}>
              <UploadIcon className="mr-2 h-4 w-4" />
              Process Spreadsheet
            </Button>
          </div>

          {processedData.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Processed Data Preview</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Team Name</TableHead>
                      <TableHead>School</TableHead>
                      <TableHead>Affirmative Cases</TableHead>
                      <TableHead>Negative Cases</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedData.slice(0, 5).map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row['Team Name']}</TableCell>
                        <TableCell>{row['School']}</TableCell>
                        <TableCell>{row.affCases}</TableCell>
                        <TableCell>{row.negCases}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4">
                <Button onClick={downloadProcessedFile}>
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  Download Processed Spreadsheet
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}