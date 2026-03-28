const StatsCard = ({ icon: Icon, label, value, color = 'primary', trend }) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    accent: 'bg-accent-50 text-accent-600',
    danger: 'bg-danger-50 text-danger-600',
    warning: 'bg-warning-50 text-warning-500',
  };

  return (
    <div className="card group hover:scale-[1.02] transition-transform duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-dark-400 font-medium">{label}</p>
          <p className="text-2xl font-bold text-dark-900 mt-1">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 font-medium ${trend > 0 ? 'text-accent-500' : 'text-danger-500'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last week
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="text-2xl" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
