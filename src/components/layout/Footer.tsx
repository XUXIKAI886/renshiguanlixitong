import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto py-4">
        <div className="text-center text-sm text-muted-foreground">
          <span>© {currentYear} 呈尚策划 人事管理系统</span>
        </div>
      </div>
    </footer>
  );
}
