import { FIDSON_LOGO_SRC } from '../assets/fidsonLogo';

interface FidsonLogoProps {
  size?: number;
  className?: string;
}

export default function FidsonLogo({ size = 40, className = '' }: FidsonLogoProps) {
  return (
    <img
      src={FIDSON_LOGO_SRC}
      alt="Fidson Healthcare"
      className={className}
      style={{ width: size, height: size, objectFit: 'contain', borderRadius: size * 0.1 }}
    />
  );
}
