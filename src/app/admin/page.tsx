
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import type { Student, Teacher } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadForm } from '@/components/upload-form';
import { TeacherDetails } from '@/components/teacher-details';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, LogOut, Download } from 'lucide-react';
import { LoginForm } from '@/components/login-form';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';

export default function AdminPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const rememberedAuth = localStorage.getItem('isAdminAuthenticated');
        if (rememberedAuth === 'true') {
          setIsAuthenticated(true);
        } else {
          const sessionAuth = sessionStorage.getItem('isAdminAuthenticated');
          setIsAuthenticated(sessionAuth === 'true');
        }
      }
      setIsAuthCheckComplete(true);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthCheckComplete && isAuthenticated && typeof window !== 'undefined') {
      setIsLoading(true);
      setError(null);
      try {
        const storedTeachers = localStorage.getItem('teachers');
        const storedStudents = localStorage.getItem('students');

        if (storedTeachers && storedStudents) {
          const parsedTeachers: Teacher[] = JSON.parse(storedTeachers);
          const parsedStudents: Student[] = JSON.parse(storedStudents);
          if (Array.isArray(parsedTeachers) && Array.isArray(parsedStudents)) {
            setTeachers(parsedTeachers);
            setStudents(parsedStudents);
          } else {
            console.warn("Invalid data found in localStorage, resetting.");
            localStorage.removeItem('teachers');
            localStorage.removeItem('students');
            setTeachers([]);
            setStudents([]);
            setError("Yerel depoda geçersiz veri bulundu, veriler sıfırlandı.");
          }
        } else {
          setTeachers([]);
          setStudents([]);
        }
      } catch (e) {
        console.error("Failed to load data from localStorage:", e);
        localStorage.removeItem('teachers');
        localStorage.removeItem('students');
        setTeachers([]);
        setStudents([]);
        setError("Yerel depodan veri yüklenirken bir hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    } else if (isAuthCheckComplete && !isAuthenticated) {
      setTeachers([]);
      setStudents([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, isAuthCheckComplete]);

  useEffect(() => {
    if (isAuthenticated && typeof window !== 'undefined' && !isLoading && isAuthCheckComplete) {
      try {
        if (teachers.length > 0 || students.length > 0) {
            localStorage.setItem('teachers', JSON.stringify(teachers));
            localStorage.setItem('students', JSON.stringify(students));
        } else {
             localStorage.removeItem('teachers');
             localStorage.removeItem('students');
        }
      } catch (e) {
        console.error("Failed to save data to localStorage:", e);
        setError("Veriler yerel depoya kaydedilemedi.");
      }
    }
  }, [teachers, students, isLoading, isAuthenticated, isAuthCheckComplete]);

  const handleDataUpload = (uploadedTeachers: Teacher[], uploadedStudents: Student[]) => {
    setTeachers(uploadedTeachers);
    setStudents(uploadedStudents);
    setGlobalSearchTerm(''); // Reset global search on new data upload
    setError(null);
  };

  const handleRenewalToggle = (studentId: number) => {
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.id === studentId ? { ...student, renewed: !student.renewed } : student
      )
    );
  };

  const handleBulkRenewalToggle = (studentIdsToUpdate: number[], newRenewedState: boolean) => {
    setStudents(prevStudents =>
      prevStudents.map(student =>
        studentIdsToUpdate.includes(student.id) ? { ...student, renewed: newRenewedState } : student
      )
    );
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setError(null);
  };

   const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('isAdminAuthenticated');
      localStorage.removeItem('isAdminAuthenticated');
    }
    setTeachers([]);
    setStudents([]);
    setError(null);
    setIsLoading(false);
  };

  const handleDownloadCurrentData = () => {
    if (students.length === 0 && teachers.length === 0) {
      toast({
        title: "Veri Yok",
        description: "İndirilecek öğrenci veya öğretmen verisi bulunmuyor.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Prepare student data
      const studentsToExport = students.map(s => ({
        'Öğrenci ID': s.id,
        'Öğrenci Adı': s.name,
        'Sınıf': s.className,
        'Öğretmen Adı': s.teacherName,
        'Kayıt Yeniledi': s.renewed ? 'Evet' : 'Hayır',
      }));

      // Prepare teacher data
      const teachersToExport = teachers.map(t => ({
        'Öğretmen ID': t.id,
        'Öğretmen Adı': t.name,
      }));

      const studentSheet = XLSX.utils.json_to_sheet(studentsToExport);
      const teacherSheet = XLSX.utils.json_to_sheet(teachersToExport);

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, studentSheet, 'Öğrenciler');
      XLSX.utils.book_append_sheet(workbook, teacherSheet, 'Öğretmenler');

      XLSX.writeFile(workbook, 'Guncel_Kayit_Listesi.xlsx');

      toast({
        title: "Başarılı!",
        description: "Güncel öğrenci ve öğretmen listesi indirildi.",
        variant: "default",
      });
    } catch (err) {
      console.error("Excel oluşturma hatası:", err);
      toast({
        title: "Hata!",
        description: "Excel dosyası oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const displayStudentsForTeacherDetails = useMemo(() => {
    if (!globalSearchTerm) return students;
    return students.filter(s => s.name.toLowerCase().includes(globalSearchTerm.toLowerCase()));
  }, [students, globalSearchTerm]);

  if (!isAuthCheckComplete) {
      return (
          <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
              <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
          </div>
      );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary p-4 md:p-8">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
             <Image
               src="/vildan_star_logo.png"
               alt="Vildan Koleji Logo"
               width={40}
               height={40}
               className="rounded-full object-cover"
             />
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            Kayıt <span className="text-vildan-burgundy">Takip</span> - Admin Paneli
          </h1>
        </div>
         <div className="flex items-center gap-2">
             <Link href="/" passHref legacyBehavior>
                <Button variant="outline" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Ana Sayfaya Dön
                </Button>
             </Link>
             <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Çıkış Yap
             </Button>
         </div>
      </header>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md mb-6" role="alert">
          <p className="font-medium">Hata!</p>
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
          <CardHeader>
            <CardTitle>Veri Yükleme</CardTitle>
            <CardDescription>Öğretmen ve öğrenci listelerini içeren Excel dosyasını yükleyin veya güncel verileri indirin.</CardDescription>
          </CardHeader>
          <CardContent>
            <UploadForm onDataUpload={handleDataUpload} />
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>Kayıt Yenileme Yönetimi</CardTitle>
              <CardDescription>Öğrencilerin kayıt yenileme durumlarını buradan güncelleyebilirsiniz.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleDownloadCurrentData} disabled={isLoading || (students.length === 0 && teachers.length === 0)}>
              <Download className="mr-2 h-4 w-4" />
              Güncel Listeyi İndir
            </Button>
          </CardHeader>
          <CardContent>
            <div className="mb-6"> {/* Increased bottom margin for spacing */}
              <Label htmlFor="global-student-search" className="text-base font-semibold">Tüm Öğrencilerde Ara</Label> {/* Made label bolder and larger */}
              <Input
                id="global-student-search"
                type="text"
                placeholder="Öğrenci adıyla tüm listede ara..."
                value={globalSearchTerm}
                onChange={(e) => setGlobalSearchTerm(e.target.value)}
                className="mt-2 text-base h-11" /* Increased input size */
              />
            </div>
            {isLoading ? (
              <div className="space-y-4 p-4">
                 <Skeleton className="h-10 w-1/3 mb-4" />
                 <Skeleton className="h-8 w-full mb-2" />
                 <Skeleton className="h-10 w-full mb-2" />
                 <Skeleton className="h-10 w-full mb-2" />
                 <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              teachers.length > 0 || students.length > 0 || globalSearchTerm ? ( // Allow rendering TeacherDetails if there's a search term even if no initial data
                <TeacherDetails
                  teachers={teachers}
                  students={displayStudentsForTeacherDetails} 
                  allStudents={students} 
                  onRenewalToggle={handleRenewalToggle}
                  onBulkRenewalToggle={handleBulkRenewalToggle}
                  isAdminView={true}
                />
              ) : (
                 <p className="text-muted-foreground text-center py-4">Yönetmek için lütfen önce Excel dosyasını yükleyin.</p>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
