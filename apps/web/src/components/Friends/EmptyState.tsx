const EmptyState = ({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="text-center py-16">
    <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
      {icon}
    </div>
    <h3 className="text-white font-semibold mb-2 text-lg">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
      {description}
    </p>
  </div>
);

export default EmptyState;