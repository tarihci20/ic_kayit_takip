
"use client";

import React, { useState, useEffect } from 'react';
import type { Student, Teacher } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadForm } from '@/components/upload-form';
import { TeacherDetails } from '@/components/teacher-details';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import Image from 'next/image'; // Import Next Image
import { Button } from '@/components/ui/button';
import { ArrowLeft, LogOut } from 'lucide-react'; // Removed Star import
import { LoginForm } from '@/components/login-form'; // Import the login form

export default function AdminPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start loading initially
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false); // Track if initial auth check is done

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const loggedIn = sessionStorage.getItem('isAdminAuthenticated');
        setIsAuthenticated(loggedIn === 'true');
      }
      setIsAuthCheckComplete(true); // Mark auth check as complete
    };
    checkAuth();
  }, []);

  // Load data from localStorage on component mount (client-side) only if authenticated
  useEffect(() => {
    // Only run loadData if auth check is complete and user is authenticated
    if (isAuthCheckComplete && isAuthenticated && typeof window !== 'undefined') {
      setIsLoading(true); // Start loading when authenticated
      setError(null); // Clear previous errors
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
          // No data in localStorage, but authenticated, so initialize as empty
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
        setIsLoading(false); // Stop loading after attempt
      }
    } else if (isAuthCheckComplete && !isAuthenticated) {
      // If auth check is complete and not authenticated, clear data and stop loading
      setTeachers([]);
      setStudents([]);
      setIsLoading(false); // Not authenticated, so not loading data
    }
    // Do nothing if auth check is not yet complete
  }, [isAuthenticated, isAuthCheckComplete]); // Rerun when authentication status or check completion changes

  // Save data to localStorage whenever it changes (client-side only and authenticated)
  useEffect(() => {
    // Ensure we are authenticated, on the client, and data is not currently being loaded initially
    if (isAuthenticated && typeof window !== 'undefined' && !isLoading && isAuthCheckComplete) {
      try {
        localStorage.setItem('teachers', JSON.stringify(teachers));
        localStorage.setItem('students', JSON.stringify(students));
      } catch (e) {
        console.error("Failed to save data to localStorage:", e);
        setError("Veriler yerel depoya kaydedilemedi.");
      }
    }
  }, [teachers, students, isLoading, isAuthenticated, isAuthCheckComplete]); // Add dependencies

  const handleDataUpload = (uploadedTeachers: Teacher[], uploadedStudents: Student[]) => {
    // Don't set loading here, let the useEffect handle saving
    setTeachers(uploadedTeachers);
    setStudents(uploadedStudents);
    setError(null); // Clear previous errors on new upload
  };

  const handleRenewalToggle = (studentId: number) => {
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.id === studentId ? { ...student, renewed: !student.renewed } : student
      )
    );
    // Data will be saved by the useEffect hook that watches 'students'
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('isAdminAuthenticated', 'true');
    }
    setError(null); // Clear login errors if any
    // Data loading will be triggered by the useEffect hook watching isAuthenticated
  };

   const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('isAdminAuthenticated');
      // Optionally clear localStorage on logout as well
      // localStorage.removeItem('teachers');
      // localStorage.removeItem('students');
    }
    // Clear state data on logout
    setTeachers([]);
    setStudents([]);
    setError(null);
    setIsLoading(false); // No longer loading data after logout
  };


  // Show a loading state while checking authentication
  if (!isAuthCheckComplete) {
      return (
          <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
              <Skeleton className="h-64 w-full max-w-sm" />
          </div>
      );
  }

  // If auth check is complete but not authenticated, show login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // If authenticated, show the admin panel
  return (
    <div className="min-h-screen bg-secondary p-4 md:p-8">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
            {/* Replace Star icon with placeholder Image */}
             <Image
               src="/vildan_logo.jpeg" // Use the uploaded logo
               alt="Vildan Koleji Logo"
               width={40}
               height={40}
               className="rounded-full object-cover" // Ensure image covers the area
             />
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            Kayıt <span className="text-vildan-burgundy">Takip</span> - Admin Paneli {/* Updated text */}
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
            {isLoading ? ( // Show skeleton while loading data after authentication
              <div className="space-y-4">
                 <Skeleton className="h-10 w-1/3" />
                 <Skeleton className="h-8 w-full" />
                 <Skeleton className="h-40 w-full" />
              </div>
            ) : (
              teachers.length > 0 || students.length > 0 ? ( // Render even if one list has data
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
