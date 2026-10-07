import prisma from './lib/prisma.js';

async function main(): Promise<void> {
  // This is a development fixture seed: clear tables in foreign-key-safe order.
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.doctor.deleteMany();

  const drPriya = await prisma.doctor.create({
    data: {
      name: 'Dr. Priya Sharma',
      specialty: 'Cardiology',
      email: 'priya.sharma@hospital.io',
    },
  });

  const drVikram = await prisma.doctor.create({
    data: {
      name: 'Dr. Vikram Rao',
      specialty: 'Neurology',
      email: 'vikram.rao@hospital.io',
    },
  });

  const aditi = await prisma.patient.create({
    data: {
      name: 'Aditi Mehra',
      email: 'aditi@example.com',
      phone: '9876543210',
      dateOfBirth: new Date('1990-04-12'),
    },
  });

  const rahul = await prisma.patient.create({
    data: { name: 'Rahul Singh', email: 'rahul@example.com' },
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
  dayAfterTomorrow.setHours(14, 30, 0, 0);

  await prisma.appointment.create({
    data: {
      appointmentDate: tomorrow,
      status: 'scheduled',
      notes: 'Annual cardiac checkup',
      patientId: aditi.id,
      doctorId: drPriya.id,
    },
  });

  await prisma.appointment.create({
    data: {
      appointmentDate: dayAfterTomorrow,
      status: 'scheduled',
      patientId: rahul.id,
      doctorId: drVikram.id,
    },
  });

  console.log('Seed complete:');
  console.log(' Doctors:', 2);
  console.log(' Patients:', 2);
  console.log(' Appointments:', 2);
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
