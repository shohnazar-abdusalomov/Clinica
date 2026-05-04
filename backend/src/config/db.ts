import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'cashier',
        doctor_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS doctors (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        specialization VARCHAR(100) NOT NULL,
        experience INTEGER DEFAULT 0,
        phone VARCHAR(30),
        email VARCHAR(100),
        status VARCHAR(20) DEFAULT 'active',
        rating DECIMAL(3,2) DEFAULT 5.0,
        patients_count INTEGER DEFAULT 0,
        bio TEXT,
        schedule JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS patients (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        age INTEGER,
        gender VARCHAR(10),
        phone VARCHAR(30) NOT NULL,
        email VARCHAR(100),
        address TEXT,
        blood_type VARCHAR(5),
        status VARCHAR(20) DEFAULT 'active',
        registered_at DATE DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS appointments (
        id VARCHAR(50) PRIMARY KEY,
        patient_id VARCHAR(50) REFERENCES patients(id) ON DELETE CASCADE,
        doctor_id VARCHAR(50) REFERENCES doctors(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        time VARCHAR(10) NOT NULL,
        status VARCHAR(30) DEFAULT 'scheduled',
        reason VARCHAR(255) NOT NULL,
        notes TEXT,
        room VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS prescriptions (
        id VARCHAR(50) PRIMARY KEY,
        patient_id VARCHAR(50) REFERENCES patients(id) ON DELETE CASCADE,
        doctor_id VARCHAR(50) REFERENCES doctors(id) ON DELETE CASCADE,
        appointment_id VARCHAR(50) REFERENCES appointments(id) ON DELETE SET NULL,
        date DATE DEFAULT NOW(),
        diagnosis TEXT NOT NULL,
        medications JSONB DEFAULT '[]',
        advice TEXT,
        next_visit DATE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(50) PRIMARY KEY,
        patient_id VARCHAR(50) REFERENCES patients(id) ON DELETE CASCADE,
        appointment_id VARCHAR(50) REFERENCES appointments(id) ON DELETE SET NULL,
        amount DECIMAL(15,2) DEFAULT 0,
        method VARCHAR(20) DEFAULT 'cash',
        status VARCHAR(20) DEFAULT 'pending',
        date DATE DEFAULT NOW(),
        description TEXT,
        cashier_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS medical_records (
        id VARCHAR(50) PRIMARY KEY,
        patient_id VARCHAR(50) REFERENCES patients(id) ON DELETE CASCADE,
        doctor_id VARCHAR(50) REFERENCES doctors(id) ON DELETE CASCADE,
        date DATE DEFAULT NOW(),
        type VARCHAR(50),
        diagnosis TEXT NOT NULL,
        treatment TEXT,
        notes TEXT,
        attachments JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Demo data seeding
    const { rows } = await client.query('SELECT COUNT(*) as count FROM users');
    if (parseInt(rows[0].count) === 0) {
      const adminHash = await bcrypt.hash('admin123', 10);
      const cashierHash = await bcrypt.hash('cashier123', 10);
      const doctorHash = await bcrypt.hash('doctor123', 10);

      await client.query(`
        INSERT INTO users (name, email, password, role, doctor_id) VALUES
        ('Administrator', 'admin@klinika.uz', $1, 'admin', null),
        ('Kassir Aziz', 'cashier@klinika.uz', $2, 'cashier', null),
        ('Dr. Alisher Karimov', 'doctor@klinika.uz', $3, 'doctor', 'd1')
      `, [adminHash, cashierHash, doctorHash]);

      await client.query(`
        INSERT INTO doctors (id, name, specialization, experience, phone, email, status, rating, patients_count, bio, schedule) VALUES
        ('d1','Dr. Alisher Karimov','Kardiolog',12,'+998 90 123 45 67','a.karimov@klinika.uz','active',4.9,142,'Yurak-qon tomir kasalliklari bo''yicha mutaxassis.','[{"day":"Dushanba","from":"09:00","to":"17:00"},{"day":"Chorshanba","from":"09:00","to":"17:00"}]'),
        ('d2','Dr. Malika Yusupova','Pediatr',8,'+998 91 234 56 78','m.yusupova@klinika.uz','active',4.8,215,'Bolalar salomatligi bo''yicha mutaxassis.','[{"day":"Dushanba","from":"08:00","to":"16:00"},{"day":"Seshanba","from":"08:00","to":"16:00"}]'),
        ('d3','Dr. Bobur Toshmatov','Nevropatolog',15,'+998 93 345 67 89','b.toshmatov@klinika.uz','active',4.7,98,'Asab tizimi kasalliklari bo''yicha mutaxassis.','[{"day":"Seshanba","from":"10:00","to":"18:00"},{"day":"Payshanba","from":"10:00","to":"18:00"}]'),
        ('d4','Dr. Nilufar Rashidova','Ginekolog',10,'+998 94 456 78 90','n.rashidova@klinika.uz','active',4.9,178,'Ayollar salomatligi bo''yicha mutaxassis.','[{"day":"Dushanba","from":"09:00","to":"17:00"},{"day":"Chorshanba","from":"09:00","to":"17:00"}]'),
        ('d5','Dr. Sardor Xolmatov','Jarroh',18,'+998 95 567 89 01','s.xolmatov@klinika.uz','active',4.8,64,'Umumiy jarrohlik bo''yicha mutaxassis.','[{"day":"Seshanba","from":"08:00","to":"15:00"},{"day":"Payshanba","from":"08:00","to":"15:00"}]'),
        ('d6','Dr. Zulfiya Mirzayeva','Terapevt',7,'+998 97 678 90 12','z.mirzayeva@klinika.uz','inactive',4.6,89,'Umumiy terapiya bo''yicha mutaxassis.','[{"day":"Dushanba","from":"09:00","to":"17:00"}]')
      `);

      await client.query(`
        INSERT INTO patients (id, name, age, gender, phone, email, address, blood_type, status, registered_at) VALUES
        ('p1','Jasur Ergashev',42,'male','+998 90 111 22 33','j.ergashev@mail.uz','Toshkent, Chilonzor t.','A+','active','2024-01-15'),
        ('p2','Dilnoza Hasanova',28,'female','+998 91 222 33 44','d.hasanova@gmail.com','Toshkent, Yunusobod t.','B+','active','2024-02-20'),
        ('p3','Murod Nazarov',55,'male','+998 93 333 44 55',null,'Samarqand, Mirzo Ulugbek','O-','active','2023-11-05'),
        ('p4','Shahlo Tursunova',34,'female','+998 94 444 55 66','s.tursunova@mail.ru','Toshkent, Sergeli t.','AB+','active','2024-03-10'),
        ('p5','Otabek Yusupov',19,'male','+998 95 555 66 77',null,'Farg''ona, Asaka','A-','active','2024-04-01'),
        ('p6','Gulnora Ismoilova',61,'female','+998 97 666 77 88',null,'Toshkent, Uchtepa t.','B-','inactive','2023-08-22'),
        ('p7','Farhod Rahimov',38,'male','+998 90 777 88 99','f.rahimov@yandex.uz','Namangan','O+','active','2024-01-30'),
        ('p8','Nargiza Qodirov',47,'female','+998 91 888 99 00',null,'Toshkent, Mirzo Ulugbek t.','A+','active','2023-12-15'),
        ('p9','Bekzod Sultonov',25,'male','+998 93 999 00 11',null,'Andijon','AB-','active','2024-04-20'),
        ('p10','Mohira Abdullayeva',52,'female','+998 94 000 11 22','m.abdullayeva@mail.uz','Buxoro','O+','active','2024-02-08')
      `);

      const today = new Date().toISOString().slice(0, 10);
      await client.query(`
        INSERT INTO appointments (id, patient_id, doctor_id, date, time, status, reason, room) VALUES
        ('a1','p1','d1',$1,'09:00','completed','Yurak og''rig''i','201'),
        ('a2','p2','d4',$1,'10:30','in_progress','Tekshiruv','105'),
        ('a3','p3','d1',$1,'11:00','scheduled','Bosim tekshiruv','201'),
        ('a4','p4','d2',$1,'14:00','scheduled','Bolalar tekshiruvi','302'),
        ('a5','p5','d3',$1,'09:30','scheduled','Bosh og''rig''i','410'),
        ('a7','p7','d1',$1,'11:30','scheduled','EKG tekshiruv','201')
      `, [today]);

      await client.query(`
        INSERT INTO payments (id, patient_id, appointment_id, amount, method, status, date, description) VALUES
        ('pay1','p1','a1',150000,'card','paid',$1,'Kardiolog konsultatsiyasi'),
        ('pay2','p2','a2',200000,'cash','pending',$1,'Ginekolog ko''rigi'),
        ('pay3','p3','a3',150000,'transfer','pending',$1,'Kardiolog konsultatsiyasi'),
        ('pay4','p4','a4',120000,'card','pending',$1,'Pediatr ko''rigi'),
        ('pay5','p5','a5',180000,'cash','pending',$1,'Nevropatolog konsultatsiyasi'),
        ('pay7','p7','a7',150000,'card','pending',$1,'Kardiolog konsultatsiyasi')
      `, [today]);

      console.log('✅ Demo ma\'lumotlar yaratildi');
    }

    console.log('✅ Database tables initialized');
  } finally {
    client.release();
  }
};

export default pool;
