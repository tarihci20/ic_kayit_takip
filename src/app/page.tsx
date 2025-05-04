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
            throw new Error("Stored data is invalid.");
          }
        }
        // If no data in localStorage, initial state is empty arrays
      } catch (e) {
        console.error("Failed to load data from localStorage:", e);
        localStorage.removeItem('teachers'); // Clear invalid data
        localStorage.removeItem('students');
        setTeachers([]);
        setStudents([]);
        setError("Yerel depodan veri yüklenirken bir hata oluştu. Lütfen verileri yeniden yükleyin.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      if (teachers.length > 0 || students.length > 0) {
          localStorage.setItem('teachers', JSON.stringify(teachers));
          localStorage.setItem('students', JSON.stringify(students));
      }
    } catch (e) {
      console.error("Failed to save data to localStorage:", e);
       setError("Veriler yerel depoya kaydedilemedi. Depolama alanı dolu olabilir.");
    }
  }, [teachers, students]);


  const handleDataUpload = (uploadedTeachers: Teacher[], uploadedStudents: Student[]) => {
    setTeachers(uploadedTeachers);
    setStudents(uploadedStudents);
    setError(null); // Clear previous errors on successful upload
  };

  const handleRenewalToggle = (studentId: number) => {
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.id === studentId ? { ...student, renewed: !student.renewed } : student
      )
    );
    // Data will be saved to localStorage by the useEffect hook watching `students`
  };

  const calculateRenewalPercentage = (teacherId: number): number => {
    const teacherStudents = students.filter(student => student.teacherId === teacherId);
    if (teacherStudents.length === 0) return 0;
    const renewedCount = teacherStudents.filter(student => student.renewed).length;
    return Math.round((renewedCount / teacherStudents.length) * 100);
  };

  const calculateOverallRenewalPercentage = (): number => {
    if (students.length === 0) return 0;
    const renewedCount = students.filter(student => student.renewed).length;
    return Math.round((renewedCount / students.length) * 100);
  };

  const teachersWithPercentage = teachers.map(teacher => ({
    ...teacher,
    renewalPercentage: calculateRenewalPercentage(teacher.id),
    studentCount: students.filter(s => s.teacherId === teacher.id).length,
  })).sort((a, b) => b.renewalPercentage - a.renewalPercentage); // Sort by percentage descending

  const overallPercentage = calculateOverallRenewalPercentage();
  const totalStudentCount = students.length;

  return (
    <div className="min-h-screen bg-secondary p-4 md:p-8">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-3 mb-4 md:mb-0">
           <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-vildan-burgundy">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 className="text-3xl font-bold text-primary">
            Renewal<span className="text-vildan-burgundy">Race</span> - Vildan Koleji Ortaokulu
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
            <Skeleton className="h-10 w-1/3" />
            <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-1/4 mb-2" />
                   <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-40 w-full" />
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
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
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
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle>Öğretmen Özel Görünümü</CardTitle>
                <CardDescription>Bir öğretmen seçerek sorumlu olduğu öğrencilerin kayıt yenileme durumlarını görüntüleyin.</CardDescription>
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
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle>Okul Geneli Kayıt Yenileme Durumu</CardTitle>
                <CardDescription>Tüm okula ait toplam öğrenci sayısı ve kayıt yenileme yüzdesi.</CardDescription>
              </CardHeader>
              <CardContent>
                {totalStudentCount > 0 ? (
                  <SchoolProgress
                    totalStudents={totalStudentCount}
                    overallPercentage={overallPercentage}
                  />
                ) : (
                  <p className="text-muted-foreground text-center py-4">Okul geneli ilerlemesini görmek için lütfen önce Excel dosyasını yükleyin.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
