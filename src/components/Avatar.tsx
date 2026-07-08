import Image from 'next/image';

// Avatar : image si disponible, sinon initiale sur fond bleu.
export default function Avatar({
  name,
  src,
  size = 96,
  highlight = false,
}: {
  name: string;
  src?: string | null;
  size?: number;
  highlight?: boolean;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover ring-2 ring-primary/60"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className={`flex items-center justify-center rounded-full font-display font-bold text-white ${
        highlight ? 'bg-gradient-to-br from-gold to-amber-600' : 'bg-gradient-to-br from-primary to-steel'
      }`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
