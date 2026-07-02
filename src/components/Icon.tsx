import {
  Calendar, List, BarChart2, Settings, Plus, ChevronLeft, ChevronRight,
  Check, X, Trash2, Edit2, Clock, ChevronDown, ChevronUp, ArrowLeft,
  Bell, User, Link, Info, AlertCircle, CheckCircle, Circle, Repeat,
  Sun, Moon, Sunset, Coffee, Smile, Meh, Frown, Heart, Briefcase,
  DollarSign, BookOpen, Leaf, Home, LogOut, MoreHorizontal
} from 'lucide-react';

const ICONS = {
  calendar: Calendar, list: List, chart: BarChart2, settings: Settings,
  plus: Plus, 'chevron-left': ChevronLeft, 'chevron-right': ChevronRight,
  check: Check, x: X, trash: Trash2, edit: Edit2, clock: Clock,
  'chevron-down': ChevronDown, 'chevron-up': ChevronUp, 'arrow-left': ArrowLeft,
  bell: Bell, user: User, link: Link, info: Info, alert: AlertCircle,
  'check-circle': CheckCircle, circle: Circle, repeat: Repeat,
  sun: Sun, moon: Moon, sunset: Sunset, coffee: Coffee,
  smile: Smile, meh: Meh, frown: Frown, heart: Heart,
  briefcase: Briefcase, dollar: DollarSign, book: BookOpen,
  leaf: Leaf, home: Home, logout: LogOut, more: MoreHorizontal,
} as const;

type IconName = keyof typeof ICONS;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 1.5, className }: IconProps) {
  const Component = ICONS[name];
  if (!Component) return null;
  return <Component size={size} color={color} strokeWidth={strokeWidth} className={className} />;
}
