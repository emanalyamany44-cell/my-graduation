import React, { useEffect, useState } from 'react';
import { Users, Clock, Calendar, ArrowRight } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

const Home = ({ goTo }) => {
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  useEffect(() => { api.myProject().then(({ project }) => setProject(project)).catch(() => {}); }, []);

  const memberCount = project ? (project.members?.length || 0) + 1 : 0;
  const statusLabel = project
    ? (project.supervisorStatus === 'approved' ? 'Approved'
      : project.supervisorStatus === 'requested' ? 'Pending Supervisor'
      : 'No Supervisor')
    : 'No Project';

  return (
    <div className="animate-fade-in max-w-6xl">
      <header className="mb-8">
        <h2 className="text-4xl font-bold text-navy">Dashboard Overview</h2>
        <p className="text-gray-500 font-medium mt-1">Welcome back, {user.fullName.split(' ')[0]}!</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Stat icon={<Users size={28} />} color="blue" label="My Team"
          value={project ? `${memberCount}/${project.maxMembers} Members` : 'No team yet'} />
        <Stat icon={<Clock size={28} />} color="yellow" label="Project Status" value={statusLabel} />
        <Stat icon={<Calendar size={28} />} color="green" label="Role" value={user.role} />
      </div>

      <div className="bg-navy rounded-3xl p-8 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-10 -mt-20"></div>
        <div className="relative z-10">
          <h3 className="text-3xl font-bold text-white mb-2">
            {project ? project.title : 'You have no project yet'}
          </h3>
          <p className="text-blue-100 mb-6 max-w-md">
            {project
              ? `Status: ${statusLabel}.`
              : 'Create your own project from "My Team", or browse open projects to join.'}
          </p>
          <button onClick={() => goTo?.(project ? 'team' : 'find')}
            className="bg-white text-navy px-6 py-2 rounded-full font-bold shadow-sm hover:bg-gray-100 transition inline-flex items-center gap-2">
            {project ? 'View Team' : 'Browse Projects'} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const Stat = ({ icon, color, label, value }) => {
  const colors = { blue: 'bg-blue-50 text-blue-600', yellow: 'bg-yellow-50 text-yellow-600', green: 'bg-green-50 text-green-600' };
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`${colors[color]} p-4 rounded-2xl`}>{icon}</div>
      <div>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
        <h3 className="text-xl font-bold text-navy capitalize">{value}</h3>
      </div>
    </div>
  );
};

export default Home;
