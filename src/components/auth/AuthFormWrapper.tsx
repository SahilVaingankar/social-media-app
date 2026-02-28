const AuthFormWrapper = ({
  children,
  footer,
}: Readonly<{
  children: React.ReactNode;
  footer?: React.ReactNode;
}>) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-lg bg-black/50 px-2 py-4 rounded-lg border border-green-700">
        <main>{children}</main>
        <footer className="mt-4">{footer}</footer>
      </div>
    </div>
  );
};

export default AuthFormWrapper;
