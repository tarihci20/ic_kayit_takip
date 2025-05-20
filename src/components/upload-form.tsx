
"use client";

import React, { useState, useRef, type ChangeEvent } from 'react';
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Student, Teacher } from '@/types';
import { UploadCloud, FileCheck2, AlertTriangle, Download } from 'lucide-react';
import { cn } from "@/lib/utils";

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
        if (!teacherSheetName) throw new Error("Excel dosyasında 'Öğretmenler' adlı bir sayfa bulunamadı. Lütfen sayfa adını kontrol edin.");
        const teacherSheet = workbook.Sheets[teacherSheetName];
        const teacherJson = XLSX.utils.sheet_to_json<any>(teacherSheet, { defval: null });

        const teachers: Teacher[] = teacherJson.map((row: any, index: number) => {
          const teacherId = row['Öğretmen ID'] ?? row['Ogretmen ID'] ?? row['Teacher ID'] ?? row['ID'] ?? row['id'];
          const teacherName = row['Öğretmen Adı'] ?? row['Ogretmen Adi'] ?? row['Teacher Name'] ?? row['Ad Soyad'] ?? row['Name'];

          if (teacherId === null || teacherName === null) {
              console.warn(`Öğretmenler ${index + 2}. satırda eksik ID veya Ad:`, row);
              throw new Error(`Öğretmenler sayfasının ${index + 2}. satırında 'Öğretmen ID' veya 'Öğretmen Adı' sütunları eksik veya boş.`);
          }
          const parsedTeacherId = Number(teacherId);
          if (isNaN(parsedTeacherId)) {
             throw new Error(`Öğretmenler sayfasının ${index + 2}. satırındaki 'Öğretmen ID' (${teacherId}) geçerli bir sayı değil.`);
          }
          return { id: parsedTeacherId, name: String(teacherName).trim() };
        });

        const teacherNamesSet = new Set(teachers.map(t => t.name));

        // Process Students sheet
        const studentSheetName = workbook.SheetNames.find(name => name.toLowerCase().includes('öğrenci'));
         if (!studentSheetName) throw new Error("Excel dosyasında 'Öğrenciler' adlı bir sayfa bulunamadı. Lütfen sayfa adını kontrol edin.");
        const studentSheet = workbook.Sheets[studentSheetName];
        const studentJson = XLSX.utils.sheet_to_json<any>(studentSheet, { defval: null });

        const students: Student[] = studentJson.map((row: any, index: number) => {
          const studentId = row['Öğrenci ID'] ?? row['Ogrenci ID'] ?? row['Student ID'] ?? row['ID'] ?? row['id'];
          const studentName = row['Öğrenci Adı'] ?? row['Ogrenci Adi'] ?? row['Student Name'] ?? row['Ad Soyad'] ?? row['Name'];
          const teacherNameRaw = row['Öğretmen Adı'] ?? row['Ogretmen Adi'] ?? row['Teacher Name'] ?? row['Sorumlu Öğretmen'] ?? row['Sorumlu Ogretmen'];
          const renewedStatus = row['Kayıt Yeniledi'] ?? row['Kayit Yeniledi'] ?? row['Renewed'] ?? row['Yeniledi'];
          const studentClassNameRaw = row['Sınıf'] ?? row['Sınıfı'] ?? row['Sinif'] ?? row['Class'];


           if (studentId === null || studentName === null || teacherNameRaw === null) {
              console.warn(`Öğrenciler ${index + 2}. satırda eksik ID, Ad veya Öğretmen Adı:`, row);
              throw new Error(`Öğrenciler sayfasının ${index + 2}. satırında 'Öğrenci ID', 'Öğrenci Adı' veya 'Öğretmen Adı' sütunları eksik veya boş.`);
          }

           const parsedStudentId = Number(studentId);
           if (isNaN(parsedStudentId)) {
              throw new Error(`Öğrenciler sayfasının ${index + 2}. satırındaki 'Öğrenci ID' (${studentId}) geçerli bir sayı değil.`);
           }

           const teacherName = String(teacherNameRaw).trim();
           if (!teacherNamesSet.has(teacherName)) {
             throw new Error(`Öğrenciler sayfasının ${index + 2}. satırındaki Öğretmen Adı ('${teacherName}') Öğretmenler listesinde bulunamadı. İsimlerin tam olarak eşleştiğinden emin olun.`);
           }

           let renewed = false;
           if (renewedStatus !== null) {
                const lowerStatus = String(renewedStatus).toLowerCase().trim();
                renewed = ['true', 'evet', 'yeniledi', '1', 'yes', 'x', '✓', 'yapıldı', 'tamamlandı', 'ok'].includes(lowerStatus);
           }

           // Extract only the numeric part of the class name
           const numericClassName = String(studentClassNameRaw ?? '').trim().match(/^\d+/)?.[0] || '';

          return {
            id: parsedStudentId,
            name: String(studentName),
            teacherName: teacherName,
            renewed: renewed,
            className: numericClassName, // Store only the numeric part
          };
        });

        // --- Data Validation ---
        const studentIds = new Set<number>();
        for (const student of students) {
            if (studentIds.has(student.id)) {
                throw new Error(`Öğrenciler sayfasında mükerrer Öğrenci ID bulundu: ${student.id}. Lütfen kontrol edin.`);
            }
            studentIds.add(student.id);
        }
        const teacherIds = new Set<number>();
         const teacherUniqueNames = new Set<string>();
        for (const teacher of teachers) {
             if (teacherIds.has(teacher.id)) {
                 throw new Error(`Öğretmenler sayfasında mükerrer Öğretmen ID bulundu: ${teacher.id}. Lütfen kontrol edin.`);
             }
              if (teacherUniqueNames.has(teacher.name)) {
                 throw new Error(`Öğretmenler sayfasında mükerrer Öğretmen Adı bulundu: '${teacher.name}'. Lütfen kontrol edin.`);
             }
             teacherIds.add(teacher.id);
             teacherUniqueNames.add(teacher.name);
        }
        // --- End Validation ---


        onDataUpload(teachers, students);
        toast({
          title: "Başarılı!",
          description: `${teachers.length} öğretmen ve ${students.length} öğrenci verisi başarıyla yüklendi.`,
          variant: "default",
          action: <FileCheck2 className="h-5 w-5 text-primary" />,
        });
        setError(null);

      } catch (err: any) {
        console.error("Excel işleme hatası:", err);
        const errorMessage = err.message || "Excel dosyası işlenirken bilinmeyen bir hata oluştu. Lütfen dosya formatını, sayfa adlarını ('Öğretmenler', 'Öğrenciler') ve gerekli sütun başlıklarını kontrol edin.";
        setError(errorMessage);
        setFileName(null);
        onDataUpload([], []);
        toast({
          title: "Yükleme Başarısız!",
          description: errorMessage,
          variant: "destructive",
           action: <AlertTriangle className="h-5 w-5" />,
        });
      } finally {
        setIsUploading(false);
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
         toast({
           title: "Hata!",
           description: "Dosya okunamadı.",
           variant: "destructive",
           action: <AlertTriangle className="h-5 w-5" />,
         });
    };
    reader.readAsArrayBuffer(file);
  };

   const triggerFileInput = () => {
     fileInputRef.current?.click();
   };

    const handleDownloadTemplate = () => {
       try {
         // Define template data
         const teachersTemplate = [
           {'Öğretmen ID': 101, 'Öğretmen Adı': 'Ayşe Yılmaz'},
           {'Öğretmen ID': 102, 'Öğretmen Adı': 'Mehmet Öztürk'},
         ];
         const studentsTemplate = [
           {'Öğrenci ID': 1, 'Öğrenci Adı': 'Ali Veli', 'Sınıf': '5', 'Öğretmen Adı': 'Ayşe Yılmaz', 'Kayıt Yeniledi': 'Evet'},
           {'Öğrenci ID': 2, 'Öğrenci Adı': 'Fatma Kaya', 'Sınıf': '5', 'Öğretmen Adı': 'Ayşe Yılmaz', 'Kayıt Yeniledi': 'Hayır'},
           {'Öğrenci ID': 3, 'Öğrenci Adı': 'Hasan Demir', 'Sınıf': '6', 'Öğretmen Adı': 'Mehmet Öztürk', 'Kayıt Yeniledi': '1'},
           {'Öğrenci ID': 4, 'Öğrenci Adı': 'Zeynep Çelik', 'Sınıf': '6', 'Öğretmen Adı': 'Mehmet Öztürk', 'Kayıt Yeniledi': ''},
           {'Öğrenci ID': 5, 'Öğrenci Adı': 'Emre Arslan', 'Sınıf': '', 'Öğretmen Adı': 'Ayşe Yılmaz', 'Kayıt Yeniledi': 'X'},
         ];

         // Create worksheets
         const teacherWs = XLSX.utils.json_to_sheet(teachersTemplate);
         const studentWs = XLSX.utils.json_to_sheet(studentsTemplate);

         // Create workbook
         const wb = XLSX.utils.book_new();
         XLSX.utils.book_append_sheet(wb, teacherWs, 'Öğretmenler');
         XLSX.utils.book_append_sheet(wb, studentWs, 'Öğrenciler');

         XLSX.writeFile(wb, 'VildanKoleji_KayitYenileme_Sablon.xlsx');

         toast({
           title: 'Şablon İndirildi',
           description: 'Excel şablonu başarıyla oluşturuldu ve indirildi.',
           variant: 'default',
         });
       } catch (error) {
         console.error('Şablon oluşturma hatası:', error);
         toast({
           title: 'Hata!',
           description: 'Şablon oluşturulurken bir hata oluştu.',
           variant: 'destructive',
         });
       }
     };


  return (
    <div className="flex flex-col items-start space-y-2 w-full md:w-auto">
       <Label htmlFor="excel-upload" className="sr-only">Excel Dosyası Yükle</Label>
       <Input
        id="excel-upload"
        type="file"
        accept=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
        disabled={isUploading}
      />
      <div className="flex flex-col sm:flex-row gap-2 w-full ">
        <Button onClick={triggerFileInput} disabled={isUploading} variant="outline" className="flex-grow sm:flex-grow-0">
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
                 {fileName ? `Dosya: ${fileName.substring(0, 25)}${fileName.length > 25 ? '...' : ''}` : "Excel Yükle"}
              </>
          )}
        </Button>
         <Button onClick={handleDownloadTemplate} variant="secondary">
           <Download className="mr-2 h-4 w-4" />
           Şablonu İndir
         </Button>
      </div>

       {error && <p className="text-sm text-destructive mt-1">{error}</p>}
        <p className="text-xs text-muted-foreground mt-1 max-w-md">
           Excel'de 'Öğretmenler' ve 'Öğrenciler' adında iki sayfa olmalıdır. Gerekli sütunlar: Öğretmenler(<b>Öğretmen ID, Öğretmen Adı</b>), Öğrenciler(<b>Öğrenci ID, Öğrenci Adı, Sınıf, Öğretmen Adı, Kayıt Yeniledi</b>). 'Sınıf' sütununa sadece sınıf seviyesini (örn: 5, 6, 7, 8) giriniz. '5-A' gibi girişler '5' olarak kabul edilecektir. Öğrencinin öğretmenini belirtmek için 'Öğretmen Adı' sütununu kullanın. Yenileme durumu için 'Evet', '1', 'X', '✓' vb. kullanabilirsiniz. Boş veya 'Hayır', '0' vb. yenilenmemiş sayılır.
       </p>

    </div>
  );
}

    