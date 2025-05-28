
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
import { ArrowLeft, LogOut, Download, ListX } from 'lucide-react';
import { LoginForm } from '@/components/login-form';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { getStudents, getTeachers, uploadStudentsAndTeachers, updateStudentRenewal, bulkUpdateStudentRenewals } from '@/services/firestoreService';

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
    if (typeof window !== 'undefined') {
      const rememberedAuth = localStorage.getItem('isAdminAuthenticated');
      if (rememberedAuth === 'true') {
        setIsAuthenticated(true);
      } else {
        const sessionAuth = sessionStorage.getItem('isAdminAuthenticated');
        setIsAuthenticated(sessionAuth === 'true');
      }
      setIsAuthCheckComplete(true);
    } else {
      // Fallback for non-browser environments, though this page is client-side
      setIsAuthenticated(false);
      setIsAuthCheckComplete(true);
    }
  }, []);

  useEffect(() => {
    console.log("[AdminPage] Students state updated:", students);
  }, [students]);

  useEffect(() => {
    async function loadDataFromFirestore() {
      if (isAuthCheckComplete && isAuthenticated) {
        setIsLoading(true);
        setError(null);
        console.log("[AdminPage] Attempting to load data from Firestore...");
        try {
          const [fetchedStudents, fetchedTeachers] = await Promise.all([
            getStudents(),
            getTeachers()
          ]);
          console.log(`[AdminPage] Data fetched from Firestore - Students: ${fetchedStudents.length}, Teachers: ${fetchedTeachers.length}`);
          setStudents(fetchedStudents);
          setTeachers(fetchedTeachers);
        } catch (err: any) {
          console.error("[AdminPage] Error loading data from Firestore:", err);
          setError(err.message || "Veriler Firestore'dan yüklenirken bir hata oluştu.");
          setStudents([]);
          setTeachers([]);
          toast({
            title: "Veri Yükleme Hatası!",
            description: err.message || "Veriler Firestore'dan yüklenemedi. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.",
            variant: "destructive",
            duration: 7000,
          });
        } finally {
          setIsLoading(false);
        }
      } else if (isAuthCheckComplete && !isAuthenticated) {
        console.log("[AdminPage] Not authenticated or auth check not complete, clearing data.");
        setTeachers([]);
        setStudents([]);
        setIsLoading(false);
      }
    }
    loadDataFromFirestore();
  }, [isAuthenticated, isAuthCheckComplete]); // Removed toast from dependencies

  const handleDataUpload = async (uploadedTeachers: Teacher[], uploadedStudents: Student[]) => {
    setIsLoading(true);
    console.log("[AdminPage] Data received from UploadForm - Students:", uploadedStudents.length, "Teachers:", uploadedTeachers.length);
    if (uploadedStudents.length > 0) {
      console.log("[AdminPage] Sample student from upload:", uploadedStudents[0]);
    }

    try {
      await uploadStudentsAndTeachers(uploadedStudents, uploadedTeachers);
      console.log("[AdminPage] Firestore upload successful.");
      setTeachers(uploadedTeachers);
      setStudents(uploadedStudents);
      setGlobalSearchTerm('');
      setError(null);
      toast({
        title: "Başarılı!",
        description: `Firestore'a ${uploadedStudents.length} öğrenci ve ${uploadedTeachers.length} öğretmen başarıyla yüklendi.`,
        variant: "default",
      });
    } catch (err: any) {
      console.error("[AdminPage] Error in handleDataUpload:", err);
      setError(err.message || "Veriler Firestore'a yüklenirken bir hata oluştu.");
      toast({
        title: "Yükleme Başarısız!",
        description: err.message || "Veriler Firestore'a yüklenemedi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenewalToggle = async (studentId: number) => {
    const originalStudents = [...students];
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.id === studentId ? { ...student, renewed: !student.renewed } : student
      )
    );
    try {
      const studentToUpdate = originalStudents.find(s => s.id === studentId);
      if (studentToUpdate) {
        await updateStudentRenewal(studentId, !studentToUpdate.renewed);
      }
    } catch (err: any)
{
      console.error("[AdminPage] Error updating student renewal in Firestore:", err);
      setError(err.message || "Öğrenci kayıt durumu güncellenirken bir hata oluştu.");
      setStudents(originalStudents);
      toast({
        title: "Güncelleme Başarısız!",
        description: err.message || "Öğrenci kayıt durumu güncellenemedi.",
        variant: "destructive",
      });
    }
  };

  const handleBulkRenewalToggle = async (studentIdsToUpdate: number[], newRenewedState: boolean) => {
    const originalStudents = [...students];
    setStudents(prevStudents =>
      prevStudents.map(student =>
        studentIdsToUpdate.includes(student.id) ? { ...student, renewed: newRenewedState } : student
      )
    );
    try {
      await bulkUpdateStudentRenewals(studentIdsToUpdate, newRenewedState);
      toast({
        title: "Başarılı!",
        description: `${studentIdsToUpdate.length} öğrencinin kayıt durumu güncellendi.`,
        variant: "default",
      });
    } catch (err: any) {
      console.error("[AdminPage] Error bulk updating student renewals in Firestore:", err);
      setError(err.message || "Öğrenci kayıt durumları toplu güncellenirken bir hata oluştu.");
      setStudents(originalStudents);
      toast({
        title: "Toplu Güncelleme Başarısız!",
        description: err.message || "Öğrenci kayıt durumları toplu güncellenemedi.",
        variant: "destructive",
      });
    }
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
      const studentsToExport = students.map(s => ({
        'Öğrenci ID': s.id,
        'Öğrenci Adı': s.name,
        'Sınıf': s.className,
        'Öğretmen Adı': s.teacherName,
        'Kayıt Yeniledi': s.renewed ? 'Evet' : 'Hayır',
      }));

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
            data-ai-hint="logo school"
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
            <CardDescription>Öğretmen ve öğrenci listelerini içeren Excel dosyasını yükleyin. Bu işlem Firestore'daki mevcut verilerin üzerine yazacaktır.</CardDescription>
          </CardHeader>
          <CardContent>
            <UploadForm onDataUpload={handleDataUpload} />
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
          <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <CardTitle>Kayıt Yenileme Yönetimi</CardTitle>
              <CardDescription>Öğrencilerin kayıt yenileme durumlarını buradan güncelleyebilirsiniz. Değişiklikler Firestore'a kaydedilecektir.</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Link href="/admin/not-renewed" passHref legacyBehavior>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <ListX className="mr-2 h-4 w-4" />
                  Kayıt Yenilemeyenler
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleDownloadCurrentData} disabled={isLoading || (students.length === 0 && teachers.length === 0)} className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Güncel Listeyi İndir
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Label htmlFor="global-student-search" className="text-base font-semibold">Tüm Öğrencilerde Ara</Label>
              <Input
                id="global-student-search"
                type="text"
                placeholder="Öğrenci adıyla tüm listede ara..."
                value={globalSearchTerm}
                onChange={(e) => setGlobalSearchTerm(e.target.value)}
                className="mt-2 text-base h-11"
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
              teachers.length > 0 || students.length > 0 || globalSearchTerm ? (
                <TeacherDetails
                  teachers={teachers}
                  students={displayStudentsForTeacherDetails}
                  allStudents={students}
                  onRenewalToggle={handleRenewalToggle}
                  onBulkRenewalToggle={handleBulkRenewalToggle}
                  isAdminView={true}
                />
              ) : (
                <p className="text-muted-foreground text-center py-4">Yönetmek için lütfen önce Excel dosyasını yükleyin veya Firestore'da veri olduğundan emin olun.</p>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
