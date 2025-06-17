export default function Footer() {
  return (
    <footer className="bg-background border-t border-border py-4 px-6">
      <div className="container mx-auto text-sm text-muted-foreground flex flex-col sm:flex-row justify-between items-center">
        <div>
          &copy; {new Date().getFullYear()} Student Progress Management System
        </div>
        <div className="mt-2 sm:mt-0">
          MERN Stack Application
        </div>
      </div>
    </footer>
  )
}
