
"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import type { Student, Teacher } from '@/types';
import { TeacherDetails } from '@/components/teacher-details';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getStudents, getTeachers } from '@/services/firestoreService';
import { useToast } from '@/hooks/use-toast';

export default function TeacherDetailPage() {
  const params = useParams();
  const teacherNameParam = params?.teacherName;
  const { toast } = useToast();

  const [teacherName, setTeacherName] = useState<string | null>(null);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]); // All teachers from Firestore
  const [allStudents, setAllStudents] = useState<Student[]>([]); // All students from Firestore
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (teacherNameParam) {
      try {
        const decodedName = decodeURIComponent(teacherNameParam as string);
        setTeacherName(decodedName);
      } catch (e) {
        console.error("Error decoding teacherNameParam:", e);
        setError("Öğretmen adı URL'den çözümlenemedi. Lütfen adres çubuğunu kontrol edin.");
        setTeacherName(null);
        setIsLoading(false);
      }
    } else {
      setError("Öğretmen adı URL'de belirtilmemiş.");
      setIsLoading(false);
    }
  }, [teacherNameParam]);

  useEffect(() => {
    async function loadData() {
      if (!teacherName) { // If teacherName couldn't be set (e.g. decoding error or no param)
        if (!error) setError("Öğretmen bilgisi yüklenemedi."); // Set a generic error if not already set
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const [fetchedStudents, fetchedTeachers] = await Promise.all([
          getStudents(),
          getTeachers()
        ]);
        
        setAllStudents(fetchedStudents);
        setAllTeachers(fetchedTeachers);

        if (!fetchedTeachers.some(t => t.name === teacherName)) {
          setError("'" + teacherName + "' adlı öğretmen bulunamadı.");
        }

      } catch (err: any) {
        console.error("Failed to load data from Firestore for teacher detail page:", err);
        setError(err.message || "Veriler yüklenirken bir hata oluştu.");
        setAllStudents([]);
        setAllTeachers([]);
        toast({
          title: "Veri Yükleme Hatası!",
          description: err.message || "Veriler Firestore'dan yüklenemedi.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (teacherName) { // Only load data if teacherName is successfully set
      loadData();
    }
    // If teacherName is null (due to param issue or decoding error), useEffect for teacherNameParam already handles error and loading state.
  }, [teacherName, toast, error]); // Added error to dependency array to avoid re-triggering if error is already set

  const selectedTeacherStudents = React.useMemo(() => {
    if (!teacherName || !allStudents || allStudents.length === 0) return [];
    return allStudents.filter(student => student.teacherName === teacherName);
  }, [teacherName, allStudents]);

  const currentTeacher = React.useMemo(() => {
    if (!teacherName || !allTeachers || allTeachers.length === 0) return null;
    return allTeachers.find(t => t.name === teacherName);
  }, [teacherName, allTeachers]);

  const handleRenewalToggleDummy = (studentId: number) => {
    // This is a read-only view, so toggling is disabled.
    // console.warn("Renewal toggle attempt from non-admin view for student ID:", studentId);
    toast({
        title: "Bilgilendirme",
        description: "Kayıt yenileme durumu sadece Admin Panelinden değiştirilebilir.",
        variant: "default",
        duration: 3000,
    });
  };

  const handleBulkRenewalToggleDummy = (studentIds: number[], newRenewedState: boolean) => {
    // console.warn("Bulk renewal toggle attempt from non-admin view for student IDs:", studentIds, "to state:", newRenewedState);
     toast({
        title: "Bilgilendirme",
        description: "Kayıt yenileme durumu sadece Admin Panelinden değiştirilebilir.",
        variant: "default",
        duration: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-secondary p-4 md:p-8">
      <header className="mb-8 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Image
            src="/vildan_star_logo.png"
            alt="Vildan Koleji Logo"
            width={40}
            height={40}
            className="rounded-full object-cover"
            data-ai-hint="logo vildan koleji"
          />
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            Kayıt <span className="text-vildan-burgundy">Takip</span> - Öğretmen Detayları
          </h1>
        </div>
        <Link href="/" passHref legacyBehavior>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri Dön
          </Button>
        </Link>
      </header>

      <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <CardHeader>
          <CardTitle>
            {isLoading && !error ? <Skeleton className="h-8 w-1/3" /> : (teacherName || "Öğretmen Detayları")}
          </CardTitle>
          <CardDescription>Seçilen öğretmenin sorumlu olduğu öğrencilerin kayıt yenileme durumları.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4 p-4">
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : error ? (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Hata!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : currentTeacher ? (
            <TeacherDetails
              teachers={[currentTeacher]}
              students={selectedTeacherStudents} // Students for this specific teacher
              allStudents={allStudents} // Pass all students for correct percentage calculation context
              onRenewalToggle={handleRenewalToggleDummy}
              onBulkRenewalToggle={handleBulkRenewalToggleDummy} // Pass dummy for non-admin
              isAdminView={false}
              initialTeacherName={teacherName ?? undefined}
            />
          ) : !currentTeacher && !isLoading && teacherName ? (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Öğretmen Bulunamadı</AlertTitle>
              <AlertDescription>{"'" + teacherName + "' adlı öğretmen yüklenen veriler arasında bulunamadı."}</AlertDescription>
            </Alert>
          ) : (
            <p className="text-muted-foreground text-center py-4">Öğretmen bilgisi bulunamadı veya yüklenemedi. Lütfen URL'yi kontrol edin veya ana sayfaya dönün.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
