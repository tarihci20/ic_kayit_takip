
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import type { Student, Teacher } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox, type CheckboxProps } from "@/components/ui/checkbox"; // Import CheckboxProps
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { User, Search, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

interface TeacherDetailsProps {
  teachers: Teacher[];
  students: Student[]; // Students for display (potentially pre-filtered by global search)
  allStudents: Student[]; // All students for accurate percentage calculations
  onRenewalToggle: (studentId: number) => void;
  onBulkRenewalToggle: (studentIds: number[], newRenewedState: boolean) => void; // New prop
  isAdminView?: boolean;
  initialTeacherName?: string;
}

export function TeacherDetails({
    teachers,
    students: studentsForDisplay, // Renamed for clarity
    allStudents,
    onRenewalToggle,
    onBulkRenewalToggle,
    isAdminView = false,
    initialTeacherName
}: TeacherDetailsProps) {
  const [selectedTeacherName, setSelectedTeacherName] = useState<string | undefined>(
    initialTeacherName ?? (isAdminView ? undefined : teachers[0]?.name)
  );
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
       if (initialTeacherName) {
           setSelectedTeacherName(initialTeacherName);
           setSearchTerm('');
       }
   }, [initialTeacherName]);

   useEffect(() => {
    if (!initialTeacherName && isAdminView) {
        const teacherExists = teachers.some(teacher => teacher.name === selectedTeacherName);
        if ((selectedTeacherName && !teacherExists)) {
            setSelectedTeacherName(undefined);
            setSearchTerm('');
        }
    } else if (!initialTeacherName && !isAdminView && teachers.length > 0 && !selectedTeacherName){
        setSelectedTeacherName(teachers[0]?.name);
    }
   }, [teachers, initialTeacherName, selectedTeacherName, isAdminView]);


  const handleTeacherChange = (value: string) => {
    setSelectedTeacherName(value === "ALL_TEACHERS_PLACEHOLDER" ? undefined : value);
    setSearchTerm('');
  };

  const studentsForTable = useMemo(() => {
    let listToFilter = studentsForDisplay;

    if (selectedTeacherName) {
      listToFilter = listToFilter.filter(student => student.teacherName === selectedTeacherName);
    }

    if (searchTerm) {
      return listToFilter.filter(student => student.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return listToFilter;
  }, [selectedTeacherName, studentsForDisplay, searchTerm]);

  const calculateTeacherPercentage = (teacherName: string | undefined): number => {
      if (!teacherName) return 0;
      const teacherStudentsAll = allStudents.filter(student => student.teacherName === teacherName);
      if (teacherStudentsAll.length === 0) return 0;
      const renewedCount = teacherStudentsAll.filter(student => student.renewed).length;
      const percentage = teacherStudentsAll.length > 0 ? (renewedCount / teacherStudentsAll.length) * 100 : 0;
      return Math.round(percentage);
  };

  const currentTeacherPercentage = calculateTeacherPercentage(selectedTeacherName);

  const currentTeacherTotalStudents = useMemo(() => {
    if (!selectedTeacherName) return 0;
    return allStudents.filter(student => student.teacherName === selectedTeacherName).length;
  }, [selectedTeacherName, allStudents]);

  const isAnyStudentInTable = studentsForTable.length > 0;

  const masterCheckboxCheckedState: CheckboxProps['checked'] = useMemo(() => {
    if (!isAnyStudentInTable) return false;
    const allRenewed = studentsForTable.every(s => s.renewed);
    if (allRenewed) return true;
    const someRenewed = studentsForTable.some(s => s.renewed);
    if (someRenewed) return 'indeterminate';
    return false;
  }, [studentsForTable, isAnyStudentInTable]);

  const handleMasterCheckboxChange = (newCheckedStateFromCheckbox: CheckboxProps['checked']) => {
    if (typeof newCheckedStateFromCheckbox === 'boolean') {
        const studentIdsToToggle = studentsForTable.map(s => s.id);
        onBulkRenewalToggle(studentIdsToToggle, newCheckedStateFromCheckbox);
    } else if (newCheckedStateFromCheckbox === 'indeterminate') {
        // Typically, clicking an indeterminate checkbox makes it checked (true)
        const studentIdsToToggle = studentsForTable.map(s => s.id);
        onBulkRenewalToggle(studentIdsToToggle, true);
    }
  };


  return (
    <div className="space-y-6">
       {!initialTeacherName && (
           <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-grow md:flex-grow-0 md:w-1/3">
              <Label htmlFor="teacher-select" className="mb-2 block text-sm font-medium text-foreground">Öğretmen Seçin</Label>
              <Select
                onValueChange={handleTeacherChange}
                value={selectedTeacherName ?? ''}
                disabled={teachers.length === 0 && !isAdminView}
              >
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
               <Label htmlFor="student-search" className="mb-2 block text-sm font-medium text-foreground">
                {selectedTeacherName ? `"${selectedTeacherName}" için Öğrenci Ara`: `Öğrenci Ara (Listede)`}
               </Label>
               <Search className="absolute left-2.5 top-[calc(50%)] -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input
                 id="student-search"
                 type="text"
                 placeholder="Adıyla ara..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="pl-8 w-full h-10"
                 disabled={!isAdminView && !selectedTeacherName && studentsForDisplay.length === 0}
               />
             </div>
           </div>
       )}

      {selectedTeacherName && (
        <div className="mb-4 p-4 bg-secondary rounded-lg border flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div>
                 <h3 className="text-lg font-semibold text-primary">{selectedTeacherName}</h3>
                 <p className="text-sm text-muted-foreground">Sorumlu Olduğu Öğrenci Sayısı: {currentTeacherTotalStudents}</p>
            </div>
            <div className="text-left md:text-right mt-2 md:mt-0">
                 <p className="text-sm font-medium text-foreground">Yenileme Oranı</p>
                  <Badge variant="secondary"
                      className={cn(
                         'text-lg border-transparent',
                         currentTeacherPercentage >= 67 ? 'bg-accent text-accent-foreground'
                        : currentTeacherPercentage >= 34 ? 'bg-chart-3 text-black'
                        : 'bg-destructive text-destructive-foreground'
                  )}>
                    {currentTeacherPercentage}%
                </Badge>
            </div>
        </div>
      )}

      {((isAdminView || selectedTeacherName) || initialTeacherName) && (
        <div className="overflow-x-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px] hidden sm:table-cell">ID</TableHead>
                  <TableHead>Öğrenci Adı</TableHead>
                  {!initialTeacherName && isAdminView && !selectedTeacherName && (
                    <TableHead>Sorumlu Öğretmen</TableHead>
                  )}
                  <TableHead className="w-[180px] text-center"> {/* Increased width for master checkbox */}
                    {isAdminView ? (
                        <div className="flex items-center justify-center space-x-2">
                        <Checkbox
                            id="toggle-all-renewed"
                            checked={masterCheckboxCheckedState}
                            onCheckedChange={handleMasterCheckboxChange}
                            disabled={!isAnyStudentInTable}
                            aria-label="Tüm görünür öğrencilerin kayıt yenileme durumunu toplu değiştir"
                        />
                        <span>Kayıt Yeniledi</span>
                        </div>
                    ) : (
                        "Kayıt Yeniledi"
                    )}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsForTable.length > 0 ? (
                  studentsForTable.map((student) => (
                    <TableRow key={student.id} className="hover:bg-secondary/50 transition-colors duration-150">
                      <TableCell className="font-mono text-xs text-muted-foreground hidden sm:table-cell">{student.id}</TableCell>
                      <TableCell>{student.name}</TableCell>
                       {!initialTeacherName && isAdminView && !selectedTeacherName && (
                        <TableCell>{student.teacherName}</TableCell>
                      )}
                      <TableCell className="text-center">
                         <div className="flex items-center justify-center space-x-2">
                          <Checkbox
                            id={`renewed-${student.id}`}
                            checked={student.renewed}
                            onCheckedChange={() => onRenewalToggle(student.id)}
                            aria-label={`${student.name} için kayıt yenileme durumu`}
                            disabled={!isAdminView}
                            className={cn(!isAdminView && "cursor-not-allowed opacity-50")}
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
                    <TableCell colSpan={!initialTeacherName && isAdminView && !selectedTeacherName ? 4 : 3} className="text-center text-muted-foreground py-6">
                       {searchTerm ? 'Aramanızla eşleşen öğrenci bulunamadı.' : (selectedTeacherName ? 'Bu öğretmen için öğrenci bulunmamaktadır.' : 'Görüntülenecek öğrenci bulunmamaktadır.')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

       {!initialTeacherName && !selectedTeacherName && isAdminView && studentsForDisplay.length === 0 && !searchTerm && (
            <p className="text-center text-muted-foreground py-6">Başlamak için lütfen Admin Panelinden Excel dosyasını yükleyin veya genel aramayı kullanın.</p>
       )}
       {!initialTeacherName && !selectedTeacherName && !isAdminView && teachers.length > 0 && (
        <p className="text-center text-muted-foreground py-6">Öğrencileri görmek için lütfen bir öğretmen seçin.</p>
      )}
      {!initialTeacherName && !isAdminView && teachers.length === 0 && (
            <p className="text-center text-muted-foreground py-6">Başlamak için lütfen Admin Panelinden Excel dosyasını yükleyin.</p>
        )}
    </div>
  );
}
