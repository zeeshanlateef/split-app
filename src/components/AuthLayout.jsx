const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* LEFT FORM */}
      <div className="flex items-center justify-center w-full md:w-1/2 bg-white p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="hidden md:flex w-1/2 items-center justify-center
        bg-gradient-to-br from-emerald-400 to-teal-600 text-white">

        <div className="text-center px-12">
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
          <p className="opacity-90">{subtitle}</p>
        </div>

      </div>
    </div>
  );
};

export default AuthLayout;
