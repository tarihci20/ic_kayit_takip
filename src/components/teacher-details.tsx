
"use client";

import React, { useState, useMemo } from 'react';
import type { Student, Teacher } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { User, Search, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from "@/lib/utils"; // Import cn

interface TeacherDetailsProps {
  teachers: Teacher[];
  students: Student[];
  onRenewalToggle: (studentId: number) => void;
  isAdminView?: boolean; // Add prop to differentiate admin view
}

export function TeacherDetails({ teachers, students, onRenewalToggle, isAdminView = false }: TeacherDetailsProps) {
  // Store selected teacher's name instead of ID
  const [selectedTeacherName, setSelectedTeacherName] = useState<string | undefined>(teachers[0]?.name);
  const [searchTerm, setSearchTerm] = useState('');

  const handleTeacherChange = (value: string) => {
    setSelectedTeacherName(value);
    setSearchTerm(''); // Reset search when teacher changes
  };

  const selectedTeacherStudents = useMemo(() => {
    if (!selectedTeacherName) return [];
    return students
      .filter(student => student.teacherName === selectedTeacherName) // Filter by teacherName
      .filter(student => student.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [selectedTeacherName, students, searchTerm]);

  const calculateTeacherPercentage = (teacherName: string | undefined): number => {
      if (!teacherName) return 0;
      const teacherStudentsAll = students.filter(student => student.teacherName === teacherName); // Filter by teacherName
      if (teacherStudentsAll.length === 0) return 0;
      const renewedCount = teacherStudentsAll.filter(student => student.renewed).length;
      return Math.round((renewedCount / teacherStudentsAll.length) * 100);
  };

  const currentTeacherPercentage = calculateTeacherPercentage(selectedTeacherName);
  const currentTeacherStudentCount = selectedTeacherName ? students.filter(s => s.teacherName === selectedTeacherName).length : 0;


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-grow md:flex-grow-0 md:w-1/3">
          <Label htmlFor="teacher-select" className="mb-2 block text-sm font-medium text-foreground">Öğretmen Seçin</Label>
          <Select onValueChange={handleTeacherChange} value={selectedTeacherName} disabled={teachers.length === 0}>
            <SelectTrigger id="teacher-select" className="w-full">
              <div className="flex items-center gap-2">
                 <User className="h-4 w-4 text-muted-foreground" />
                 <SelectValue placeholder="Bir öğretmen seçin..." />
              </div>
            </SelectTrigger>
            <SelectContent>
              {teachers.map((teacher) => (
                // Use teacher name as value
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
           <Search className="absolute left-2.5 top-[calc(1.5rem+0.5rem+2px)] h-4 w-4 text-muted-foreground" /> {/* Adjusted top positioning */}
           <Input
             id="student-search"
             type="text"
             placeholder="Öğrenci adıyla ara..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="pl-8 w-full" // Add padding for icon
             disabled={!selectedTeacherName} // Disable if no teacher selected
           />
         </div>
      </div>

      {selectedTeacherName && ( // Check if a teacher name is selected
        <div>
            <div className="mb-4 p-4 bg-secondary rounded-lg border flex flex-col md:flex-row justify-between items-center">
                <div>
                     <h3 className="text-lg font-semibold text-primary">{selectedTeacherName}</h3> {/* Display selected teacher name */}
                     <p className="text-sm text-muted-foreground">Sorumlu Olduğu Öğrenci Sayısı: {currentTeacherStudentCount}</p>
                </div>
                <div className="text-right mt-2 md:mt-0">
                     <p className="text-sm font-medium text-foreground">Yenileme Oranı</p>
                      <Badge variant={currentTeacherPercentage >= 90 ? "default" : "secondary"} className={cn('text-lg', currentTeacherPercentage >= 90 ? 'bg-accent text-accent-foreground' : currentTeacherPercentage >= 50 ? 'bg-primary text-primary-foreground' : 'bg-destructive text-destructive-foreground' )}>
                        {currentTeacherPercentage}%
                    </Badge>
                </div>
            </div>
          <div className="overflow-x-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Öğrenci Adı</TableHead>
                  <TableHead className="w-[150px] text-center">Kayıt Yeniledi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedTeacherStudents.length > 0 ? (
                  selectedTeacherStudents.map((student) => (
                    <TableRow key={student.id} className="hover:bg-secondary/50 transition-colors duration-150">
                      <TableCell className="font-mono text-xs text-muted-foreground">{student.id}</TableCell>
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

      {!selectedTeacherName && teachers.length > 0 && (
        <p className="text-center text-muted-foreground py-6">Öğrencileri görmek için lütfen bir öğretmen seçin.</p>
      )}
        {!selectedTeacherName && teachers.length === 0 && (
            <p className="text-center text-muted-foreground py-6">Başlamak için lütfen Excel dosyasını yükleyin.</p>
        )}
    </div>
  );
}
