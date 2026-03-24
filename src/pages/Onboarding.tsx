import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Onboarding() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !dob || !gender) {
      setError('Please fill in all fields');
      return;
    }

    // Clear any old demo data so user starts fresh
    localStorage.removeItem('financeiq_transactions');
    localStorage.removeItem('financeiq_budgets');
    localStorage.removeItem('financeiq_recurring');
    localStorage.removeItem('financeiq_splitter');

    login({ fullName: fullName.trim(), dob, gender, loggedIn: true });
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pocket Pal</h1>
            <p className="text-sm text-muted-foreground">Smart Money Tracking</p>
          </div>
        </div>

        {/* Form */}
        <div className="glass-card p-8">
          <h2 className="text-xl font-semibold text-foreground mb-1">Welcome!</h2>
          <p className="text-sm text-muted-foreground mb-6">Tell us a bit about yourself to get started.</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="Enter your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full h-12 text-base font-medium">
              Get Started
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
