import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <Loader2 className={`${sizes[size]} animate-spin text-primary-500`} />
    </div>
  );
}
