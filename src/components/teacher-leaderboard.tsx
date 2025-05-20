
"use client";

import React from 'react';
import type { TeacherWithStats } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy } from 'lucide-react';
import { cn } from "@/lib/utils";
import Link from 'next/link'; // Import Link

interface TeacherLeaderboardProps {
  teachers: TeacherWithStats[];
}

export function TeacherLeaderboard({ teachers }: TeacherLeaderboardProps) {

  const getMedal = (index: number): React.ReactNode => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" aria-label="Birinci"/>;
    if (index === 1) return <Trophy className="h-5 w-5 text-gray-400" aria-label="İkinci"/>;
    if (index === 2) return <Trophy className="h-5 w-5 text-orange-600" aria-label="Üçüncü"/>;
    return <span className="w-5 text-center text-muted-foreground">{index + 1}</span>; // Rank number for others
  };

  const getRowClass = (index: number): string => {
    if (index === 0) return "bg-yellow-100/70 dark:bg-yellow-800/30"; // Gold
    if (index === 1) return "bg-slate-200/70 dark:bg-slate-700/30"; // Silver
    if (index === 2) return "bg-orange-200/70 dark:bg-orange-800/30"; // Bronze
    return "";
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Sıra</TableHead>
            <TableHead>Öğretmen</TableHead>
            <TableHead className="w-[100px] text-center">Öğrenci Sayısı</TableHead>
            <TableHead className="w-[200px]">Yenileme Yüzdesi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachers.map((teacher, index) => (
            <React.Fragment key={teacher.id}>
              <TableRow 
                className={cn(
                  "hover:bg-secondary/50 transition-colors duration-150",
                  getRowClass(index)
                )}
              >
                <TableCell className="font-medium flex items-center justify-center h-full">{getMedal(index)}</TableCell>
                <TableCell>
                  <Link href={`/teacher/${encodeURIComponent(teacher.name)}`} passHref legacyBehavior>
                    <a className="text-primary hover:underline font-medium cursor-pointer">
                      {teacher.name}
                    </a>
                  </Link>
                </TableCell>
                <TableCell className="text-center">{teacher.studentCount}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Progress
                      value={teacher.renewalPercentage}
                      className="h-3 flex-grow"
                      indicatorClassName={cn(
                          teacher.renewalPercentage >= 67 ? 'bg-accent'
                         : teacher.renewalPercentage >= 34 ? 'bg-chart-3'
                         : 'bg-destructive',
                           'transition-all duration-500 ease-out'
                      )}
                      aria-label={`${teacher.name} yenileme yüzdesi ${teacher.renewalPercentage}`}
                     />
                    <Badge
                      variant="outline"
                      className={cn(
                          'w-16 text-center justify-center transition-colors duration-300 border-transparent', 
                          teacher.renewalPercentage >= 67 ? 'bg-accent text-accent-foreground'
                         : teacher.renewalPercentage >= 34 ? 'bg-chart-3 text-black' 
                         : 'bg-destructive text-destructive-foreground'
                      )}
                    >
                       {teacher.renewalPercentage}%
                    </Badge>
                  </div>
                </TableCell>
              </TableRow>
              {index === 2 && teachers.length > 3 && (
                <TableRow className="border-t-2 border-border hover:bg-transparent focus:bg-transparent">
                  <TableCell colSpan={4} className="h-3 p-0 text-center text-xs text-muted-foreground/80 bg-muted/30">
                    {/* Optional: Add a subtle text like "Diğer Sıralamalar" or leave empty for just a visual break */}
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
       {teachers.length === 0 && (
         <p className="text-center text-muted-foreground py-6">Görüntülenecek öğretmen verisi bulunmamaktadır.</p>
      )}
    </div>
  );
}
