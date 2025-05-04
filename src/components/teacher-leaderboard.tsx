
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
            <TableRow key={teacher.id} className="hover:bg-secondary/50 transition-colors duration-150">
              <TableCell className="font-medium flex items-center justify-center h-full">{getMedal(index)}</TableCell>
              <TableCell>
                {/* Wrap teacher name in Link */}
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
                        teacher.renewalPercentage >= 67 ? 'bg-accent' // 67-100: Green
                       : teacher.renewalPercentage >= 34 ? 'bg-chart-3' // 34-66: Yellow
                       : 'bg-destructive', // 0-33: Red
                         'transition-all duration-500 ease-out'
                    )} // Use color based on percentage for progress bar
                    aria-label={`${teacher.name} yenileme yüzdesi ${teacher.renewalPercentage}`}
                   />
                  <Badge
                    variant="outline" // Use outline as base
                    className={cn(
                        'w-16 text-center justify-center transition-colors duration-300 border-transparent', // Make border transparent
                        teacher.renewalPercentage >= 67 ? 'bg-accent text-accent-foreground' // 67-100: Green
                       : teacher.renewalPercentage >= 34 ? 'bg-chart-3 text-black' // 34-66: Yellow (using black text for contrast)
                       : 'bg-destructive text-destructive-foreground' // 0-33: Red
                    )}
                  >
                     {teacher.renewalPercentage}%
                  </Badge>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
       {teachers.length === 0 && (
         <p className="text-center text-muted-foreground py-6">Görüntülenecek öğretmen verisi bulunmamaktadır.</p>
      )}
    </div>
  );
}
