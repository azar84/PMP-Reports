// Image SEO utilities
// This file is kept for potential future use with media library

export interface ImageMetadata {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  title?: string;
}

export function generateImageAlt(filename: string, context?: string): string {
  // Remove extension and replace separators with spaces
  const name = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  
  // Capitalize first letter of each word
  const formattedName = name.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return context ? `${formattedName} - ${context}` : formattedName;
}

export function optimizeImageUrl(url: string, width?: number, height?: number, quality = 80): string {
  // Basic image optimization
  // This can be extended to work with Cloudinary or other CDNs
  if (!url) return url;
  
  // If Cloudinary URL, add transformations
  if (url.includes('cloudinary.com')) {
    const parts = url.split('/upload/');
    if (parts.length === 2) {
      const transformations = [];
      if (width) transformations.push(`w_${width}`);
      if (height) transformations.push(`h_${height}`);
      transformations.push(`q_${quality}`);
      transformations.push('f_auto');
      
      return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
    }
  }
  
  return url;
}
