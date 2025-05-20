
"use client";

import React, { useState, useEffect } from 'react';
import type { Student, Teacher } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TeacherLeaderboard } from '@/components/teacher-leaderboard';
import { SchoolProgress } from '@/components/school-progress';
import { ClassRenewalChart, type ClassRenewalData } from '@/components/class-renewal-chart'; // Import ClassRenewalChart
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { UserCog, BarChart3 } from 'lucide-react'; // Added BarChart3 for new chart section

export default function Home() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = () => {
      setIsLoading(true);
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
        setError("Yerel depodan veri yüklenirken bir hata oluştu. Tarayıcı verilerini temizlemeyi deneyin veya verileri yeniden yükleyin.");
      } finally {
        setIsLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
        loadData();
    } else {
        setIsLoading(false);
        setTeachers([]);
        setStudents([]);
    }
  }, []);

  useEffect(() => {
      if (typeof window !== 'undefined') {
        try {
          if (!isLoading) {
              if (teachers.length > 0 || students.length > 0) {
                localStorage.setItem('teachers', JSON.stringify(teachers));
                localStorage.setItem('students', JSON.stringify(students));
              } else {
                const lsTeachers = localStorage.getItem('teachers');
                const lsStudents = localStorage.getItem('students');
                if (lsTeachers || lsStudents) { 
                    localStorage.removeItem('teachers');
                    localStorage.removeItem('students');
                }
              }
          }
        } catch (e) {
          console.error("Failed to save data to localStorage:", e);
          setError("Veriler yerel depoya kaydedilemedi. Depolama alanı dolu olabilir veya tarayıcı ayarları engelliyor olabilir.");
        }
      }
  }, [teachers, students, isLoading]);

   const teachersWithPercentage = React.useMemo(() => {
      const studentsByTeacher: Record<string, Student[]> = students.reduce((acc, student) => {
        if (!acc[student.teacherName]) {
          acc[student.teacherName] = [];
        }
        acc[student.teacherName].push(student);
        return acc;
      }, {} as Record<string, Student[]>);

      return teachers.map(teacher => {
        const teacherStudents = studentsByTeacher[teacher.name] || [];
        const studentCount = teacherStudents.length;
        if (studentCount === 0) return { ...teacher, renewalPercentage: 0, studentCount: 0 };
        const renewedCount = teacherStudents.filter(student => student.renewed).length;
        const renewalPercentage = Math.round((renewedCount / studentCount) * 100);
        return { ...teacher, renewalPercentage, studentCount };
      }).sort((a, b) => b.renewalPercentage - a.renewalPercentage);
   }, [teachers, students]);

  const overallStats = React.useMemo(() => {
      const totalStudentCount = students.length;
      if (totalStudentCount === 0) return { totalStudentCount: 0, renewedStudentCount: 0, notRenewedStudentCount: 0, overallPercentage: 0 };

      const renewedStudentCount = students.filter(student => student.renewed).length;
      const notRenewedStudentCount = totalStudentCount - renewedStudentCount;
      const overallPercentage = Math.round((renewedStudentCount / totalStudentCount) * 100);

      return { totalStudentCount, renewedStudentCount, notRenewedStudentCount, overallPercentage };
  }, [students]);

  const classRenewalStats = React.useMemo(() => {
    if (students.length === 0) return [];

    const statsByClass: Record<string, { renewed: number; notRenewed: number }> = {};

    students.forEach(student => {
      const className = student.className || "Belirtilmemiş"; // Handle empty class names
      if (!statsByClass[className]) {
        statsByClass[className] = { renewed: 0, notRenewed: 0 };
      }
      if (student.renewed) {
        statsByClass[className].renewed++;
      } else {
        statsByClass[className].notRenewed++;
      }
    });

    return Object.entries(statsByClass)
      .map(([className, counts]) => ({
        name: `${className}. Sınıflar`, // Format for display
        renewed: counts.renewed,
        notRenewed: counts.notRenewed,
      }))
      .sort((a, b) => { // Sort by class name numerically, then alphabetically for "Belirtilmemiş"
        const aNum = parseInt(a.name);
        const bNum = parseInt(b.name);
        if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
        if (!isNaN(aNum)) return -1; // Numbers first
        if (!isNaN(bNum)) return 1;  // Numbers first
        return a.name.localeCompare(b.name); // Then sort others alphabetically
      });
  }, [students]);


  return (
    <div className="min-h-screen bg-secondary p-4 md:p-8 flex flex-col">
      <div className="flex-grow">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-3 flex-shrink-0">
              <Image
                src="/vildan_star_logo.png"
                alt="Vildan Koleji Logo"
                width={40}
                height={40}
                className="rounded-full object-cover"
                data-ai-hint="logo school"
              />
            <h1 className="text-2xl md:text-3xl font-bold text-primary">
              Kayıt <span className="text-vildan-burgundy">Takip</span>
              <span className="block text-sm md:inline md:ml-2 text-muted-foreground font-normal">Vildan Koleji Ortaokulu</span>
            </h1>
          </div>
        </header>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md mb-6" role="alert">
            <p className="font-medium">Hata!</p>
            <p>{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-6">
              <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 md:w-1/3 mb-2" />
                    <Skeleton className="h-4 w-full md:w-2/3" />
                  </CardHeader>
                  <CardContent>
                      <Skeleton className="h-40 w-full" />
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader>
                      <Skeleton className="h-6 w-3/4 md:w-1/3 mb-2" />
                      <Skeleton className="h-4 w-full md:w-1/2" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <Skeleton className="h-32 w-full" />
                      <Skeleton className="h-6 w-1/2 mx-auto" /> 
                      <Skeleton className="h-48 w-full" /> 
                  </CardContent>
              </Card>
          </div>
        ) : (
          <div className="space-y-6"> 
              <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                <CardHeader>
                  <CardTitle>Öğretmenler Kayıt Takip</CardTitle>
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

              <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                <CardHeader>
                  <CardTitle>Okul Geneli Kayıt Yenileme Durumu</CardTitle>
                  <CardDescription>Tüm okula ait toplam öğrenci sayısı, kayıt yenileme yüzdesi ve sınıflara göre dağılımı.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8"> {/* Added space-y for multiple sections */}
                  <div className="flex justify-center">
                      {overallStats.totalStudentCount > 0 ? (
                        <SchoolProgress
                          totalStudents={overallStats.totalStudentCount}
                          renewedStudents={overallStats.renewedStudentCount}
                        />
                      ) : (
                        <p className="text-muted-foreground text-center py-4">Okul geneli ilerlemesini görmek için lütfen Admin Panelinden Excel dosyasını yükleyin.</p>
                      )}
                  </div>

                  {overallStats.totalStudentCount > 0 && classRenewalStats.length > 0 && (
                    <div className="border-t pt-6 mt-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold text-primary">Sınıflara Göre Kayıt Durumu</h3>
                      </div>
                      <ClassRenewalChart data={classRenewalStats} />
                    </div>
                  )}
                   {overallStats.totalStudentCount > 0 && classRenewalStats.length === 0 && !isLoading && (
                     <p className="text-muted-foreground text-center py-4">Sınıf bazlı grafik için öğrenci verilerinde sınıf bilgisi bulunmalıdır.</p>
                   )}
                </CardContent>
              </Card>
          </div>
        )}
      </div>
      <div className="mt-auto pt-8 flex justify-center">
        <Link href="/admin" passHref legacyBehavior>
            <Button variant="outline" size="sm">
                <UserCog className="mr-2 h-4 w-4" />
                A.Paneli
            </Button>
        </Link>
      </div>
    </div>
  );
}
