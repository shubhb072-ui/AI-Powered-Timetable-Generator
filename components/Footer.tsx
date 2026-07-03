import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="text-center py-6 mt-8 text-sm text-gray-500 dark:text-gray-400">
      <p>
        &copy; {new Date().getFullYear()} Smart Timetable Scheduler. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
