
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import type { Student, Teacher } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox, type CheckboxProps } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { User, Search, CheckCircle2, XCircle, Users, UserCheck, UserX, BookOpen, Landmark } from 'lucide-react';
import { cn } from "@/lib/utils";

interface TeacherDetailsProps {
  teachers: Teacher[];
  students: Student[]; // This is studentsForDisplay (potentially globally searched)
  allStudents: Student[]; // This is the full, unfiltered list of all students
  onRenewalToggle: (studentId: number) => void;
  onBulkRenewalToggle: (studentIds: number[], newRenewedState: boolean) => void;
  isAdminView?: boolean;
  initialTeacherName?: string;
}

export function TeacherDetails({
    teachers,
    students: studentsForDisplay, // Renamed for clarity within the component
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
           setSearchTerm(''); // Reset local search when initialTeacherName changes
       }
   }, [initialTeacherName]);

   useEffect(() => {
    // Adjust selectedTeacherName if it becomes invalid due to changes in the teachers list
    // or when switching views if not pre-selected by initialTeacherName
    if (!initialTeacherName && isAdminView) {
        const teacherExists = teachers.some(teacher => teacher.name === selectedTeacherName);
        if ((selectedTeacherName && !teacherExists)) {
            setSelectedTeacherName(undefined); // Deselect if teacher no longer exists
            setSearchTerm('');
        }
    } else if (!initialTeacherName && !isAdminView && teachers.length > 0 && !teachers.some(t => t.name === selectedTeacherName)){
        // For non-admin view, if no teacher is selected or current selection is invalid, select the first teacher
        setSelectedTeacherName(teachers[0]?.name);
        setSearchTerm('');
    }
   }, [teachers, initialTeacherName, selectedTeacherName, isAdminView]);


  const handleTeacherChange = (value: string) => {
    setSelectedTeacherName(value === "ALL_TEACHERS_PLACEHOLDER" ? undefined : value);
    setSearchTerm(''); // Reset local search term when teacher selection changes
  };

  // This list is for calculating stats for a selected teacher, or for direct display if not grouping.
  const studentsToProcess = useMemo(() => {
    let listToFilter = studentsForDisplay; // Start with students passed from admin (globally searched) or all students for teacher page

    if (selectedTeacherName) { // If a specific teacher is selected (either by prop or dropdown)
      listToFilter = studentsForDisplay.filter(student => student.teacherName === selectedTeacherName);
    }
    // If no teacher selected (selectedTeacherName is undefined), listToFilter remains studentsForDisplay (all globally searched students)

    if (searchTerm) { // Apply local search term
      return listToFilter.filter(student => student.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return listToFilter;
  }, [selectedTeacherName, studentsForDisplay, searchTerm]);


  const teacherStats = useMemo(() => {
    // Stats should be based on ALL students for the selected teacher, not the potentially filtered 'studentsForDisplay'
    if (!selectedTeacherName || !allStudents || allStudents.length === 0) {
        // If no teacher is selected, or no students exist, return zero stats
        // This case might need adjustment if we want stats for "all students" view
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


  const isAnyStudentInTable = studentsToProcess.length > 0;

  const masterCheckboxCheckedState: CheckboxProps['checked'] = useMemo(() => {
    if (!isAnyStudentInTable) return false;
    // For master checkbox, consider only students currently in `studentsToProcess` (visible in table after filters)
    const allRenewed = studentsToProcess.every(s => s.renewed);
    if (allRenewed) return true;
    const someRenewed = studentsToProcess.some(s => s.renewed);
    if (someRenewed) return 'indeterminate';
    return false;
  }, [studentsToProcess, isAnyStudentInTable]);

  const handleMasterCheckboxChange = (newCheckedStateFromCheckbox: CheckboxProps['checked']) => {
    if (typeof newCheckedStateFromCheckbox === 'boolean') {
        const studentIdsToToggle = studentsToProcess.map(s => s.id); // Toggle only visible/filtered students
        onBulkRenewalToggle(studentIdsToToggle, newCheckedStateFromCheckbox);
    } else if (newCheckedStateFromCheckbox === 'indeterminate') {
        const studentIdsToToggle = studentsToProcess.map(s => s.id);
        onBulkRenewalToggle(studentIdsToToggle, true);
    }
  };

  const groupedStudentsForAdminView = useMemo(() => {
    if (isAdminView && !selectedTeacherName) { // Only group if admin view and no specific teacher is selected
        const grouped = studentsToProcess.reduce((acc, student) => {
            const classNameKey = student.className || "Belirtilmemiş";
            if (!acc[classNameKey]) {
                acc[classNameKey] = [];
            }
            acc[classNameKey].push(student);
            return acc;
        }, {} as Record<string, Student[]>);

        return Object.entries(grouped).sort(([classA], [classB]) => {
            if (classA === "Belirtilmemiş") return 1;
            if (classB === "Belirtilmemiş") return -1;
            const numA = parseInt(classA);
            const numB = parseInt(classB);
            if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
            return classA.localeCompare(classB);
        });
    }
    return null; // Not grouping
  }, [isAdminView, selectedTeacherName, studentsToProcess]);

  const showSorumluOgretmenColumn = !initialTeacherName && isAdminView && !selectedTeacherName;
  const colSpanCount = showSorumluOgretmenColumn ? 5 : 4;


  return (
    <div className="space-y-6">
       {!initialTeacherName && ( // Do not show teacher select if a teacher is pre-selected via URL
           <div className="flex flex-col md:flex-row md:items-end gap-4">
            {isAdminView && ( // Only show teacher select in admin view
                 <div className="flex-grow md:flex-grow-0 md:w-1/3">
                   <Label htmlFor="teacher-select" className="mb-2 block text-sm font-medium text-foreground">Öğretmen Seçin</Label>
                   <Select
                     onValueChange={handleTeacherChange}
                     value={selectedTeacherName ?? "ALL_TEACHERS_PLACEHOLDER"} // Use a placeholder value for "all"
                     disabled={teachers.length === 0 && !isAdminView}
                   >
                     <SelectTrigger id="teacher-select" className="w-full">
                       <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Tüm Öğrenciler..." />
                       </div>
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="ALL_TEACHERS_PLACEHOLDER">Tüm Öğrenciler</SelectItem>
                       {teachers.map((teacher) => (
                         <SelectItem key={teacher.id} value={teacher.name}>
                           {teacher.name}
                         </SelectItem>
                       ))}
                        {teachers.length === 0 && <SelectItem value="no-teacher" disabled>Öğretmen yok</SelectItem>}
                     </SelectContent>
                   </Select>
                 </div>
            )}
             <div className="relative flex-grow">
               <Label htmlFor="student-search" className="mb-2 block text-sm font-medium text-foreground">
                {selectedTeacherName ? `"${selectedTeacherName}" Sorumluluğundaki Öğrencilerde Ara`: `Listede Öğrenci Ara`}
               </Label>
               <Search className="absolute left-2.5 top-[calc(50%)] -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input
                 id="student-search"
                 type="text"
                 placeholder="Adıyla ara..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="pl-8 w-full h-10"
                 // Disable if not admin view AND no teacher is selected AND no students passed for display
                 // OR if admin view AND no teacher is selected AND no students for display (e.g. before initial load)
                 disabled={(!isAdminView && !selectedTeacherName && studentsForDisplay.length === 0) || (isAdminView && studentsForDisplay.length === 0 && !selectedTeacherName)}
               />
             </div>
           </div>
       )}

      {selectedTeacherName && ( // Show stats only if a specific teacher is selected
        <div className="mb-4 p-4 bg-secondary rounded-lg border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-grow">
            <h3 className="text-lg font-semibold text-primary mb-3">{selectedTeacherName}</h3>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:gap-x-6 flex-wrap">
              <div className="flex items-center text-sm gap-1.5">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">Sorumlu Öğrenci:</span>
                <span className="font-semibold text-primary text-base">{teacherStats.total}</span>
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

      {(isAdminView || selectedTeacherName || initialTeacherName) && ( // Render table if admin, or a teacher is selected/pre-selected
        <div className="overflow-x-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px] hidden sm:table-cell">ID</TableHead>
                  <TableHead>Öğrenci Adı</TableHead>
                  <TableHead>Sınıf</TableHead>
                  {showSorumluOgretmenColumn && (
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
                {groupedStudentsForAdminView ? ( // If admin view and no teacher selected, render grouped students
                  groupedStudentsForAdminView.length > 0 ? (
                    groupedStudentsForAdminView.map(([className, classStudents]) => (
                      <React.Fragment key={className}>
                        <TableRow className="bg-muted/70 hover:bg-muted/70 sticky top-0 z-10">
                          <TableCell colSpan={colSpanCount} className="font-semibold text-primary py-2.5 px-4">
                            <div className="flex items-center gap-2">
                                <Landmark size={16} />
                                {className === "Belirtilmemiş" ? className : `${className}. Sınıflar`} ({classStudents.length} öğrenci)
                            </div>
                          </TableCell>
                        </TableRow>
                        {classStudents.map((student) => (
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
                             {showSorumluOgretmenColumn && (
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
                        ))}
                      </React.Fragment>
                    ))
                  ) : (
                     <TableRow>
                        <TableCell colSpan={colSpanCount} className="text-center text-muted-foreground py-6">
                           {searchTerm ? 'Aramanızla eşleşen öğrenci bulunamadı.' : 'Görüntülenecek öğrenci bulunmamaktadır.'}
                        </TableCell>
                     </TableRow>
                  )
                ) : studentsToProcess.length > 0 ? ( // If specific teacher selected or not admin view, render flat list
                  studentsToProcess.map((student) => (
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
                       {showSorumluOgretmenColumn && ( // This condition will be false here unless selectedTeacherName is also undefined
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
                ) : ( // No students to show in any case
                  <TableRow>
                    <TableCell colSpan={colSpanCount} className="text-center text-muted-foreground py-6">
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
       {!initialTeacherName && !selectedTeacherName && !isAdminView && teachers.length > 0 && ( // Non-admin, no specific teacher, but teachers exist
        <p className="text-center text-muted-foreground py-6">Öğrencileri görmek için lütfen bir öğretmen seçin.</p>
      )}
      {!initialTeacherName && !isAdminView && teachers.length === 0 && ( // Non-admin, no teachers loaded
            <p className="text-center text-muted-foreground py-6">Başlamak için lütfen Admin Panelinden Excel dosyasını yükleyin.</p>
        )}
    </div>
  );
}
