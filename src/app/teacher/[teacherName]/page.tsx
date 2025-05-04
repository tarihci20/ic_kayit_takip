
"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import type { Student, Teacher } from '@/types';
import { TeacherDetails } from '@/components/teacher-details';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ArrowLeft, Star } from 'lucide-react'; // Import Star icon
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert components

export default function TeacherDetailPage() {
  const params = useParams();
  const teacherNameParam = params?.teacherName;

  const [teacherName, setTeacherName] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (teacherNameParam) {
      // Decode the teacher name from the URL parameter
      setTeacherName(decodeURIComponent(teacherNameParam as string));
    }
  }, [teacherNameParam]);

  // Load data from localStorage on component mount (client-side)
  useEffect(() => {
    const loadData = () => {
      setIsLoading(true);
      setError(null); // Reset error on reload
      try {
        const storedTeachers = localStorage.getItem('teachers');
        const storedStudents = localStorage.getItem('students');

        if (storedTeachers && storedStudents) {
          const parsedTeachers: Teacher[] = JSON.parse(storedTeachers);
          const parsedStudents: Student[] = JSON.parse(storedStudents);

          if (Array.isArray(parsedTeachers) && Array.isArray(parsedStudents)) {
            setTeachers(parsedTeachers);
            setStudents(parsedStudents);
             // Check if the requested teacher exists after loading
             if (teacherName && !parsedTeachers.some(t => t.name === teacherName)) {
                 setError(`'${teacherName}' adlı öğretmen bulunamadı.`);
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
          // No data found
          setTeachers([]);
          setStudents([]);
           setError("Öğretmen ve öğrenci verileri bulunamadı. Lütfen Admin Panelinden yükleyin.");
        }
      } catch (e) {
        console.error("Failed to load data from localStorage:", e);
        localStorage.removeItem('teachers'); // Clear potentially corrupt data
        localStorage.removeItem('students');
        setTeachers([]);
        setStudents([]);
        setError("Yerel depodan veri yüklenirken bir hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    };

    if (typeof window !== 'undefined' && teacherName) { // Load data only if teacherName is set
      loadData();
    } else if (!teacherName) {
        setIsLoading(false); // Stop loading if no teacher name yet
    }

  }, [teacherName]); // Re-run loadData when teacherName changes


  // Filter students for the selected teacher (memoized)
  const selectedTeacherStudents = React.useMemo(() => {
    if (!teacherName || !students) return [];
    return students.filter(student => student.teacherName === teacherName);
  }, [teacherName, students]);

  // Find the current teacher object (if available)
   const currentTeacher = React.useMemo(() => {
     if (!teacherName || !teachers) return null;
     return teachers.find(t => t.name === teacherName);
   }, [teacherName, teachers]);


  // Dummy function for TeacherDetails, as checkbox is disabled in non-admin view
  const handleRenewalToggle = (studentId: number) => {
    console.warn("Renewal toggle attempt from non-admin view for student ID:", studentId);
  };

  return (
    <div className="min-h-screen bg-secondary p-4 md:p-8">
      <header className="mb-8 flex justify-between items-center">
        <div className="flex items-center space-x-3">
           {/* Replace generic SVG with Star icon */}
           <Star className="h-10 w-10 text-vildan-burgundy fill-current" />
           {/* <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-vildan-burgundy">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg> */}
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            Renewal<span className="text-vildan-burgundy">Race</span> - Öğretmen Detayları
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
            {/* Display Teacher Name if loaded and found */}
           <CardTitle>
             {isLoading ? <Skeleton className="h-8 w-1/3" /> : (teacherName || "Öğretmen Detayları")}
           </CardTitle>
          <CardDescription>Seçilen öğretmenin sorumlu olduğu öğrencilerin kayıt yenileme durumları.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4 p-4">
              <Skeleton className="h-10 w-1/2" /> {/* For search/select */}
               <Skeleton className="h-8 w-full" /> {/* Table Header */}
              <Skeleton className="h-10 w-full" /> {/* Table Row */}
              <Skeleton className="h-10 w-full" /> {/* Table Row */}
               <Skeleton className="h-10 w-full" /> {/* Table Row */}
            </div>
          ) : error ? (
             <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Hata!</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
             </Alert>
          ) : currentTeacher && students.length > 0 ? (
             // Render TeacherDetails only if the teacher exists and students are loaded
             // Pass only the relevant teacher and students
            <TeacherDetails
              teachers={[currentTeacher]} // Pass only the current teacher
              students={students} // Pass all students, filtering happens inside
              onRenewalToggle={handleRenewalToggle}
              isAdminView={false} // Always false for public teacher detail view
              initialTeacherName={teacherName ?? undefined} // Pre-select the teacher
            />
           ) : !currentTeacher && !isLoading ? (
              // Specific message if teacher name is valid but not found in loaded data
              <Alert variant="destructive" className="mt-4">
                 <AlertCircle className="h-4 w-4" />
                 <AlertTitle>Öğretmen Bulunamadı</AlertTitle>
                 <AlertDescription>{`'${teacherName}' adlı öğretmen yüklenen veriler arasında bulunamadı.`}</AlertDescription>
              </Alert>
          ) : (
             // General message if data is missing or teacher not selected yet
            <p className="text-muted-foreground text-center py-4">Öğretmen verileri yükleniyor veya bulunamadı.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
