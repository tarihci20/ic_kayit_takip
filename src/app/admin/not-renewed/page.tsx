
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import type { Student } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ListX, Users } from 'lucide-react';
import { LoginForm } from '@/components/login-form';
import { useToast } from '@/hooks/use-toast';
// import { Badge } from '@/components/ui/badge'; // Badge not currently used here
import { getStudents } from '@/services/firestoreService';

export default function NotRenewedStudentsPage() {
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);
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
      setIsAuthenticated(false);
      setIsAuthCheckComplete(true);
    }
  }, []);

  useEffect(() => {
    async function loadDataFromFirestore() {
      if (isAuthCheckComplete && isAuthenticated) {
        setIsLoading(true);
        setError(null);
        try {
          const fetchedStudents = await getStudents();
          setAllStudents(fetchedStudents);
        } catch (err: any) {
          console.error("Error loading students from Firestore:", err);
          setError(err.message || "Öğrenci verileri Firestore'dan yüklenirken bir hata oluştu.");
          setAllStudents([]);
          toast({
            title: "Veri Yükleme Hatası!",
            description: err.message || "Öğrenci verileri Firestore'dan yüklenemedi.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      } else if (isAuthCheckComplete && !isAuthenticated) {
        setAllStudents([]);
        setIsLoading(false);
      }
    }
    loadDataFromFirestore();
  }, [isAuthenticated, isAuthCheckComplete, toast]);

  const notRenewedStudentsByClass = useMemo(() => {
    if (allStudents.length === 0) return [];

    const filteredStudents = allStudents.filter(student => !student.renewed);
    if (filteredStudents.length === 0) return [];

    const groupedByClass = filteredStudents.reduce((acc, student) => {
      const classNameKey = student.className || "Belirtilmemiş";
      if (!acc[classNameKey]) {
        acc[classNameKey] = [];
      }
      acc[classNameKey].push(student);
      return acc;
    }, {} as Record<string, Student[]>);

    return Object.entries(groupedByClass).sort(([classA], [classB]) => {
      if (classA === "Belirtilmemiş") return 1;
      if (classB === "Belirtilmemiş") return -1;
      const numA = parseInt(classA);
      const numB = parseInt(classB);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return classA.localeCompare(classB);
    });
  }, [allStudents]);

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
        <LoginForm onLoginSuccess={() => {
          setIsAuthenticated(true);
          setError(null);
          // Data loading will be triggered by useEffect dependency on isAuthenticated
        }} />
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
            Kayıt Yenilemeyen <span className="text-vildan-burgundy">Öğrenciler</span>
          </h1>
        </div>
        <Link href="/admin" passHref legacyBehavior>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Admin Paneline Dön
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
          {[1, 2, 3].map(i => (
            <Card key={i} className="shadow-md">
              <CardHeader>
                <Skeleton className="h-7 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-10 w-full mb-2" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : notRenewedStudentsByClass.length > 0 ? (
        <div className="space-y-8">
          {notRenewedStudentsByClass.map(([className, studentsInClass]) => (
            <Card key={className} className="shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Users className="h-6 w-6 text-primary" />
                  {className === "Belirtilmemiş" ? "Sınıfı Belirtilmemiş" : `${className}. Sınıflar`} - Kayıt Yenilemeyenler
                </CardTitle>
                <CardDescription>
                  Bu sınıfta kayıt yenileme işlemi yapmayan öğrenci sayısı: {studentsInClass.length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px] hidden sm:table-cell">ID</TableHead>
                      <TableHead>Öğrenci Adı</TableHead>
                      <TableHead>Sorumlu Öğretmen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentsInClass.map((student) => (
                      <TableRow key={student.id} className="bg-destructive/10 hover:bg-destructive/20">
                        <TableCell className="font-mono text-xs text-muted-foreground hidden sm:table-cell">{student.id}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.teacherName}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <ListX className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold text-foreground">Kayıt Yenilemeyen Öğrenci Bulunmuyor</p>
              <p className="text-muted-foreground mt-2">
                {allStudents.length === 0 && !isLoading && !error ? "Sistemde hiç öğrenci verisi bulunmuyor. Lütfen Admin Panelinden yükleme yapın." : (error ? "Veriler yüklenemedi." : "Tüm öğrenciler kayıtlarını yenilemiş görünüyor veya kayıt yenilemeyen öğrenci bulunamadı.")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
