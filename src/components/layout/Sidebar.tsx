import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ArrowUpDown,
  PieChart,
  Target,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Sparkles,
  Repeat,
  Split,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: ArrowUpDown, label: 'Transactions', path: '/transactions' },
  { icon: Repeat, label: 'Recurring', path: '/recurring' },
  { icon: PieChart, label: 'Analytics', path: '/analytics' },
  { icon: Target, label: 'Budgets', path: '/budgets' },
  { icon: Split, label: 'Splitter', path: '/splitter' },
  { icon: Sparkles, label: 'AI Insights', path: '/insights' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  // Get user info
  const avatarUrl = '';
  const userName = user?.fullName || 'User';
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 z-40 h-screen border-r border-border bg-sidebar flex flex-col"
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-bold text-foreground">Pocket Pal</h1>
                <p className="text-xs text-muted-foreground">Smart Money</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {isCollapsed && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground mx-auto">
            <Wallet className="h-5 w-5" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-primary')} />
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && !isCollapsed && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto h-2 w-2 rounded-full bg-primary"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User profile & bottom actions */}
      <div className="p-4 border-t border-border space-y-3">
        {/* User profile */}
        <div className={cn(
          "flex items-center gap-3 px-2 py-2 rounded-xl bg-accent/50",
          isCollapsed && "justify-center px-0"
        )}>
          <Avatar className="h-9 w-9 flex-shrink-0">
            <AvatarImage src={avatarUrl} alt={userName} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <p className="text-sm font-medium text-foreground truncate max-w-[140px]">
                  {userName}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full justify-center"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </motion.aside>
  );
}
