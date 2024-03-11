import {
  IconCheck,
  IconDeviceDesktop,
  IconEdit,
  IconEye,
  IconEyeOff,
  IconLoader2,
  IconMenu2,
  IconMoon,
  IconSettings,
  IconSun,
  IconX,
} from '@tabler/icons-react';

// https://heroicons.com/
import { cn } from '@/lib/utils';

type IconProps = React.HTMLAttributes<SVGElement>;

export const Icons = {
  homeFilled: (props: IconProps) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='currentColor'
      className={cn('h-6 w-6', props.className)}
      {...props}
    >
      <path d='M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z' />
      <path d='m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z' />
    </svg>
  ),
  menu: IconMenu2,
  close: IconX,
  spinner: IconLoader2,
  sun: IconSun,
  moon: IconMoon,
  monitor: IconDeviceDesktop,
  check: IconCheck,
  eye: IconEye,
  eyeOff: IconEyeOff,
  edit: IconEdit,
  settings: IconSettings,
};
