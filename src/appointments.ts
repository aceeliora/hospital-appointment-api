import prisma from './lib/prisma.js';

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

export async function bookAppointment(
  patientId: number,
  doctorId: number,
  date: Date,
  notes?: string,
) {
  return prisma.appointment.create({
    data: {
      appointmentDate: date,
      notes: notes ?? null,
      patient: { connect: { id: patientId } },
      doctor: { connect: { id: doctorId } },
    },
    include: {
      patient: { select: { name: true, email: true } },
      doctor: { select: { name: true, specialty: true } },
    },
  });
}

export async function getAppointmentFull(id: number) {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { patient: true, doctor: true },
  });
  if (appointment === null) throw new Error(`Appointment with id ${id} was not found`);
  return appointment;
}

export async function getDoctorUpcomingAppointments(doctorId: number) {
  return prisma.appointment.findMany({
    where: {
      doctorId,
      status: 'scheduled',
      appointmentDate: { gte: new Date() },
    },
    orderBy: { appointmentDate: 'asc' },
    include: { patient: { select: { name: true, phone: true } } },
  });
}

export async function setAppointmentStatus(id: number, status: AppointmentStatus) {
  return prisma.appointment.update({ where: { id }, data: { status } });
}

export async function cancelAllPatientAppointments(patientId: number) {
  const result = await prisma.appointment.updateMany({
    where: { patientId, status: 'scheduled' },
    data: { status: 'cancelled' },
  });
  return result.count;
}

export async function deleteAppointment(id: number) {
  return prisma.appointment.delete({ where: { id } });
}
