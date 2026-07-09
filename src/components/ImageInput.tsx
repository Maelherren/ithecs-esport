'use client';

import { useState } from 'react';
import imageCompression from 'browser-image-compression';

// Champ fichier image qui compresse le fichier côté client AVANT l'envoi
// (remplace les fichiers de l'input par la version compressée via DataTransfer).
export default function ImageInput({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    // On ne recompresse pas les GIF (animation) ni les fichiers déjà légers.
    if (file.type === 'image/gif' || file.size < 200 * 1024) return;

    try {
      setBusy(true);
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        fileType: file.type,
      });
      const named = new File([compressed], file.name, {
        type: compressed.type,
        lastModified: Date.now(),
      });
      const dt = new DataTransfer();
      dt.items.add(named);
      input.files = dt.files;
    } catch (err) {
      // En cas d'échec, on laisse le fichier original : l'upload fonctionne quand même.
      console.error('[image] Compression échouée, envoi de l’original :', err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <input type="file" name={name} accept="image/*" onChange={onChange} className={className} />
      {busy && <p className="mt-1 text-xs text-accent">Optimisation de l’image…</p>}
    </>
  );
}
