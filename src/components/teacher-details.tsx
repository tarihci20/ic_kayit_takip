
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import type { Student, Teacher } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox, type CheckboxProps } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { User, Search, CheckCircle2, XCircle, Users, UserCheck, UserX, BookOpen } from 'lucide-react';
import { cn } from "@/lib/utils";

interface TeacherDetailsProps {
  teachers: Teacher[];
  students: Student[];
  allStudents: Student[];
  onRenewalToggle: (studentId: number) => void;
  onBulkRenewalToggle: (studentIds: number[], newRenewedState: boolean) => void;
  isAdminView?: boolean;
  initialTeacherName?: string;
}

export function TeacherDetails({
    teachers,
    students: studentsForDisplay,
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

  const teacherStats = useMemo(() => {
    if (!selectedTeacherName || !allStudents || allStudents.length === 0) {
        return { percentage: 0, total: 0, renewed: 0, notRenewed: 0 };
    }
    
    const teacherStudentsAll = allStudents.filter(student => student.teacherName === selectedTeacherName);
    const total = teacherStudentsAll.length;
    if (total === 0) return { percentage: 0, total: 0, renewed: 0, notRenewed: 0 };

    const renewed = teacherStudentsAll.filter(student => student.renewed).length;
    const notRenewed = total - renewed;
    const percentage = Math.round((renewed / total) * 100);
    
    return { percentage, total, renewed, notRenewed };
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
        // If indeterminate, clicking should mark all as true
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
        <div className="mb-4 p-4 bg-secondary rounded-lg border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-grow">
            <h3 className="text-lg font-semibold text-primary mb-3">{selectedTeacherName}</h3>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:gap-x-6 flex-wrap">
              <div className="flex items-center text-sm gap-1.5"> {/* Increased gap slightly */}
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">Sorumlu Öğrenci:</span>
                <span className="font-semibold text-primary text-base">{teacherStats.total}</span> {/* Made number larger */}
              </div>
              <div className="flex items-center text-sm gap-1.5">
                <UserCheck className="h-5 w-5 text-accent" />
                <span className="text-muted-foreground">Yenileyen:</span>
                <span className="font-semibold text-accent text-base">{teacherStats.renewed}</span>
              </div>
              <div className="flex items-center text-sm gap-1.5">
                <UserX className="h-5 w-5 text-destructive" />
                <span className="text-muted-foreground">Yenilemeyen:</span>
                <span className="font-semibold text-destructive text-base">{teacherStats.notRenewed}</span>
              </div>
            </div>
          </div>
          <div className="text-left md:text-right mt-4 md:mt-0 self-start md:self-center">
            <p className="text-sm font-medium text-foreground mb-1">Yenileme Oranı</p>
            <Badge 
              className={cn(
              'text-xl font-bold px-3 py-1 border-transparent', 
              teacherStats.percentage >= 67 ? 'bg-accent text-accent-foreground'
              : teacherStats.percentage >= 34 ? 'bg-chart-3 text-black' 
              : 'bg-destructive text-destructive-foreground'
            )}>
              {teacherStats.percentage}%
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
                  <TableHead>Sınıf</TableHead>
                  {!initialTeacherName && isAdminView && !selectedTeacherName && (
                    <TableHead>Sorumlu Öğretmen</TableHead>
                  )}
                  <TableHead className="w-[180px] text-center">
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
                    <TableRow 
                        key={student.id} 
                        className={cn(
                            "transition-colors duration-150",
                            student.renewed 
                                ? "bg-accent/10 hover:bg-accent/20" 
                                : "bg-destructive/10 hover:bg-destructive/20"
                        )}
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground hidden sm:table-cell">{student.id}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>
                        {student.className ? (
                             <Badge variant="outline" className="flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                {student.className}
                             </Badge>
                        ) : (
                            '-'
                        )}
                      </TableCell>
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
                    <TableCell colSpan={!initialTeacherName && isAdminView && !selectedTeacherName ? 5 : 4} className="text-center text-muted-foreground py-6">
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
