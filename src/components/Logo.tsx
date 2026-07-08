import Image from 'next/image';

// Logo ITHECS. Remplace /public/logo.svg (ou dépose /public/logo.png)
// par le fichier officiel fourni si besoin — le fond transparent est conservé.
export default function Logo({
  className = '',
  width = 150,
  height = 38,
}: {
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <Image
      src="/logo.svg"
      alt="ITHECS"
      width={width}
      height={height}
      priority
      className={className}
    />
  );
}
