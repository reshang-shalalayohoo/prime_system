/**
 * Custom Palay (Rice) SVG Icon — coded icon matching the PRIME logo concept.
 * Golden rice grains on green stem with water drop.
 */
export default function PalayIcon({ size = 24, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Stem */}
      <path d="M24 42 C24 42 22 30 20 24 C18 18 22 8 28 4" stroke="#2d6a2e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      
      {/* Rice grains */}
      <ellipse cx="28" cy="7" rx="3.5" ry="5" transform="rotate(-30 28 7)" fill="#d4a843" stroke="#b8912e" strokeWidth="0.8" />
      <ellipse cx="30" cy="13" rx="3.5" ry="5" transform="rotate(-15 30 13)" fill="#dbb24d" stroke="#b8912e" strokeWidth="0.8" />
      <ellipse cx="28" cy="19" rx="3.5" ry="5" transform="rotate(5 28 19)" fill="#d4a843" stroke="#b8912e" strokeWidth="0.8" />
      <ellipse cx="24" cy="24" rx="3.5" ry="5" transform="rotate(15 24 24)" fill="#dbb24d" stroke="#b8912e" strokeWidth="0.8" />
      <ellipse cx="22" cy="17" rx="3" ry="4.5" transform="rotate(30 22 17)" fill="#c9982e" stroke="#b8912e" strokeWidth="0.8" />
      <ellipse cx="25" cy="11" rx="3" ry="4.5" transform="rotate(-5 25 11)" fill="#c9982e" stroke="#b8912e" strokeWidth="0.8" />
      
      {/* Leaf */}
      <path d="M20 28 C14 26 10 30 8 34 C12 33 18 31 20 28 Z" fill="#2d6a2e" />
      <path d="M20 28 C14 30 12 34 11 36 C15 34 19 31 20 28 Z" fill="#1e5420" />
      
      {/* Water drop */}
      <path d="M22 38 C22 38 19 42 19 44 C19 45.5 20.3 47 22 47 C23.7 47 25 45.5 25 44 C25 42 22 38 22 38 Z" fill="#5bb8e8" stroke="#3a9fd4" strokeWidth="0.6" />
      <ellipse cx="21.2" cy="43.5" rx="1" ry="1.3" fill="#8dd3f0" opacity="0.6" />
    </svg>
  )
}
