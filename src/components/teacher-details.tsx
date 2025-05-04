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

interface TeacherDetailsProps {
  teachers: Teacher[];
  students: Student[];
  onRenewalToggle: (studentId: number) => void;
}

export function TeacherDetails({ teachers, students, onRenewalToggle }: TeacherDetailsProps) {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | undefined>(teachers[0]?.id.toString());
  const [searchTerm, setSearchTerm] = useState('');

  const handleTeacherChange = (value: string) => {
    setSelectedTeacherId(value);
    setSearchTerm(''); // Reset search when teacher changes
  };

  const selectedTeacherStudents = useMemo(() => {
    if (!selectedTeacherId) return [];
    const teacherIdNum = parseInt(selectedTeacherId, 10);
    return students
      .filter(student => student.teacherId === teacherIdNum)
      .filter(student => student.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [selectedTeacherId, students, searchTerm]);

  const calculateTeacherPercentage = (teacherId: number | undefined): number => {
      if (!teacherId) return 0;
      const teacherStudentsAll = students.filter(student => student.teacherId === teacherId);
      if (teacherStudentsAll.length === 0) return 0;
      const renewedCount = teacherStudentsAll.filter(student => student.renewed).length;
      return Math.round((renewedCount / teacherStudentsAll.length) * 100);
  };

  const currentTeacherPercentage = selectedTeacherId ? calculateTeacherPercentage(parseInt(selectedTeacherId, 10)) : 0;
  const currentTeacherStudentCount = selectedTeacherId ? students.filter(s => s.teacherId === parseInt(selectedTeacherId, 10)).length : 0;
  const currentTeacherName = teachers.find(t => t.id.toString() === selectedTeacherId)?.name;


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-grow md:flex-grow-0 md:w-1/3">
          <Label htmlFor="teacher-select" className="mb-2 block text-sm font-medium text-foreground">Öğretmen Seçin</Label>
          <Select onValueChange={handleTeacherChange} value={selectedTeacherId} disabled={teachers.length === 0}>
            <SelectTrigger id="teacher-select" className="w-full">
              <div className="flex items-center gap-2">
                 <User className="h-4 w-4 text-muted-foreground" />
                 <SelectValue placeholder="Bir öğretmen seçin..." />
              </div>
            </SelectTrigger>
            <SelectContent>
              {teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id.toString()}>
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
             disabled={!selectedTeacherId}
           />
         </div>
      </div>

      {selectedTeacherId && (
        <div>
            <div className="mb-4 p-4 bg-secondary rounded-lg border flex flex-col md:flex-row justify-between items-center">
                <div>
                     <h3 className="text-lg font-semibold text-primary">{currentTeacherName}</h3>
                     <p className="text-sm text-muted-foreground">Sorumlu Olduğu Öğrenci Sayısı: {currentTeacherStudentCount}</p>
                </div>
                <div className="text-right mt-2 md:mt-0">
                     <p className="text-sm font-medium text-foreground">Yenileme Oranı</p>
                      <Badge variant={currentTeacherPercentage >= 90 ? "default" : "secondary"} className={`text-lg ${currentTeacherPercentage >= 90 ? 'bg-accent text-accent-foreground' : ''}`}>
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

      {!selectedTeacherId && teachers.length > 0 && (
        <p className="text-center text-muted-foreground py-6">Öğrencileri görmek için lütfen bir öğretmen seçin.</p>
      )}
        {!selectedTeacherId && teachers.length === 0 && (
            <p className="text-center text-muted-foreground py-6">Başlamak için lütfen Excel dosyasını yükleyin.</p>
        )}
    </div>
  );
}
