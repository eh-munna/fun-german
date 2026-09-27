function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-line py-8">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="font-serif text-[15px] text-muted">
          © {currentYear} FunGerman · Developed by{' '}
          <span className="text-text">Emran Hussain Munna</span>
        </p>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-muted">
          <a href="/privacy" className="hover:text-accent">
            Privacy Policy
          </a>
          <a href="/copyright" className="hover:text-accent">
            Copyright &amp; Legal
          </a>
          <a href="/contact" className="hover:text-accent">
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
