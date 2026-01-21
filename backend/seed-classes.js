require('dotenv').config();
const mongoose = require('mongoose');
const Class = require('./src/models/Class');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB conectado');
  } catch (error) {
    console.error('Error al conectar:', error);
    process.exit(1);
  }
};

const classes = [
  // LUNES
  {
    name: 'Ballet Mini 4-8 años',
    discipline: 'BALLET MINI',
    ageGroup: '4-8 años',
    level: 'principiante',
    teacher: 'DILIAN BUENFIL',
    dayOfWeek: 'lunes',
    startTime: '17:00',
    endTime: '18:00',
    duration: 60,
    salon: 2,
    price: 150
  },
  {
    name: 'Acro Dance 4 a 15 años',
    discipline: 'ACRO DANCE',
    ageGroup: '4-8 años',
    level: 'principiante',
    teacher: 'HARVEY',
    dayOfWeek: 'lunes',
    startTime: '18:00',
    endTime: '19:00',
    duration: 60,
    salon: 2,
    price: 180
  },
  {
    name: 'Jazz Teen 9 a 15 años',
    discipline: 'JAZZ TEEN',
    ageGroup: '9-15 años',
    level: 'principiante',
    teacher: 'DILIAN BUENFIL',
    dayOfWeek: 'lunes',
    startTime: '19:00',
    endTime: '20:00',
    duration: 60,
    salon: 2,
    price: 150
  },
  {
    name: 'Urbano Principiantes Adultos',
    discipline: 'URBANO PRINCIPIANTES ADULTOS',
    ageGroup: 'adultos',
    level: 'principiante',
    teacher: 'NAYELI ARGAEZ',
    dayOfWeek: 'lunes',
    startTime: '19:00',
    endTime: '20:00',
    duration: 60,
    salon: 1,
    price: 150
  },
  {
    name: 'Urbano Intermedio Adultos',
    discipline: 'URBANO INTERMEDIO ADULTOS',
    ageGroup: 'adultos',
    level: 'intermedio',
    teacher: 'SAAUNA SMITH',
    dayOfWeek: 'lunes',
    startTime: '20:00',
    endTime: '21:00',
    duration: 60,
    salon: 2,
    price: 170
  },
  {
    name: 'Jazz Adultos Prin-Intermedio',
    discipline: 'JAZZ ADULTOS PRIN-INTERMEDIO',
    ageGroup: 'adultos',
    level: 'intermedio',
    teacher: 'MARIANA',
    dayOfWeek: 'lunes',
    startTime: '20:00',
    endTime: '21:00',
    duration: 60,
    salon: 1,
    price: 170
  },
  {
    name: 'Heels Adultos Intermedio',
    discipline: 'HEELS ADULTOS INTERMEDIO',
    ageGroup: 'adultos',
    level: 'intermedio',
    teacher: 'DANIELA JIMM',
    dayOfWeek: 'lunes',
    startTime: '21:00',
    endTime: '22:00',
    duration: 60,
    salon: 1,
    price: 180
  },

  // MARTES
  {
    name: 'Jazz Mini 4-8 años',
    discipline: 'BALLET MINI',
    ageGroup: '4-8 años',
    level: 'principiante',
    teacher: 'JESSICA ARGAEZ',
    dayOfWeek: 'martes',
    startTime: '17:00',
    endTime: '18:00',
    duration: 60,
    salon: 1,
    price: 150
  },
  {
    name: 'Acro Mini 4-8 años',
    discipline: 'ACRO DANCE',
    ageGroup: '4-8 años',
    level: 'principiante',
    teacher: 'DILIAN BUENFIL',
    dayOfWeek: 'martes',
    startTime: '18:00',
    endTime: '19:00',
    duration: 60,
    salon: 2,
    price: 180
  },
  {
    name: 'Ballet Teens 9 a 15 años',
    discipline: 'BALLET MINI',
    ageGroup: '9-15 años',
    level: 'principiante',
    teacher: 'LORENA RINCÓN',
    dayOfWeek: 'martes',
    startTime: '18:00',
    endTime: '19:00',
    duration: 60,
    salon: 2,
    price: 150
  },
  {
    name: 'Acro Jazz Teen 9 a 15 años',
    discipline: 'ACRO DANCE',
    ageGroup: '9-15 años',
    level: 'intermedio',
    teacher: 'BELLA HERNÁNDEZ',
    dayOfWeek: 'martes',
    startTime: '19:00',
    endTime: '20:00',
    duration: 60,
    salon: 1,
    price: 180
  },
  {
    name: 'Reggaeton Principiante Adultos',
    discipline: 'URBANO/REGGAETON INTERMEDIO/AVANZADO',
    ageGroup: 'adultos',
    level: 'principiante',
    teacher: 'JESSICA ARGAEZ',
    dayOfWeek: 'martes',
    startTime: '19:00',
    endTime: '20:00',
    duration: 60,
    salon: 2,
    price: 150
  },
  {
    name: 'Urbano Teens- Adultos',
    discipline: 'URBANO TEENS',
    ageGroup: '15+ años',
    level: 'intermedio',
    teacher: 'JESSICA ARGAEZ',
    dayOfWeek: 'martes',
    startTime: '20:00',
    endTime: '21:00',
    duration: 60,
    salon: 1,
    price: 160
  },
  {
    name: 'Urbano/Reggaeton Intermedio/Avanzado',
    discipline: 'URBANO/REGGAETON INTERMEDIO/AVANZADO',
    ageGroup: 'adultos',
    level: 'intermedio/avanzado',
    teacher: 'NAYELI ARGAEZ',
    dayOfWeek: 'martes',
    startTime: '21:00',
    endTime: '22:00',
    duration: 60,
    salon: 1,
    price: 200
  },

  // MIÉRCOLES
  {
    name: 'Ballet Mini 4-8 años',
    discipline: 'BALLET MINI',
    ageGroup: '4-8 años',
    level: 'principiante',
    teacher: 'DILIAN BUENFIL',
    dayOfWeek: 'miércoles',
    startTime: '17:00',
    endTime: '18:00',
    duration: 60,
    salon: 2,
    price: 150
  },
  {
    name: 'Acro Dance 4 a 15 años',
    discipline: 'ACRO DANCE',
    ageGroup: '4-8 años',
    level: 'principiante',
    teacher: 'HARVEY',
    dayOfWeek: 'miércoles',
    startTime: '18:00',
    endTime: '19:00',
    duration: 60,
    salon: 2,
    price: 180
  },
  {
    name: 'Jazz Teen 9 a 15 años',
    discipline: 'JAZZ TEEN',
    ageGroup: '9-15 años',
    level: 'principiante',
    teacher: 'DILIAN BUENFIL',
    dayOfWeek: 'miércoles',
    startTime: '19:00',
    endTime: '20:00',
    duration: 60,
    salon: 2,
    price: 150
  },
  {
    name: 'Urbano Principiantes Adultos',
    discipline: 'URBANO PRINCIPIANTES ADULTOS',
    ageGroup: 'adultos',
    level: 'principiante',
    teacher: 'NAYELI ARGAEZ',
    dayOfWeek: 'miércoles',
    startTime: '19:00',
    endTime: '20:00',
    duration: 60,
    salon: 1,
    price: 150
  },
  {
    name: 'Urbano Intermedio Adultos',
    discipline: 'URBANO INTERMEDIO ADULTOS',
    ageGroup: 'adultos',
    level: 'intermedio',
    teacher: 'SAAUNA SMITH',
    dayOfWeek: 'miércoles',
    startTime: '20:00',
    endTime: '21:00',
    duration: 60,
    salon: 2,
    price: 170
  },
  {
    name: 'Jazz Adultos Prin-Intermedio',
    discipline: 'JAZZ ADULTOS PRIN-INTERMEDIO',
    ageGroup: 'adultos',
    level: 'intermedio',
    teacher: 'MARIANA',
    dayOfWeek: 'miércoles',
    startTime: '20:00',
    endTime: '21:00',
    duration: 60,
    salon: 1,
    price: 170
  },
  {
    name: 'Heels Adultos Intermedio',
    discipline: 'HEELS ADULTOS INTERMEDIO',
    ageGroup: 'adultos',
    level: 'intermedio',
    teacher: 'DANIELA JIMM',
    dayOfWeek: 'miércoles',
    startTime: '21:00',
    endTime: '22:00',
    duration: 60,
    salon: 1,
    price: 180
  },

  // JUEVES
  {
    name: 'Jazz Mini 4-8 años',
    discipline: 'BALLET MINI',
    ageGroup: '4-8 años',
    level: 'principiante',
    teacher: 'JESSICA ARGAEZ',
    dayOfWeek: 'jueves',
    startTime: '17:00',
    endTime: '18:00',
    duration: 60,
    salon: 1,
    price: 150
  },
  {
    name: 'Hip Hop Mini 4-8 años',
    discipline: 'HIP HOP MINI',
    ageGroup: '4-8 años',
    level: 'principiante',
    teacher: 'NAYELI ARGAEZ',
    dayOfWeek: 'jueves',
    startTime: '18:00',
    endTime: '19:00',
    duration: 60,
    salon: 1,
    price: 150
  },
  {
    name: 'K-Pop Teen 9 a 15 años',
    discipline: 'K-POP TEEN',
    ageGroup: '9-15 años',
    level: 'principiante',
    teacher: 'BELLA HERNÁNDEZ',
    dayOfWeek: 'jueves',
    startTime: '19:00',
    endTime: '20:00',
    duration: 60,
    salon: 1,
    price: 160
  },
  {
    name: 'Jazz Teen 9 a 15 años',
    discipline: 'JAZZ TEEN',
    ageGroup: '9-15 años',
    level: 'intermedio',
    teacher: 'BELLA HERNÁNDEZ',
    dayOfWeek: 'jueves',
    startTime: '19:00',
    endTime: '20:00',
    duration: 60,
    salon: 2,
    price: 150
  }
];

const seedClasses = async () => {
  try {
    await connectDB();

    // Limpiar colección de clases
    await Class.deleteMany({});
    console.log('Clases existentes eliminadas');

    // Agregar maxCapacity a cada clase según el salón
    const classesWithCapacity = classes.map(cls => ({
      ...cls,
      maxCapacity: cls.salon === 1 ? 25 : 12
    }));

    // Insertar nuevas clases
    const inserted = await Class.insertMany(classesWithCapacity);
    console.log(`${inserted.length} clases insertadas exitosamente`);

    console.log('\nClases creadas:');
    inserted.forEach(cls => {
      console.log(`- ${cls.dayOfWeek} ${cls.startTime}: ${cls.name} (${cls.teacher}) - Salón ${cls.salon} (${cls.maxCapacity} cupos)`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error al poblar clases:', error);
    process.exit(1);
  }
};

seedClasses();
