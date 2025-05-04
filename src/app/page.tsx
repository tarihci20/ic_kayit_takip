
"use client";

import React, { useState, useEffect } from 'react';
import type { Student, Teacher } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadForm } from '@/components/upload-form';
import { TeacherLeaderboard } from '@/components/teacher-leaderboard';
import { TeacherDetails } from '@/components/teacher-details';
import { SchoolProgress } from '@/components/school-progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label'; // Import Label for SchoolProgress explicit label

export default function Home() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate data loading or load from localStorage/API
  useEffect(() => {
    // Try loading data from localStorage
    const loadData = () => {
      setIsLoading(true);
      try {
        const storedTeachers = localStorage.getItem('teachers');
        const storedStudents = localStorage.getItem('students');

        if (storedTeachers && storedStudents) {
          const parsedTeachers: Teacher[] = JSON.parse(storedTeachers);
          const parsedStudents: Student[] = JSON.parse(storedStudents);

          // Basic validation
          if (Array.isArray(parsedTeachers) && Array.isArray(parsedStudents)) {
            setTeachers(parsedTeachers);
            setStudents(parsedStudents);
          } else {
             console.warn("Invalid data found in localStorage, resetting.");
             localStorage.removeItem('teachers');
             localStorage.removeItem('students');
             setTeachers([]);
             setStudents([]);
             // Don't set error here, let user upload fresh data
          }
        } else {
          // If no data in localStorage, initial state is empty arrays
           setTeachers([]);
           setStudents([]);
        }
      } catch (e) {
        console.error("Failed to load data from localStorage:", e);
        localStorage.removeItem('teachers'); // Clear invalid data
        localStorage.removeItem('students');
        setTeachers([]);
        setStudents([]);
        setError("Yerel depodan veri yüklenirken bir hata oluştu. Tarayıcı verilerini temizlemeyi deneyin veya verileri yeniden yükleyin.");
      } finally {
        setIsLoading(false);
      }
    };

    // Avoid running localStorage access on server
    if (typeof window !== 'undefined') {
        loadData();
    } else {
        // Set initial state for SSR or if window is unavailable
        setIsLoading(false); // Assume not loading if no window
        setTeachers([]);
        setStudents([]);
    }

  }, []); // Run only once on component mount (client-side)

  // Save data to localStorage whenever it changes (client-side only)
  useEffect(() => {
      if (typeof window !== 'undefined') {
        try {
          // Save only if data has been loaded/modified to avoid overwriting initial state
          if (!isLoading) {
              localStorage.setItem('teachers', JSON.stringify(teachers));
              localStorage.setItem('students', JSON.stringify(students));
          }
        } catch (e) {
          console.error("Failed to save data to localStorage:", e);
          setError("Veriler yerel depoya kaydedilemedi. Depolama alanı dolu olabilir veya tarayıcı ayarları engelliyor olabilir.");
        }
      }
  }, [teachers, students, isLoading]);


  const handleDataUpload = (uploadedTeachers: Teacher[], uploadedStudents: Student[]) => {
    setIsLoading(true); // Indicate loading while processing new data
    setTeachers(uploadedTeachers);
    setStudents(uploadedStudents);
    setError(null); // Clear previous errors on successful upload
    setIsLoading(false); // Done processing
  };

  const handleRenewalToggle = (studentId: number) => {
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.id === studentId ? { ...student, renewed: !student.renewed } : student
      )
    );
    // Data will be saved to localStorage by the useEffect hook watching `students`
  };

   // Memoize calculations to avoid re-computing on every render
   const teachersWithPercentage = React.useMemo(() => {
      return teachers.map(teacher => {
      const teacherStudents = students.filter(student => student.teacherId === teacher.id);
      const studentCount = teacherStudents.length;
      if (studentCount === 0) return { ...teacher, renewalPercentage: 0, studentCount: 0 };
      const renewedCount = teacherStudents.filter(student => student.renewed).length;
      const renewalPercentage = Math.round((renewedCount / studentCount) * 100);
      return { ...teacher, renewalPercentage, studentCount };
    }).sort((a, b) => b.renewalPercentage - a.renewalPercentage); // Sort by percentage descending
   }, [teachers, students]);

  const overallPercentage = React.useMemo(() => {
      if (students.length === 0) return 0;
      const renewedCount = students.filter(student => student.renewed).length;
      return Math.round((renewedCount / students.length) * 100);
  }, [students]);

  const totalStudentCount = students.length;

  return (
    <div className="min-h-screen bg-secondary p-4 md:p-8">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-3 flex-shrink-0">
           <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-vildan-burgundy">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            Renewal<span className="text-vildan-burgundy">Race</span>
             <span className="block text-sm md:inline md:ml-2 text-muted-foreground font-normal">Vildan Koleji Ortaokulu</span>
          </h1>
        </div>
         <UploadForm onDataUpload={handleDataUpload} />
      </header>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md mb-6" role="alert">
          <p className="font-medium">Hata!</p>
          <p>{error}</p>
        </div>
      )}

       {isLoading ? (
         <div className="space-y-6">
            <Skeleton className="h-10 w-full md:w-1/3 mb-6" /> {/* Adjusted width */}
            <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 md:w-1/4 mb-2" /> {/* Adjusted width */}
                   <Skeleton className="h-4 w-full md:w-1/2" /> {/* Adjusted width */}
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-40 w-full" />
                </CardContent>
            </Card>
             {/* Add skeleton for other tabs as well */}
             <Card>
                <CardHeader>
                     <Skeleton className="h-6 w-3/4 md:w-1/4 mb-2" />
                     <Skeleton className="h-4 w-full md:w-1/2" />
                 </CardHeader>
                 <CardContent>
                     <Skeleton className="h-64 w-full" /> {/* Taller skeleton for teacher details */}
                </CardContent>
            </Card>
             <Card>
                 <CardHeader>
                     <Skeleton className="h-6 w-3/4 md:w-1/4 mb-2" />
                    <Skeleton className="h-4 w-full md:w-1/2" />
                 </CardHeader>
                 <CardContent>
                    <Skeleton className="h-24 w-full" /> {/* Shorter skeleton for school progress */}
                 </CardContent>
             </Card>
         </div>
      ) : (
        <Tabs defaultValue="leaderboard" className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-6">
            <TabsTrigger value="leaderboard">🏆 Öğretmen Yarışı</TabsTrigger>
            <TabsTrigger value="teacher-view">👤 Öğretmen Detayları</TabsTrigger>
            <TabsTrigger value="school-progress">📊 Okul Geneli</TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard">
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
              <CardHeader>
                <CardTitle>Öğretmen Kayıt Yenileme Yarışı</CardTitle>
                <CardDescription>Öğretmenlerin sorumlu oldukları öğrencilerin kayıt yenileme yüzdelerine göre sıralaması.</CardDescription>
              </CardHeader>
              <CardContent>
                {teachersWithPercentage.length > 0 ? (
                  <TeacherLeaderboard teachers={teachersWithPercentage} />
                ) : (
                   <p className="text-muted-foreground text-center py-4">Liderlik tablosunu görmek için lütfen önce Excel dosyasını yükleyin.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teacher-view">
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
              <CardHeader>
                <CardTitle>Öğretmen Özel Görünümü</CardTitle>
                <CardDescription>Bir öğretmen seçerek sorumlu olduğu öğrencilerin kayıt yenileme durumlarını görüntüleyin ve güncelleyin.</CardDescription>
              </CardHeader>
              <CardContent>
                {teachers.length > 0 && students.length > 0 ? (
                  <TeacherDetails
                    teachers={teachers}
                    students={students}
                    onRenewalToggle={handleRenewalToggle}
                  />
                 ) : (
                   <p className="text-muted-foreground text-center py-4">Öğretmen detaylarını görmek için lütfen önce Excel dosyasını yükleyin.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="school-progress">
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
              <CardHeader>
                <CardTitle>Okul Geneli Kayıt Yenileme Durumu</CardTitle>
                <CardDescription>Tüm okula ait toplam öğrenci sayısı ve kayıt yenileme yüzdesi.</CardDescription>
              </CardHeader>
              <CardContent>
                 {/* Wrap SchoolProgress in a div for potential centering/styling */}
                 <div className="flex justify-center">
                     {totalStudentCount > 0 ? (
                       <SchoolProgress
                         totalStudents={totalStudentCount}
                         overallPercentage={overallPercentage}
                       />
                     ) : (
                       <p className="text-muted-foreground text-center py-4">Okul geneli ilerlemesini görmek için lütfen önce Excel dosyasını yükleyin.</p>
                     )}
                 </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
