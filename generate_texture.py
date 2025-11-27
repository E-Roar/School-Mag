import random
import math

def generate_moon_svg():
    width = 1024
    height = 1024
    
    # Base color
    bg_color = "#e0e5ec"
    shadow_color = "#a3b1c6"
    highlight_color = "#ffffff"
    
    svg_content = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">',
        f'<rect width="100%" height="100%" fill="{bg_color}"/>',
        '<defs>',
        # Filter for the Crater Look (Inner Shadow + Outer Rim)
        '<filter id="crater" x="-50%" y="-50%" width="200%" height="200%">',
            # 1. Create the hole depth (Inner Shadow)
            # Dark shadow on Top-Left (light source is Top-Left, so inside wall Top-Left is dark)
            '<feOffset dx="4" dy="4" in="SourceAlpha" result="shadowOffset"/>',
            '<feGaussianBlur stdDeviation="3" in="shadowOffset" result="shadowBlur"/>',
            '<feComposite operator="out" in="shadowBlur" in2="SourceAlpha" result="innerShadow"/>',
            '<feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0" in="innerShadow" result="finalInnerShadow"/>',
            
            # Light highlight on Bottom-Right (inside wall facing light)
            '<feOffset dx="-4" dy="-4" in="SourceAlpha" result="highlightOffset"/>',
            '<feGaussianBlur stdDeviation="3" in="highlightOffset" result="highlightBlur"/>',
            '<feComposite operator="out" in="highlightBlur" in2="SourceAlpha" result="innerHighlight"/>',
            '<feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.5 0" in="innerHighlight" result="finalInnerHighlight"/>',

            # 2. Create the Rim (Outer Bevel)
            # Highlight on Top-Left Rim
            '<feOffset dx="2" dy="2" in="SourceAlpha" result="rimLightOffset"/>', # Shift down-right to mask
            '<feComposite operator="out" in="SourceAlpha" in2="rimLightOffset" result="rimLightMask"/>',
            '<feGaussianBlur stdDeviation="1" in="rimLightMask" result="rimLightBlur"/>',
            '<feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.8 0" in="rimLightBlur" result="finalRimLight"/>',

            # Shadow on Bottom-Right Rim
            '<feOffset dx="-2" dy="-2" in="SourceAlpha" result="rimShadowOffset"/>',
            '<feComposite operator="out" in="SourceAlpha" in2="rimShadowOffset" result="rimShadowMask"/>',
            '<feGaussianBlur stdDeviation="1" in="rimShadowMask" result="rimShadowBlur"/>',
            '<feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.3 0" in="rimShadowBlur" result="finalRimShadow"/>',

            # Merge all
            '<feMerge>',
                '<feMergeNode in="finalInnerShadow"/>',
                '<feMergeNode in="finalInnerHighlight"/>',
                '<feMergeNode in="finalRimLight"/>',
                '<feMergeNode in="finalRimShadow"/>',
            '</feMerge>',
        '</filter>',
        
        # Noise Filter for Surface Texture (Regolith)
        '<filter id="noise">',
            '<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>',
            '<feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.05 0"/>',
        '</filter>',
        '</defs>',
        
        # Apply Noise Background
        f'<rect width="100%" height="100%" filter="url(#noise)" opacity="0.6"/>',
    ]
    
    # Generate Craters
    # Format: (count, min_radius, max_radius)
    layers = [
        (15, 60, 100),  # Large
        (40, 30, 50),   # Medium
        (150, 10, 25),  # Small
        (400, 2, 8)     # Tiny pockmarks
    ]
    
    for count, min_r, max_r in layers:
        for _ in range(count):
            cx = random.randint(0, width)
            cy = random.randint(0, height)
            r = random.randint(min_r, max_r)
            
            # Randomize opacity slightly for realism
            opacity = random.uniform(0.7, 1.0)
            
            svg_content.append(
                f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{bg_color}" filter="url(#crater)" opacity="{opacity}"/>'
            )
            
    svg_content.append('</svg>')
    
    with open('public/moon-texture.svg', 'w') as f:
        f.write('\n'.join(svg_content))

if __name__ == "__main__":
    generate_moon_svg()
