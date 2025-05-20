export interface Student {
  id: number;
  name: string;
  teacherName: string; // Changed from teacherId: number
  renewed: boolean;
  className: string; // Added field for student's class
}

export interface Teacher {
  id: number;
  name: string;
  // Optional: Add other relevant teacher fields if needed
}

// Interface for Teacher with calculated percentage and count, used in Leaderboard
export interface TeacherWithStats extends Teacher {
  renewalPercentage: number;
  studentCount: number;
}
