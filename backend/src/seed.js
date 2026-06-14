require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Project = require('./models/Project');
const JoinRequest = require('./models/JoinRequest');
const SupervisionRequest = require('./models/SupervisionRequest');
const Message = require('./models/Message');
const FileDoc = require('./models/FileDoc');
const Notification = require('./models/Notification');

(async () => {
  await connectDB();
  console.log('Resetting database…');
  await Promise.all([
    User.deleteMany({}), Project.deleteMany({}), JoinRequest.deleteMany({}),
    SupervisionRequest.deleteMany({}), Message.deleteMany({}),
    FileDoc.deleteMany({}), Notification.deleteMany({}),
  ]);

  const [alice, bob, carol, dave] = await User.create([
    { fullName: 'Alice Student',   email: 'alice@uni.edu',   password: 'password', role: 'student',    department: 'CS',      skills: ['React', 'Node'] },
    { fullName: 'Bob Student',     email: 'bob@uni.edu',     password: 'password', role: 'student',    department: 'CS',      skills: ['Python'] },
    { fullName: 'Carol Student',   email: 'carol@uni.edu',   password: 'password', role: 'student',    department: 'CS',      skills: ['Design'] },
    { fullName: 'Dave Student',    email: 'dave@uni.edu',    password: 'password', role: 'student',    department: 'EE',      skills: ['ML'] },
  ]);
  const [sup1, sup2] = await User.create([
    { fullName: 'Dr. Smith',  email: 'smith@uni.edu',  password: 'password', role: 'supervisor', department: 'CS', interests: ['AI', 'Web'] },
    { fullName: 'Dr. Jones',  email: 'jones@uni.edu',  password: 'password', role: 'supervisor', department: 'EE', interests: ['IoT'] },
  ]);

  const p1 = await Project.create({
    title: 'Smart Campus Navigator',
    description: 'Indoor navigation using BLE beacons.',
    skills: ['React Native', 'Node.js', 'BLE'],
    maxMembers: 4,
    leader: alice._id,
    members: [],
  });

  console.log('\nSeed complete.');
  console.log('  Student leader:  alice@uni.edu / password   (owns project:', p1.title + ')');
  console.log('  Student (free):  bob@uni.edu / password');
  console.log('  Student (free):  carol@uni.edu / password');
  console.log('  Student (free):  dave@uni.edu / password');
  console.log('  Supervisor:      smith@uni.edu / password');
  console.log('  Supervisor:      jones@uni.edu / password');
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
