import React from 'react';
import { Github, Linkedin, Mail, Coffee, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'GitHub',
      url: 'https://github.com/hemelo',
      icon: Github,
      color: 'hover:text-gray-400'
    },
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com/in/henriquefcmelo',
      icon: Linkedin,
      color: 'hover:text-blue-400'
    },
    {
      name: 'Email',
      url: 'mailto:hemelo@pm.me',
      icon: Mail,
      color: 'hover:text-red-400'
    },
    {
      name: 'Ko-fi',
      url: 'https://ko-fi.com/hemelodev',
      icon: Coffee,
      color: 'hover:text-yellow-400'
    }
  ];

  return (
    <footer className="bg-background/95 backdrop-blur-sm border-t border-border/50">
      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                RabbitMQ Simulator
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Interactive visual tool for learning and prototyping RabbitMQ message queue patterns.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Made with</span>
              <span className="text-red-500">❤️</span>
              <span>by</span>
              <a 
                href="https://hemelo.fyi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                Henrique Melo
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://www.rabbitmq.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  RabbitMQ Official
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://www.rabbitmq.com/getstarted.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  Getting Started Guide
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://www.rabbitmq.com/tutorials/tutorial-one-javascript.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  JavaScript Tutorial
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/hemelo/rabbitmq-simulator" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  Source Code
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Contact & Support</h4>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Questions, feedback, or suggestions? I'd love to hear from you!
              </p>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((link) => {
                  const IconComponent = link.icon;
                  return (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm font-medium ${link.color}`}
                      title={link.name}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="hidden sm:inline">{link.name}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-border/50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © {currentYear} Henrique Melo. All rights reserved.
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Built with React, TypeScript & Tailwind CSS</span>
              <div className="flex items-center gap-1">
                <span>Hosted on</span>
                <a 
                  href="https://vercel.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-foreground hover:underline"
                >
                  Vercel
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
