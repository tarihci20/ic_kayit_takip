
// src/services/firestoreService.ts
import {
  collection,
  doc,
  getDocs,
  writeBatch,
  updateDoc,
  // query, // Not currently used
  // where, // Not currently used
  // deleteDoc, // Not currently used
  // runTransaction // Not currently used
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Student, Teacher } from '@/types';

const STUDENTS_COLLECTION = 'students';
const TEACHERS_COLLECTION = 'teachers';

export async function getStudents(): Promise<Student[]> {
  try {
    const snapshot = await getDocs(collection(db, STUDENTS_COLLECTION));
    console.log(`[FirestoreService] Fetched ${snapshot.docs.length} students from Firestore.`);
    return snapshot.docs.map(doc => doc.data() as Student);
  } catch (error) {
    console.error("[FirestoreService] Error fetching students: ", error);
    throw new Error("Öğrenci verileri alınamadı.");
  }
}

export async function getTeachers(): Promise<Teacher[]> {
  try {
    const snapshot = await getDocs(collection(db, TEACHERS_COLLECTION));
    console.log(`[FirestoreService] Fetched ${snapshot.docs.length} teachers from Firestore.`);
    return snapshot.docs.map(doc => doc.data() as Teacher);
  } catch (error) {
    console.error("[FirestoreService] Error fetching teachers: ", error);
    throw new Error("Öğretmen verileri alınamadı.");
  }
}

export async function uploadStudentsAndTeachers(students: Student[], teachers: Teacher[]): Promise<void> {
  console.log(`[FirestoreService] Attempting to upload ${students.length} students and ${teachers.length} teachers.`);
  const batch = writeBatch(db);

  try {
    console.log("[FirestoreService] Fetching old data for deletion...");
    const oldStudentsSnap = await getDocs(collection(db, STUDENTS_COLLECTION));
    oldStudentsSnap.forEach(docSnap => batch.delete(docSnap.ref));
    console.log(`[FirestoreService] Added ${oldStudentsSnap.size} student delete operations to batch.`);

    const oldTeachersSnap = await getDocs(collection(db, TEACHERS_COLLECTION));
    oldTeachersSnap.forEach(docSnap => batch.delete(docSnap.ref));
    console.log(`[FirestoreService] Added ${oldTeachersSnap.size} teacher delete operations to batch.`);

  } catch (error) {
    // This error means we couldn't even check for old data.
    // It's safer to stop the process if we can't guarantee a clean slate as intended.
    console.error("[FirestoreService] Critical error fetching old data for deletion: ", error);
    throw new Error("Eski veriler silinirken kritik bir hata oluştu. Yükleme iptal edildi.");
  }

  students.forEach(student => {
    const studentRef = doc(db, STUDENTS_COLLECTION, student.id.toString());
    batch.set(studentRef, student);
  });
  console.log(`[FirestoreService] Added ${students.length} student set operations to batch.`);

  teachers.forEach(teacher => {
    const teacherRef = doc(db, TEACHERS_COLLECTION, teacher.id.toString());
    batch.set(teacherRef, teacher);
  });
  console.log(`[FirestoreService] Added ${teachers.length} teacher set operations to batch.`);

  try {
    console.log("[FirestoreService] Committing batch...");
    await batch.commit();
    console.log("[FirestoreService] Batch commit successful.");
  } catch (error) {
    console.error("[FirestoreService] Error committing batch upload: ", error);
    throw new Error("Veriler Firestore'a yüklenirken bir hata oluştu.");
  }
}

export async function updateStudentRenewal(studentId: number, renewed: boolean): Promise<void> {
  const studentRef = doc(db, STUDENTS_COLLECTION, studentId.toString());
  try {
    await updateDoc(studentRef, { renewed });
  } catch (error) {
    console.error(`[FirestoreService] Error updating student renewal status for ${studentId}: `, error);
    throw new Error("Öğrenci kayıt durumu güncellenemedi.");
  }
}

export async function bulkUpdateStudentRenewals(studentIds: number[], newRenewedState: boolean): Promise<void> {
  const batch = writeBatch(db);
  studentIds.forEach(id => {
    const studentRef = doc(db, STUDENTS_COLLECTION, id.toString());
    batch.update(studentRef, { renewed: newRenewedState });
  });
  try {
    await batch.commit();
  } catch (error) {
    console.error("[FirestoreService] Error bulk updating student renewals: ", error);
    throw new Error("Öğrenci kayıt durumları toplu güncellenemedi.");
  }
}
