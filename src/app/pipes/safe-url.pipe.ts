import { Pipe, PipeTransform } from '@angular/core';

/**
 * Encodes spaces (and other unsafe characters) in image URLs
 * so they work correctly inside CSS url() and HTML img src.
 * 
 * Usage in template:
 *   [ngStyle]="{ 'background-image': 'url(\'' + (imgUrl | safeUrl) + '\')' }"
 */
@Pipe({
  name: 'safeUrl',
  standalone: true
})
export class SafeUrlPipe implements PipeTransform {
  transform(url: string | null | undefined): string {
    if (!url) return '';
    // Encode spaces that break CSS url() and HTML attributes
    return url.replace(/ /g, '%20');
  }
}
