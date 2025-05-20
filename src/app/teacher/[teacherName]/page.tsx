
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

export default function TeacherDetailPage() {
  const params = useParams();
  const teacherNameParam = params?.teacherName;

  const [teacherName, setTeacherName] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]); // This will hold ALL students from localStorage
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (teacherNameParam) {
      try {
        setTeacherName(decodeURIComponent(teacherNameParam as string));
      } catch (e) {
        console.error("Error decoding teacherNameParam:", e);
        setError("Öğretmen adı URL'den çözümlenemedi. Lütfen adres çubuğunu kontrol edin.");
        setTeacherName(null); // Ensure teacherName is null if decoding fails
        setIsLoading(false); // Stop loading if there's a decoding error
      }
    } else {
      setIsLoading(false); // No teacherNameParam, so nothing to load based on it.
    }
  }, [teacherNameParam]);

  useEffect(() => {
    const loadData = () => {
      setIsLoading(true); // Ensure loading state is true at the start of data fetching
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
            if (teacherName && !parsedTeachers.some(t => t.name === teacherName)) {
              setError("'" + teacherName + "' adlı öğretmen bulunamadı.");
            }
          } else {
            console.warn("Invalid data found in localStorage, resetting.");
            localStorage.removeItem('teachers');
            localStorage.removeItem('students');
            setTeachers([]);
            setStudents([]);
            setError("Yerel depoda geçersiz veri bulundu.");
          }
        } else {
          setTeachers([]);
          setStudents([]);
          setError("Öğretmen ve öğrenci verileri bulunamadı. Lütfen Admin Panelinden yükleyin.");
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
    };

    // Only attempt to load data if teacherName is successfully set and we are client-side
    if (typeof window !== 'undefined' && teacherName) {
      loadData();
    } else if (typeof window !== 'undefined' && !teacherName && teacherNameParam) {
      // This case handles when teacherNameParam exists but teacherName couldn't be set (e.g., decoding error handled above)
      // setError is likely already set by the previous useEffect.
      // setIsLoading(false) might have already been called if decoding failed.
    } else if (typeof window !== 'undefined' && !teacherNameParam) {
        // No teacher name in URL, so nothing specific to load for a teacher.
        // This might mean the page was accessed directly without a teacher name.
        setError("Öğretmen belirtilmedi.");
        setIsLoading(false);
    }
  }, [teacherName, teacherNameParam]); // Added teacherNameParam to dependencies

  const selectedTeacherStudents = React.useMemo(() => {
    if (!teacherName || !students || students.length === 0) return [];
    return students.filter(student => student.teacherName === teacherName);
  }, [teacherName, students]);

  const currentTeacher = React.useMemo(() => {
    if (!teacherName || !teachers || teachers.length === 0) return null;
    return teachers.find(t => t.name === teacherName);
  }, [teacherName, teachers]);

  const handleRenewalToggleDummy = (studentId: number) => {
    console.warn("Renewal toggle attempt from non-admin view for student ID:", studentId);
  };

  const handleBulkRenewalToggleDummy = (studentIds: number[], newRenewedState: boolean) => {
    console.warn("Bulk renewal toggle attempt from non-admin view for student IDs:", studentIds, "to state:", newRenewedState);
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
          ) : currentTeacher ? ( // Removed students.length > 0 check here, as TeacherDetails can handle empty student list for a teacher
            <TeacherDetails
              teachers={[currentTeacher]} // Pass as an array
              students={selectedTeacherStudents}
              allStudents={students}
              onRenewalToggle={handleRenewalToggleDummy}
              onBulkRenewalToggle={handleBulkRenewalToggleDummy}
              isAdminView={false}
              initialTeacherName={teacherName ?? undefined}
            />
          ) : !currentTeacher && !isLoading && teacherName ? ( // only show "teacher not found" if a teacherName was expected
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Öğretmen Bulunamadı</AlertTitle>
              <AlertDescription>{"'" + teacherName + "' adlı öğretmen yüklenen veriler arasında bulunamadı."}</AlertDescription>
            </Alert>
          ) : (
             // Generic message if no specific error, not loading, and no teacher name (e.g. direct access without param)
            <p className="text-muted-foreground text-center py-4">Öğretmen bilgisi bulunamadı veya yüklenemedi.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
