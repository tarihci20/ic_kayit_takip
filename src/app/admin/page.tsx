
"use client";

import React, { useState, useEffect } from 'react';
import type { Student, Teacher } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadForm } from '@/components/upload-form';
import { TeacherDetails } from '@/components/teacher-details';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AdminPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from localStorage on component mount (client-side)
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
        setError("Yerel depodan veri yüklenirken bir hata oluştu.");
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

  // Save data to localStorage whenever it changes (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoading) {
      try {
        localStorage.setItem('teachers', JSON.stringify(teachers));
        localStorage.setItem('students', JSON.stringify(students));
      } catch (e) {
        console.error("Failed to save data to localStorage:", e);
        setError("Veriler yerel depoya kaydedilemedi.");
      }
    }
  }, [teachers, students, isLoading]);

  const handleDataUpload = (uploadedTeachers: Teacher[], uploadedStudents: Student[]) => {
    setIsLoading(true);
    setTeachers(uploadedTeachers);
    setStudents(uploadedStudents);
    setError(null); // Clear previous errors
    setIsLoading(false);
  };

  const handleRenewalToggle = (studentId: number) => {
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.id === studentId ? { ...student, renewed: !student.renewed } : student
      )
    );
    // Data will be saved by the useEffect hook
  };

  return (
    <div className="min-h-screen bg-secondary p-4 md:p-8">
      <header className="mb-8 flex justify-between items-center">
        <div className="flex items-center space-x-3">
           <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-vildan-burgundy">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            Renewal<span className="text-vildan-burgundy">Race</span> - Admin Paneli
          </h1>
        </div>
         <Link href="/" passHref legacyBehavior>
            <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Ana Sayfaya Dön
            </Button>
         </Link>
      </header>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md mb-6" role="alert">
          <p className="font-medium">Hata!</p>
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
          <CardHeader>
            <CardTitle>Veri Yükleme</CardTitle>
            <CardDescription>Öğretmen ve öğrenci listelerini içeren Excel dosyasını yükleyin.</CardDescription>
          </CardHeader>
          <CardContent>
            <UploadForm onDataUpload={handleDataUpload} />
          </CardContent>
        </Card>

        {/* Renewal Management Section */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
          <CardHeader>
            <CardTitle>Kayıt Yenileme Yönetimi</CardTitle>
            <CardDescription>Öğrencilerin kayıt yenileme durumlarını buradan güncelleyebilirsiniz.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                 <Skeleton className="h-10 w-1/3" />
                 <Skeleton className="h-8 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : (
              teachers.length > 0 && students.length > 0 ? (
                <TeacherDetails
                  teachers={teachers}
                  students={students}
                  onRenewalToggle={handleRenewalToggle}
                  isAdminView={true} // Enable checkbox interaction in admin view
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
