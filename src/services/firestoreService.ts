// src/services/firestoreService.ts
import {
  collection,
  doc,
  getDocs,
  writeBatch,
  updateDoc,
  query,
  where,
  deleteDoc,
  runTransaction
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Student, Teacher } from '@/types';

const STUDENTS_COLLECTION = 'students';
const TEACHERS_COLLECTION = 'teachers';

export async function getStudents(): Promise<Student[]> {
  try {
    const snapshot = await getDocs(collection(db, STUDENTS_COLLECTION));
    return snapshot.docs.map(doc => doc.data() as Student);
  } catch (error) {
    console.error("Error fetching students: ", error);
    throw new Error("Öğrenci verileri alınamadı.");
  }
}

export async function getTeachers(): Promise<Teacher[]> {
  try {
    const snapshot = await getDocs(collection(db, TEACHERS_COLLECTION));
    return snapshot.docs.map(doc => doc.data() as Teacher);
  } catch (error) {
    console.error("Error fetching teachers: ", error);
    throw new Error("Öğretmen verileri alınamadı.");
  }
}

export async function uploadStudentsAndTeachers(students: Student[], teachers: Teacher[]): Promise<void> {
  const batch = writeBatch(db);

  // Önce mevcut tüm öğrencileri ve öğretmenleri sil (opsiyonel, üzerine yazmak yerine temiz bir başlangıç için)
  // Bu kısım dikkatli kullanılmalı, büyük veri setlerinde maliyetli olabilir.
  // Alternatif olarak, her bir dokümanı setDoc ile üzerine yazabilirsiniz.
  try {
    const oldStudentsSnap = await getDocs(collection(db, STUDENTS_COLLECTION));
    oldStudentsSnap.forEach(doc => batch.delete(doc.ref));
    const oldTeachersSnap = await getDocs(collection(db, TEACHERS_COLLECTION));
    oldTeachersSnap.forEach(doc => batch.delete(doc.ref));
  } catch(error) {
    console.warn("Error clearing old data (proceeding with upload): ", error);
    // Silme işlemi başarısız olursa bile yüklemeye devam etmeyi deneyebiliriz.
    // Ya da burada hata fırlatıp işlemi durdurabiliriz. Şimdilik devam edelim.
  }


  students.forEach(student => {
    // Firestore document ID'leri string olmalı, student.id number olduğu için string'e çeviriyoruz.
    // Saklanan student nesnesindeki `id` alanı number olarak kalacak.
    const studentRef = doc(db, STUDENTS_COLLECTION, student.id.toString());
    batch.set(studentRef, student);
  });

  teachers.forEach(teacher => {
    const teacherRef = doc(db, TEACHERS_COLLECTION, teacher.id.toString());
    batch.set(teacherRef, teacher);
  });

  try {
    await batch.commit();
  } catch (error) {
    console.error("Error committing batch upload: ", error);
    throw new Error("Veriler Firestore'a yüklenirken bir hata oluştu.");
  }
}

export async function updateStudentRenewal(studentId: number, renewed: boolean): Promise<void> {
  const studentRef = doc(db, STUDENTS_COLLECTION, studentId.toString());
  try {
    await updateDoc(studentRef, { renewed });
  } catch (error) {
    console.error(`Error updating student renewal status for ${studentId}: `, error);
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
    console.error("Error bulk updating student renewals: ", error);
    throw new Error("Öğrenci kayıt durumları toplu güncellenemedi.");
  }
}
