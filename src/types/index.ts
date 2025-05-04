export interface Student {
  id: number;
  name: string;
  teacherId: number;
  renewed: boolean;
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
