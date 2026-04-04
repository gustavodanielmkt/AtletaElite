import { useState, useEffect } from 'react';

const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;

interface ExerciseGifProps {
  exerciseId: string;
  alt: string;
  className?: string;
}

export default function ExerciseGif({ exerciseId, alt, className }: ExerciseGifProps) {
  const [src, setSrc] = useState<string>('');

  useEffect(() => {
    if (!exerciseId) return;
    let objectUrl = '';

    fetch(`https://exercisedb.p.rapidapi.com/exercises/image/${exerciseId}`, {
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
      },
    })
      .then(res => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.blob();
      })
      .then(blob => {
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(err => { console.error('[ExerciseGif] fetch failed:', err); setSrc(''); });

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [exerciseId]);

  if (!src) {
    return (
      <div className={`bg-slate-800 flex items-center justify-center ${className}`}>
        <div className="w-6 h-6 border-2 border-slate-600 border-t-[#ccff00] rounded-full animate-spin" />
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} />;
}
