"use client";

import React, { useState, useRef, type ChangeEvent } from 'react';
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Student, Teacher } from '@/types';
import { UploadCloud, FileCheck2, AlertTriangle } from 'lucide-react';

interface UploadFormProps {
  onDataUpload: (teachers: Teacher[], students: Student[]) => void;
}

export function UploadForm({ onDataUpload }: UploadFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsUploading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error("Dosya okunamadı.");

        const workbook = XLSX.read(data, { type: 'array' });

        // Process Teachers sheet
        const teacherSheetName = workbook.SheetNames.find(name => name.toLowerCase().includes('öğretmen'));
        if (!teacherSheetName) throw new Error("Excel dosyasında 'Öğretmenler' sayfası bulunamadı.");
        const teacherSheet = workbook.Sheets[teacherSheetName];
        const teacherJson = XLSX.utils.sheet_to_json<any>(teacherSheet);

        const teachers: Teacher[] = teacherJson.map((row: any, index: number) => {
          const teacherId = row['Öğretmen ID'] ?? row['ID'] ?? row['id'] ?? index + 1; // Check common ID headers or use index
          const teacherName = row['Öğretmen Adı'] ?? row['Ad Soyad'] ?? row['Name'];

          if (!teacherId || !teacherName) {
            throw new Error(`Öğretmenler sayfasının ${index + 2}. satırında eksik ID veya Ad bilgisi var.`);
          }
          return { id: Number(teacherId), name: String(teacherName) };
        });

        // Process Students sheet
        const studentSheetName = workbook.SheetNames.find(name => name.toLowerCase().includes('öğrenci'));
         if (!studentSheetName) throw new Error("Excel dosyasında 'Öğrenciler' sayfası bulunamadı.");
        const studentSheet = workbook.Sheets[studentSheetName];
        const studentJson = XLSX.utils.sheet_to_json<any>(studentSheet);

        const students: Student[] = studentJson.map((row: any, index: number) => {
          const studentId = row['Öğrenci ID'] ?? row['ID'] ?? row['id'] ?? index + 1; // Check common ID headers or use index
          const studentName = row['Öğrenci Adı'] ?? row['Ad Soyad'] ?? row['Name'];
          const teacherId = row['Öğretmen ID'] ?? row['Teacher ID'];
          const renewedStatus = row['Kayıt Yeniledi'] ?? row['Yeniledi'] ?? row['Renewed']; // Check common renewal headers

           if (!studentId || !studentName || teacherId === undefined) {
              throw new Error(`Öğrenciler sayfasının ${index + 2}. satırında eksik ID, Ad veya Öğretmen ID bilgisi var.`);
          }

          // Ensure teacher exists
           if (!teachers.some(t => t.id === Number(teacherId))) {
             throw new Error(`Öğrenciler sayfasının ${index + 2}. satırındaki Öğretmen ID (${teacherId}) Öğretmenler listesinde bulunamadı.`);
           }

           // Interpret renewal status (handle various truthy/falsy inputs)
           let renewed = false;
           if (renewedStatus !== undefined && renewedStatus !== null) {
                const lowerStatus = String(renewedStatus).toLowerCase().trim();
                renewed = ['true', 'evet', 'yeniledi', '1', 'yes', 'x', '✓'].includes(lowerStatus);
           }


          return {
            id: Number(studentId),
            name: String(studentName),
            teacherId: Number(teacherId),
            renewed: renewed,
          };
        });

        onDataUpload(teachers, students);
        toast({
          title: "Başarılı!",
          description: `${teachers.length} öğretmen ve ${students.length} öğrenci verisi başarıyla yüklendi.`,
          variant: "default", // Use default (blue) for success as accent is green
          action: <FileCheck2 className="h-5 w-5 text-primary" />,
        });
        setError(null);

      } catch (err: any) {
        console.error("Excel işleme hatası:", err);
        const errorMessage = err.message || "Excel dosyası işlenirken bilinmeyen bir hata oluştu. Lütfen dosya formatını kontrol edin (Sütunlar: Öğretmen ID, Öğretmen Adı | Öğrenci ID, Öğrenci Adı, Öğretmen ID, Kayıt Yeniledi).";
        setError(errorMessage);
        setFileName(null); // Reset file name on error
        onDataUpload([], []); // Clear existing data on error
        toast({
          title: "Yükleme Başarısız!",
          description: errorMessage,
          variant: "destructive",
           action: <AlertTriangle className="h-5 w-5" />,
        });
      } finally {
        setIsUploading(false);
         // Reset file input to allow re-uploading the same file
         if (fileInputRef.current) {
            fileInputRef.current.value = '';
         }
      }
    };
    reader.onerror = () => {
        setError("Dosya okuma sırasında bir hata oluştu.");
        setIsUploading(false);
        setFileName(null);
         if (fileInputRef.current) {
            fileInputRef.current.value = '';
         }
    };
    reader.readAsArrayBuffer(file);
  };

   const triggerFileInput = () => {
     fileInputRef.current?.click();
   };

  return (
    <div className="flex flex-col items-start space-y-2">
       <Label htmlFor="excel-upload" className="sr-only">Excel Dosyası Yükle</Label>
       <Input
        id="excel-upload"
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileChange}
        className="hidden" // Hide the default input
        ref={fileInputRef}
        disabled={isUploading}
      />
       <Button onClick={triggerFileInput} disabled={isUploading} variant="outline" className="w-full md:w-auto">
        {isUploading ? (
            <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Yükleniyor...
            </>
        ) : (
            <>
               <UploadCloud className="mr-2 h-4 w-4" />
               {fileName ? `Dosya Seçildi: ${fileName.substring(0, 20)}...` : "Excel Yükle (.xlsx, .xls)"}
            </>
        )}
       </Button>
       {error && <p className="text-sm text-destructive mt-1">{error}</p>}
        <p className="text-xs text-muted-foreground mt-1">
          Format: Öğretmenler (ID, Ad), Öğrenciler (ID, Ad, Öğretmen ID, Kayıt Yeniledi [Evet/Hayır/1/0/Boş])
       </p>
    </div>
  );
}
