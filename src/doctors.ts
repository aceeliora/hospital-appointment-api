import { Prisma } from '../generated/prisma/client.js';
import prisma from './lib/prisma.js';

export interface CreateDoctorData {
  name: string;
  specialty: string;
  email: string;
}

export async function createDoctor(data: CreateDoctorData) {
  return prisma.doctor.create({ data });
}

export async function getDoctor(id: number) {
  const doctor = await prisma.doctor.findUnique({ where: { id } });
  if (doctor === null) throw new Error(`Doctor with id ${id} was not found`);
  return doctor;
}

export async function listDoctorsBySpecialty(specialty: string) {
  return prisma.doctor.findMany({
    where: { specialty: { contains: specialty } },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, specialty: true, email: true },
  });
}

// The database uses ON DELETE RESTRICT for appointments.doctor_id.
export async function deleteDoctor(id: number) {
  try {
    return await prisma.doctor.delete({ where: { id } });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      throw new Error('Cannot delete a doctor with appointments. Delete or reassign the appointments first.', { cause: error });
    }
    throw error;
  }
}
