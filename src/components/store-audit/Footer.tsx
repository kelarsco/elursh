import { FadeIn } from "@/components/FadeIn";

const Footer = () => {
  return (
    <footer className="section-dark py-12 border-t border-dark-fg/10">
      <div className="container-section text-center">
        <FadeIn>
          <p className="font-display font-semibold text-dark-fg text-lg">Store Audit Pro</p>
          <p className="mt-2 text-dark-fg/50 font-body text-sm">
            Helping ecommerce store owners build profitable, trustworthy brands.
          </p>
          <p className="mt-6 text-dark-fg/30 font-body text-xs">
            © {new Date().getFullYear()} Store Audit Pro. All rights reserved.
          </p>
        </FadeIn>
      </div>
    </footer>
  );
};

export default Footer;
