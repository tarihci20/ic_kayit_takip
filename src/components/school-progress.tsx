
"use client";

import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label"; // Import Label
import { School, Users, TrendingUp } from 'lucide-react';
import { cn } from "@/lib/utils"; // Import cn for conditional classes

interface SchoolProgressProps {
  totalStudents: number;
  overallPercentage: number;
}

export function SchoolProgress({ totalStudents, overallPercentage }: SchoolProgressProps) {
  // Validate props to prevent rendering errors with invalid data
  const validTotalStudents = typeof totalStudents === 'number' && !isNaN(totalStudents) ? totalStudents : 0;
  const validOverallPercentage = typeof overallPercentage === 'number' && !isNaN(overallPercentage) && isFinite(overallPercentage)
    ? Math.max(0, Math.min(100, overallPercentage)) // Clamp between 0 and 100
    : 0;

  // Determine colors and variants based on the validated percentage
  const percentageColor = validOverallPercentage >= 80 ? 'text-accent' : validOverallPercentage >= 50 ? 'text-primary' : 'text-destructive';
  const progressVariant = validOverallPercentage >= 80 ? 'bg-accent' : validOverallPercentage >= 50 ? 'bg-primary' : 'bg-destructive';


  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-6 md:p-10 rounded-lg w-full">
        <div className="flex items-center space-x-3 text-primary">
             <TrendingUp className="h-8 w-8" />
            <h2 className="text-2xl font-semibold">Okul Geneli İlerleme</h2>
        </div>

      <div className="w-full max-w-md text-center space-y-4">
        <div className="flex justify-around items-center p-4 bg-secondary rounded-lg border">
             <div className="flex flex-col items-center">
                <Users className="h-6 w-6 mb-1 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Toplam Öğrenci</p>
                <p className="text-2xl font-bold text-primary">{validTotalStudents}</p>
            </div>
             <div className="flex flex-col items-center">
                <School className="h-6 w-6 mb-1 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Yenileme Oranı</p>
                <p className={cn('text-4xl font-bold transition-colors duration-300', percentageColor)}>
                    {validOverallPercentage}%
                </p>
            </div>
        </div>


        <div className="w-full pt-4">
           <Label htmlFor="school-progress-bar" className="sr-only">Okul Geneli Kayıt Yenileme İlerlemesi</Label>
            <Progress
                id="school-progress-bar"
                value={validOverallPercentage} // Use validated percentage
                className="h-4 w-full"
                indicatorClassName={cn(progressVariant, 'transition-all duration-500 ease-out')} // Apply color and transition
                aria-label={`Okul geneli kayıt yenileme oranı %${validOverallPercentage}`}
            />
        </div>
      </div>

       <p className="text-sm text-muted-foreground text-center max-w-md">
         Bu bölüm, okuldaki tüm öğrencilerin kayıt yenileme durumunu genel bir bakış açısıyla sunar.
       </p>
    </div>
  );
}

// Extend Progress component props if needed for indicatorClassName
// This was likely done in a previous step, but kept here for reference.
// Ensure `src/components/ui/progress.tsx` includes the `indicatorClassName` prop.
/*
declare module "@/components/ui/progress" {
  interface ProgressProps {
    indicatorClassName?: string;
  }
}
*/
