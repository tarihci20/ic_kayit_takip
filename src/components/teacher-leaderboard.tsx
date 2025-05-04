"use client";

import React from 'react';
import type { TeacherWithStats } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, ArrowUp, ArrowDown, Minus } from 'lucide-react';

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

  // Example: Store previous ranking in state or fetch from history if needed
  // For now, we'll just show rank without change indicators
  // const getRankChange = (teacherId: number): React.ReactNode => {
  //   // Placeholder logic - replace with actual rank change calculation
  //   const change = Math.random() > 0.6 ? 1 : (Math.random() > 0.3 ? -1 : 0);
  //   if (change > 0) return <ArrowUp className="h-4 w-4 text-accent" />;
  //   if (change < 0) return <ArrowDown className="h-4 w-4 text-destructive" />;
  //   return <Minus className="h-4 w-4 text-muted-foreground" />;
  // };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Sıra</TableHead>
            {/* <TableHead className="w-[50px]">Değişim</TableHead> */}
            <TableHead>Öğretmen</TableHead>
            <TableHead className="w-[100px] text-center">Öğrenci Sayısı</TableHead>
            <TableHead className="w-[200px]">Yenileme Yüzdesi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachers.map((teacher, index) => (
            <TableRow key={teacher.id} className="hover:bg-secondary/50 transition-colors duration-150">
              <TableCell className="font-medium flex items-center justify-center h-full">{getMedal(index)}</TableCell>
              {/* <TableCell className="flex items-center justify-center h-full">{getRankChange(teacher.id)}</TableCell> */}
              <TableCell>{teacher.name}</TableCell>
              <TableCell className="text-center">{teacher.studentCount}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Progress
                    value={teacher.renewalPercentage}
                    className="h-3 flex-grow"
                    aria-label={`${teacher.name} yenileme yüzdesi ${teacher.renewalPercentage}`}
                   />
                  <Badge variant={teacher.renewalPercentage > 80 ? "default" : teacher.renewalPercentage > 50 ? "secondary" : "outline"} className={`w-16 text-center justify-center transition-colors duration-300 ${teacher.renewalPercentage >= 90 ? 'bg-accent text-accent-foreground' : ''}`}>
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
