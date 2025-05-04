
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import type { Student, Teacher } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { User, Search, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

interface TeacherDetailsProps {
  teachers: Teacher[];
  students: Student[];
  onRenewalToggle: (studentId: number) => void;
  isAdminView?: boolean;
  initialTeacherName?: string; // Optional prop to pre-select teacher
}

export function TeacherDetails({
    teachers,
    students,
    onRenewalToggle,
    isAdminView = false,
    initialTeacherName
}: TeacherDetailsProps) {
  // Use initialTeacherName if provided, otherwise default to first teacher or undefined
  const [selectedTeacherName, setSelectedTeacherName] = useState<string | undefined>(
    initialTeacherName ?? teachers[0]?.name
  );
  const [searchTerm, setSearchTerm] = useState('');

  // Update selected teacher if initialTeacherName changes (e.g., navigating between teacher pages)
   useEffect(() => {
       if (initialTeacherName) {
           setSelectedTeacherName(initialTeacherName);
           setSearchTerm(''); // Reset search when teacher changes via prop
       }
   }, [initialTeacherName]);

   // Effect to handle teacher selection updates when the teacher list changes (e.g., after upload)
   // Only run this logic if it's not a specific teacher detail page (initialTeacherName is not set)
   useEffect(() => {
    if (!initialTeacherName) {
        const teacherExists = teachers.some(teacher => teacher.name === selectedTeacherName);
        // If the currently selected teacher doesn't exist anymore OR no teacher is selected,
        // default to the first teacher in the new list.
        if ((!teacherExists && selectedTeacherName) || !selectedTeacherName) {
            setSelectedTeacherName(teachers[0]?.name);
            setSearchTerm(''); // Reset search term as well
        }
    }
   }, [teachers, initialTeacherName, selectedTeacherName]); // Add selectedTeacherName to dependencies


  const handleTeacherChange = (value: string) => {
    setSelectedTeacherName(value);
    setSearchTerm(''); // Reset search when teacher changes via dropdown
  };

  const selectedTeacherStudents = useMemo(() => {
    if (!selectedTeacherName) return [];
    return students
      .filter(student => student.teacherName === selectedTeacherName)
      .filter(student => student.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [selectedTeacherName, students, searchTerm]);

  const calculateTeacherPercentage = (teacherName: string | undefined): number => {
      if (!teacherName) return 0;
      const teacherStudentsAll = students.filter(student => student.teacherName === teacherName);
      if (teacherStudentsAll.length === 0) return 0;
      const renewedCount = teacherStudentsAll.filter(student => student.renewed).length;
      // Handle potential division by zero if somehow length is zero after filtering
      const percentage = teacherStudentsAll.length > 0 ? (renewedCount / teacherStudentsAll.length) * 100 : 0;
      return Math.round(percentage);
  };

  const currentTeacherPercentage = calculateTeacherPercentage(selectedTeacherName);
  const currentTeacherStudentCount = selectedTeacherName ? students.filter(s => s.teacherName === selectedTeacherName).length : 0;


  return (
    <div className="space-y-6">
       {/* Hide teacher select and search if initialTeacherName is provided (Teacher Detail Page context) */}
       {!initialTeacherName && (
           <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-grow md:flex-grow-0 md:w-1/3">
              <Label htmlFor="teacher-select" className="mb-2 block text-sm font-medium text-foreground">Öğretmen Seçin</Label>
              <Select onValueChange={handleTeacherChange} value={selectedTeacherName ?? ''} disabled={teachers.length === 0}>
                <SelectTrigger id="teacher-select" className="w-full">
                  <div className="flex items-center gap-2">
                     <User className="h-4 w-4 text-muted-foreground" />
                     <SelectValue placeholder="Bir öğretmen seçin..." />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.name}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                   {teachers.length === 0 && <SelectItem value="no-teacher" disabled>Öğretmen yok</SelectItem>}
                </SelectContent>
              </Select>
            </div>
             <div className="relative flex-grow">
               <Label htmlFor="student-search" className="mb-2 block text-sm font-medium text-foreground">Öğrenci Ara</Label>
               <Search className="absolute left-2.5 top-[calc(50%)] -translate-y-1/2 h-4 w-4 text-muted-foreground" /> {/* Vertically center icon */}
               <Input
                 id="student-search"
                 type="text"
                 placeholder="Öğrenci adıyla ara..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="pl-8 w-full h-10" // Ensure input height matches SelectTrigger
                 disabled={!selectedTeacherName}
               />
             </div>
           </div>
       )}

      {selectedTeacherName && (
        <div>
            <div className="mb-4 p-4 bg-secondary rounded-lg border flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div>
                     <h3 className="text-lg font-semibold text-primary">{selectedTeacherName}</h3>
                     <p className="text-sm text-muted-foreground">Sorumlu Olduğu Öğrenci Sayısı: {currentTeacherStudentCount}</p>
                </div>
                <div className="text-left md:text-right mt-2 md:mt-0">
                     <p className="text-sm font-medium text-foreground">Yenileme Oranı</p>
                      <Badge variant="secondary" // Use secondary as base, override with conditional bg/text
                          className={cn(
                             'text-lg border-transparent', // Make border transparent
                             currentTeacherPercentage >= 67 ? 'bg-accent text-accent-foreground' // 67-100: Green
                            : currentTeacherPercentage >= 34 ? 'bg-chart-3 text-black' // 34-66: Yellow (using black text)
                            : 'bg-destructive text-destructive-foreground' // 0-33: Red
                      )}>
                        {currentTeacherPercentage}%
                    </Badge>
                </div>
            </div>
          <div className="overflow-x-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px] hidden sm:table-cell">ID</TableHead>
                  <TableHead>Öğrenci Adı</TableHead>
                  <TableHead className="w-[150px] text-center">Kayıt Yeniledi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedTeacherStudents.length > 0 ? (
                  selectedTeacherStudents.map((student) => (
                    <TableRow key={student.id} className="hover:bg-secondary/50 transition-colors duration-150">
                      <TableCell className="font-mono text-xs text-muted-foreground hidden sm:table-cell">{student.id}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell className="text-center">
                         <div className="flex items-center justify-center space-x-2">
                          <Checkbox
                            id={`renewed-${student.id}`}
                            checked={student.renewed}
                            onCheckedChange={() => onRenewalToggle(student.id)}
                            aria-label={`${student.name} için kayıt yenileme durumu`}
                            disabled={!isAdminView} // Disable checkbox if not in admin view
                            className={cn(!isAdminView && "cursor-not-allowed opacity-50")} // Add styling for disabled state
                          />
                           {student.renewed ? (
                              <CheckCircle2 className="h-5 w-5 text-accent" />
                           ) : (
                               <XCircle className="h-5 w-5 text-destructive" />
                           )}
                         </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                       {searchTerm ? 'Aramanızla eşleşen öğrenci bulunamadı.' : 'Bu öğretmen için öğrenci bulunmamaktadır.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

       {/* Show messages only if not in Teacher Detail Page context */}
       {!initialTeacherName && !selectedTeacherName && teachers.length > 0 && (
        <p className="text-center text-muted-foreground py-6">Öğrencileri görmek için lütfen bir öğretmen seçin.</p>
      )}
      {!initialTeacherName && !selectedTeacherName && teachers.length === 0 && (
            <p className="text-center text-muted-foreground py-6">Başlamak için lütfen Admin Panelinden Excel dosyasını yükleyin.</p>
        )}
    </div>
  );
}
