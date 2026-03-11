import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, Phone } from "lucide-react";
import feitoPor from "@/assets/feito_por.png";

export const Footer = () => {
  return (
    <footer className="border-t bg-muted/50 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-lg font-bold">Luar Cosméticos</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Sua loja de cosméticos com os melhores produtos do mercado.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Institucional</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contato
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Atendimento</h3>
            <ul className="space-y-2 text-sm">
              <a href="https://wa.me/5581985986026" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                (81) 98598-6026
              </li>
              </a>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                contato@luarrcosmeticos.com
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Redes Sociais</h3>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/luarr.cosmeticos/" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>© 2025 Luar Cosméticos. Todos os direitos reservados.</p>
          <a href="https://wa.me/5581992196034" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <p>Desenvolvido por MiguelDev</p>
            <img
              src={feitoPor}
              alt="Desenvolvido por"
              className="h-10 opacity-100 duration-300"
            />
          </a>
        </div>
      </div>
    </footer>
  );
};
