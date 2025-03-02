import Link from "next/link";
import { Github, Twitter, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">DCFR DAO</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              A decentralized file management system with DAO governance, built on Autonomys Network.
              Secure, transparent, and community-driven.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/harystyleseze/DCFR"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-300 hover:text-primary"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/autonomysxyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-300 hover:text-primary"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://autonomys.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-300 hover:text-primary"
              >
                <Globe className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/proposals/upload"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary"
                >
                  Upload Files
                </Link>
              </li>
              <li>
                <Link
                  href="/proposals/delete"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary"
                >
                  Delete Files
                </Link>
              </li>
              <li>
                <Link
                  href="/proposals/share"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary"
                >
                  Share Files
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary"
                >
                  DAO Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://docs.autonomys.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://blockscout.taurus.autonomys.xyz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary"
                >
                  Block Explorer
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/harystyleseze/DCFR"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary"
                >
                  GitHub Repository
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 text-center text-gray-600 dark:text-gray-300">
          <p>© 2025 DCFR DAO. Built on Autonomys Network.</p>
        </div>
      </div>
    </footer>
  );
} 