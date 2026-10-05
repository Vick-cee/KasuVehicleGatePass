import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DemoQuickBar from '../components/DemoQuickBar';

export const UserLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <DemoQuickBar />
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
export default UserLayout;
