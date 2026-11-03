import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-background sm:mt-24">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:px-8 md:py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 md:gap-10">
          <div>
            <div className="text-base font-semibold text-foreground">
              SOS India
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Maritime consultancy and training for vessel operations, hazardous
              materials, surveys, and ship recycling.
            </p>
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">Explore</div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/services" className="hover:text-foreground">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/training" className="hover:text-foreground">Training and courses</Link>
              </li>
              <li>
                <Link to="/insights" className="hover:text-foreground">Insights</Link>
              </li>
              <li><Link to="/faq" className="hover:text-foreground">FAQs</Link></li>
              <li><Link to="/about" className="hover:text-foreground">About SOS India</Link></li>
              <li><Link to="/credentials" className="hover:text-foreground">Credentials</Link></li>
              <li><Link to="/certificate-verification" className="hover:text-foreground">Verify a certificate</Link></li>
              <li><Link to="/careers" className="hover:text-foreground">Careers</Link></li>
              <li>
                <Link to="/contact" className="hover:text-foreground">Contact and request a quote</Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">
              Office: SOS India
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Office no G-05, Plot no. 53, Punit Tower-2,
              <br />
              Sector 11, CBD Belapur,
              <br />
              Navi Mumbai, Maharashtra 400614
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
              <li>
                <span className="text-foreground">Email:</span>{" "}
                <a href="mailto:info@sosindi.com" className="hover:text-foreground">info@sosindi.com</a>
              </li>
              <li>
                <span className="text-foreground">Contact:</span>{" "}
                <a href="tel:+918356929017" className="hover:text-foreground">+91 83569 29017</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} SOS India. All rights reserved.</span>
          <a
            href="https://cureo-r5nw.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm sm:text-base font-semibold text-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
          >
            Platform Developed by CUREO Developers
          </a>
        </div>
      </div>
    </footer>
  );
}
