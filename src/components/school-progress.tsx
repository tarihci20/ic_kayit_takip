
"use client";

import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label"; // Import Label
import { School, Users, CheckCircle, XCircle, Percent } from 'lucide-react'; // Import icons
import { cn } from "@/lib/utils"; // Import cn for conditional classes

interface SchoolProgressProps {
  totalStudents: number;
  renewedStudents: number; // Changed from overallPercentage
}

export function SchoolProgress({ totalStudents, renewedStudents }: SchoolProgressProps) {
  // Validate props to prevent rendering errors with invalid data
  const validTotalStudents = typeof totalStudents === 'number' && !isNaN(totalStudents) ? totalStudents : 0;
  const validRenewedStudents = typeof renewedStudents === 'number' && !isNaN(renewedStudents) ? renewedStudents : 0;

  // Calculate derived values
  const notRenewedStudents = validTotalStudents - validRenewedStudents;
  const overallPercentage = validTotalStudents > 0
    ? Math.round((validRenewedStudents / validTotalStudents) * 100)
    : 0;
  const validOverallPercentage = Math.max(0, Math.min(100, overallPercentage)); // Clamp between 0 and 100

  // Determine colors and variants based on the validated percentage ranges
  const percentageColor = validOverallPercentage >= 67 ? 'text-accent' // 67-100: Green
                       : validOverallPercentage >= 34 ? 'text-chart-3' // 34-66: Yellow (using chart-3)
                       : 'text-destructive'; // 0-33: Red
  const progressVariant = validOverallPercentage >= 67 ? 'bg-accent' // 67-100: Green
                       : validOverallPercentage >= 34 ? 'bg-chart-3' // 34-66: Yellow
                       : 'bg-destructive'; // 0-33: Red


  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-6 md:p-10 rounded-lg w-full">
        <div className="flex items-center space-x-3 text-primary">
             <School className="h-8 w-8" /> {/* Changed icon */}
            <h2 className="text-2xl font-semibold">Okul Geneli İlerleme</h2>
        </div>

      <div className="w-full max-w-2xl text-center space-y-4"> {/* Increased max-width */}
        {/* Use grid for better alignment */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-secondary rounded-lg border">
             {/* Total Students */}
             <div className="flex flex-col items-center p-2">
                <Users className="h-6 w-6 mb-1 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Toplam Öğrenci</p>
                <p className="text-2xl font-bold text-primary">{validTotalStudents}</p>
            </div>
             {/* Renewed Students */}
             <div className="flex flex-col items-center p-2">
                <CheckCircle className="h-6 w-6 mb-1 text-accent" />
                <p className="text-sm text-muted-foreground">Kayıt Yenileyen</p>
                <p className="text-2xl font-bold text-accent">{validRenewedStudents}</p>
            </div>
             {/* Not Renewed Students */}
             <div className="flex flex-col items-center p-2">
                <XCircle className="h-6 w-6 mb-1 text-destructive" />
                <p className="text-sm text-muted-foreground">Yenilemeyen</p>
                <p className="text-2xl font-bold text-destructive">{notRenewedStudents}</p>
            </div>
             {/* Renewal Rate */}
             <div className="flex flex-col items-center p-2">
                <Percent className="h-6 w-6 mb-1 text-muted-foreground" /> {/* Use Percent icon */}
                <p className="text-sm text-muted-foreground">Yenileme Oranı</p>
                <p className={cn('text-2xl font-bold transition-colors duration-300', percentageColor)}>
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
