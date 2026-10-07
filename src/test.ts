import assert from 'node:assert/strict';
import {
  bookAppointment,
  cancelAllPatientAppointments,
  deleteAppointment,
  getAppointmentFull,
  getDoctorUpcomingAppointments,
  setAppointmentStatus,
} from './appointments.js';
import { createDoctor, deleteDoctor, getDoctor, listDoctorsBySpecialty } from './doctors.js';
import { createPatient, deletePatient, getPatient, searchPatients, updatePatientPhone } from './patients.js';
import prisma from './lib/prisma.js';

async function main(): Promise<void> {
  let patientId: number | undefined;
  let doctorId: number | undefined;
  const appointmentIds: number[] = [];

  try {
    console.log('\n── Patients ──────────────────────────');
    const patient = await createPatient({
      name: 'Test Patient',
      email: `test.patient.${Date.now()}@example.com`,
      phone: '9999999999',
    });
    patientId = patient.id;
    console.log('Created:', patient.name, patient.id);

    const foundPatient = await getPatient(patient.id);
    assert.equal(foundPatient.id, patient.id);
    console.log('Found:', foundPatient.name);

    const updatedPatient = await updatePatientPhone(patient.id, '8888888888');
    assert.equal(updatedPatient.phone, '8888888888');
    console.log('Updated phone:', updatedPatient.phone);

    const patientResults = await searchPatients('Test Patient');
    assert(patientResults.some((result) => result.id === patient.id));
    console.log('Search results:', patientResults.length);

    console.log('\n── Doctors ───────────────────────────');
    const doctor = await createDoctor({
      name: 'Dr. Test',
      specialty: 'General Medicine',
      email: `dr.test.${Date.now()}@hospital.io`,
    });
    doctorId = doctor.id;
    console.log('Created:', doctor.name, doctor.id);

    const foundDoctor = await getDoctor(doctor.id);
    assert.equal(foundDoctor.id, doctor.id);
    const specialists = await listDoctorsBySpecialty('General Medicine');
    assert(specialists.some((result) => result.id === doctor.id));
    console.log('General Medicine doctors:', specialists.length);

    console.log('\n── Appointments ──────────────────────');
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + 1);
    const appointment = await bookAppointment(
      patient.id,
      doctor.id,
      appointmentDate,
      'Initial consultation',
    );
    appointmentIds.push(appointment.id);
    assert.equal(appointment.patient.name, patient.name);
    assert.equal(appointment.doctor.name, doctor.name);
    console.log('Booked:', appointment.id, 'for', appointment.patient.name);

    const fullAppointment = await getAppointmentFull(appointment.id);
    assert.equal(fullAppointment.patient.id, patient.id);
    assert.equal(fullAppointment.doctor.id, doctor.id);
    console.log('Full fetch:', fullAppointment.patient.name, 'with', fullAppointment.doctor.name);

    const upcomingAppointments = await getDoctorUpcomingAppointments(doctor.id);
    assert(upcomingAppointments.some((result) => result.id === appointment.id));
    console.log('Doctor schedule:', upcomingAppointments.length, 'appointment(s)');

    const updatedStatus = await setAppointmentStatus(appointment.id, 'cancelled');
    assert.equal(updatedStatus.status, 'cancelled');
    console.log('Status updated to:', updatedStatus.status);

    const secondAppointment = await bookAppointment(
      patient.id,
      doctor.id,
      new Date(appointmentDate.getTime() + 60 * 60 * 1000),
    );
    appointmentIds.push(secondAppointment.id);
    const cancelledCount = await cancelAllPatientAppointments(patient.id);
    assert.equal(cancelledCount, 1);
    console.log('Scheduled patient appointments cancelled:', cancelledCount);

    let restrictionHandled = false;
    try {
      await deleteDoctor(doctor.id);
    } catch (error: unknown) {
      restrictionHandled = error instanceof Error && error.message.includes('appointments');
    }
    assert(restrictionHandled, 'Deleting a doctor with appointments should report the FK restriction.');
    console.log('Doctor deletion restriction: handled');

    await deleteAppointment(appointment.id);
    appointmentIds.splice(appointmentIds.indexOf(appointment.id), 1);
    console.log('Appointment deleted:', appointment.id);

    await deletePatient(patient.id);
    patientId = undefined;
    const cascadedAppointment = await prisma.appointment.findUnique({ where: { id: secondAppointment.id } });
    assert.equal(cascadedAppointment, null, 'Deleting a patient should cascade to their appointments.');
    appointmentIds.splice(appointmentIds.indexOf(secondAppointment.id), 1);
    console.log('Patient deletion cascade: verified');

    await deleteDoctor(doctor.id);
    doctorId = undefined;
    console.log('Doctor deleted after appointments were removed.');

    console.log('\nAll CRUD and relation checks passed.');
  } finally {
    if (appointmentIds.length > 0) {
      await prisma.appointment.deleteMany({ where: { id: { in: appointmentIds } } });
    }
    if (patientId !== undefined) {
      await prisma.patient.deleteMany({ where: { id: patientId } });
    }
    if (doctorId !== undefined) {
      await prisma.doctor.deleteMany({ where: { id: doctorId } });
    }
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
