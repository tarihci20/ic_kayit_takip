
"use client";

import React, { useState, useEffect } from 'react';
import type { Student, Teacher } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TeacherLeaderboard } from '@/components/teacher-leaderboard';
// Removed TeacherDetails import as it's no longer used directly here
import { SchoolProgress } from '@/components/school-progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label'; // Import Label for SchoolProgress explicit label
import Link from 'next/link'; // Import Link for Admin Panel
import Image from 'next/image'; // Import Next Image
import { Button } from '@/components/ui/button'; // Import Button
import { UserCog } from 'lucide-react'; // Removed Star import

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

   // Memoize calculations to avoid re-computing on every render
   const teachersWithPercentage = React.useMemo(() => {
      // Group students by teacher name first
      const studentsByTeacher: Record<string, Student[]> = students.reduce((acc, student) => {
        if (!acc[student.teacherName]) {
          acc[student.teacherName] = [];
        }
        acc[student.teacherName].push(student);
        return acc;
      }, {} as Record<string, Student[]>);


      return teachers.map(teacher => {
        const teacherStudents = studentsByTeacher[teacher.name] || []; // Get students by teacher name
        const studentCount = teacherStudents.length;
        if (studentCount === 0) return { ...teacher, renewalPercentage: 0, studentCount: 0 };
        const renewedCount = teacherStudents.filter(student => student.renewed).length;
        const renewalPercentage = Math.round((renewedCount / studentCount) * 100);
        return { ...teacher, renewalPercentage, studentCount };
      }).sort((a, b) => b.renewalPercentage - a.renewalPercentage); // Sort by percentage descending
   }, [teachers, students]);

  const overallStats = React.useMemo(() => {
      const totalStudentCount = students.length;
      if (totalStudentCount === 0) return { totalStudentCount: 0, renewedStudentCount: 0, notRenewedStudentCount: 0, overallPercentage: 0 };

      const renewedStudentCount = students.filter(student => student.renewed).length;
      const notRenewedStudentCount = totalStudentCount - renewedStudentCount;
      const overallPercentage = Math.round((renewedStudentCount / totalStudentCount) * 100);

      return { totalStudentCount, renewedStudentCount, notRenewedStudentCount, overallPercentage };
  }, [students]);


  return (
    <div className="min-h-screen bg-secondary p-4 md:p-8">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-3 flex-shrink-0">
             {/* Replace Star icon with placeholder Image */}
             <Image
               src="/vildan_logo.jpeg" // Use the uploaded logo
               alt="Vildan Koleji Logo"
               width={40}
               height={40}
               className="rounded-full object-cover"
             />
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            Kayıt <span className="text-vildan-burgundy">Takip</span> {/* Updated text */}
             <span className="block text-sm md:inline md:ml-2 text-muted-foreground font-normal">Vildan Koleji Ortaokulu</span>
          </h1>
        </div>
         {/* Add a link/button to the admin panel */}
         <Link href="/admin" passHref legacyBehavior>
            <Button variant="outline" size="sm">
                <UserCog className="mr-2 h-4 w-4" />
                Admin Paneli
            </Button>
         </Link>
      </header>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md mb-6" role="alert">
          <p className="font-medium">Hata!</p>
          <p>{error}</p>
        </div>
      )}

       {isLoading ? (
         <div className="space-y-6">
            <Skeleton className="h-10 w-full md:w-1/2 mb-6" /> {/* Adjusted width for 2 tabs */}
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
                    <Skeleton className="h-24 w-full" /> {/* Shorter skeleton for school progress */}
                 </CardContent>
             </Card>
         </div>
      ) : (
        <Tabs defaultValue="leaderboard" className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 mb-6"> {/* Updated grid columns */}
            <TabsTrigger value="leaderboard">🏆 Öğretmen Yarışı</TabsTrigger>
            {/* <TabsTrigger value="teacher-view">👤 Öğretmen Detayları</TabsTrigger> REMOVED */}
            <TabsTrigger value="school-progress">📊 Okul Geneli</TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard">
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
              <CardHeader>
                <CardTitle>Öğretmen Kayıt Yenileme Yarışı</CardTitle>
                <CardDescription>Öğretmenlerin sorumlu oldukları öğrencilerin kayıt yenileme yüzdelerine göre sıralaması. Detayları görmek için öğretmen adına tıklayın.</CardDescription>
              </CardHeader>
              <CardContent>
                {teachersWithPercentage.length > 0 ? (
                  <TeacherLeaderboard teachers={teachersWithPercentage} />
                ) : (
                   <p className="text-muted-foreground text-center py-4">Liderlik tablosunu görmek için lütfen Admin Panelinden Excel dosyasını yükleyin.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* REMOVED Teacher Details Tab Content */}
          {/* <TabsContent value="teacher-view"> ... </TabsContent> */}

          <TabsContent value="school-progress">
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
              <CardHeader>
                <CardTitle>Okul Geneli Kayıt Yenileme Durumu</CardTitle>
                <CardDescription>Tüm okula ait toplam öğrenci sayısı ve kayıt yenileme yüzdesi.</CardDescription>
              </CardHeader>
              <CardContent>
                 {/* Wrap SchoolProgress in a div for potential centering/styling */}
                 <div className="flex justify-center">
                     {overallStats.totalStudentCount > 0 ? (
                       <SchoolProgress
                         totalStudents={overallStats.totalStudentCount}
                         renewedStudents={overallStats.renewedStudentCount}
                         // notRenewedStudents and overallPercentage are calculated inside
                       />
                     ) : (
                       <p className="text-muted-foreground text-center py-4">Okul geneli ilerlemesini görmek için lütfen Admin Panelinden Excel dosyasını yükleyin.</p>
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
